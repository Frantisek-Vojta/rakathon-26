-- =============================================================================
-- Schránka vzpomínek: databázové schéma
--
-- Hlavní pravidlo: každý rodič vidí a mění JEN svoje děti a svoje dopisy.
-- Hlídá to přímo databáze (Row Level Security), ne jen aplikace. Ochrana tedy
-- platí i pro toho, kdo by appku obešel a volal API napřímo.
-- =============================================================================

-- Pomocné funkce dáváme do schématu "private", které není přes API vidět.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Tabulka: děti
-- -----------------------------------------------------------------------------
create table public.children (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  birth_date  date check (birth_date between date '1900-01-01' and date '2100-12-31'),
  description text check (char_length(description) <= 500),
  color       text not null default 'rose'
              check (color in ('rose', 'sage', 'peach', 'lavender', 'sky')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Kvůli složenému cizímu klíči v tabulce letters (viz níže).
  unique (id, owner_id)
);

create index children_owner_idx on public.children (owner_id, created_at);

-- -----------------------------------------------------------------------------
-- Tabulka: dopisy (vzkazy)
-- -----------------------------------------------------------------------------
create table public.letters (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  child_id    uuid not null,
  title       text not null default '' check (char_length(title) <= 120),
  body        text not null default '' check (char_length(body) <= 20000),
  status      text not null default 'koncept' check (status in ('koncept', 'hotovo')),
  occasion    text check (char_length(occasion) <= 80),
  paper       text not null default 'bezova'
              check (paper in ('bezova', 'ruzova', 'salvejova', 'merunkova', 'piskova')),
  font        text not null default 'lora' check (font in ('lora', 'nunito', 'caveat')),
  sticker     text check (sticker in ('srdce', 'kvetina', 'hvezda', 'medvidek', 'slunce', 'duha', 'obalka')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  finished_at timestamptz,
  -- Složený klíč: dopis smí patřit jen k dítěti STEJNÉHO rodiče.
  -- (Obyčejný cizí klíč by RLS nekontroloval a šlo by "přilepit" dopis k cizímu dítěti.)
  foreign key (child_id, owner_id) references public.children (id, owner_id) on delete cascade
);

create index letters_owner_idx on public.letters (owner_id, updated_at desc);
create index letters_child_idx on public.letters (child_id, owner_id);

-- -----------------------------------------------------------------------------
-- Triggery: vlastník, časy, stav dopisu, limity
-- -----------------------------------------------------------------------------

-- Vlastníka vždy určí přihlášený uživatel, z aplikace se nedá podvrhnout ani změnit.
-- (auth.uid() je prázdné jen u interních operací databáze, např. při vložení ukázkových dat.)
create or replace function private.set_owner_and_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null then
      new.owner_id   := auth.uid();
      new.created_at := now();
      new.updated_at := now();
    end if;
  else
    new.owner_id   := old.owner_id;
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

-- Čas dokončení dopisu nastavuje databáze podle změny stavu.
create or replace function private.set_letter_finished_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'hotovo' then
    if tg_op = 'INSERT' then
      new.finished_at := coalesce(new.finished_at, now());
    elsif old.status is distinct from 'hotovo' then
      new.finished_at := now();
    else
      new.finished_at := old.finished_at;
    end if;
  else
    new.finished_at := null;
  end if;
  return new;
end;
$$;

-- Ochrana proti zneužití: rozumné maximum záznamů na jeden účet.
create or replace function private.enforce_row_limits()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  existing integer;
begin
  if tg_table_name = 'children' then
    select count(*) into existing from public.children where owner_id = new.owner_id;
    if existing >= 20 then
      raise exception 'Na jeden účet lze uložit nejvýše 20 dětí.' using errcode = 'P0001';
    end if;
  else
    select count(*) into existing from public.letters where owner_id = new.owner_id;
    if existing >= 1000 then
      raise exception 'Na jeden účet lze uložit nejvýše 1000 vzkazů.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- Triggery se spouštějí v abecedním pořadí názvů: nejdřív vlastník, pak limity.
create trigger t1_owner_and_timestamps before insert or update on public.children
  for each row execute function private.set_owner_and_timestamps();
create trigger t2_row_limits before insert on public.children
  for each row execute function private.enforce_row_limits();

create trigger t1_owner_and_timestamps before insert or update on public.letters
  for each row execute function private.set_owner_and_timestamps();
create trigger t2_finished_at before insert or update on public.letters
  for each row execute function private.set_letter_finished_at();
create trigger t3_row_limits before insert on public.letters
  for each row execute function private.enforce_row_limits();

-- -----------------------------------------------------------------------------
-- Oprávnění: nepřihlášený (anon) nesmí nic. Přihlášený jen vybrané sloupce.
-- -----------------------------------------------------------------------------
revoke all on public.children, public.letters from anon, authenticated;

grant select, delete on public.children, public.letters to authenticated;
grant insert (name, birth_date, description, color) on public.children to authenticated;
grant update (name, birth_date, description, color) on public.children to authenticated;
grant insert (child_id, title, body, status, occasion, paper, font, sticker) on public.letters to authenticated;
grant update (child_id, title, body, status, occasion, paper, font, sticker) on public.letters to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security: každý řádek patří jednomu rodiči
-- -----------------------------------------------------------------------------
alter table public.children enable row level security;
alter table public.letters  enable row level security;

create policy "Rodič vidí své děti" on public.children
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Rodič přidává své děti" on public.children
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Rodič upravuje své děti" on public.children
  for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Rodič maže své děti" on public.children
  for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "Rodič vidí své vzkazy" on public.letters
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Rodič píše své vzkazy" on public.letters
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Rodič upravuje své vzkazy" on public.letters
  for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Rodič maže své vzkazy" on public.letters
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- -----------------------------------------------------------------------------
-- Smazání účtu (právo na výmaz): smaže uživatele i VŠECHNA jeho data
-- -----------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Nejste přihlášeni.' using errcode = '28000';
  end if;
  -- Díky "on delete cascade" zmizí i všechny děti a dopisy tohoto uživatele.
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

revoke execute on all functions in schema private from public, anon, authenticated;
