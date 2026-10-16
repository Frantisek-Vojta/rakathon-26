-- =============================================================================
-- Ukázková (fiktivní) data pro tlačítko „Vyzkoušet demo“
--
-- Každý demo návštěvník dostane vlastní anonymní účet a vlastní kopii dat.
-- Demo účty jsou od sebe oddělené stejně jako skutečné účty (RLS),
-- takže si je návštěvníci navzájem nemohou přepsat ani smazat.
-- Všechna jména a texty jsou smyšlené, žádná skutečná data pacientů.
-- =============================================================================

create or replace function private.seed_demo(uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  eliska uuid;
  matej  uuid;
  aneta  uuid;
begin
  if exists (select 1 from public.children where owner_id = uid) then
    return;
  end if;

  insert into public.children (owner_id, name, birth_date, description, color, created_at, updated_at)
  values (uid, 'Eliška', (current_date - interval '6 years 5 months')::date,
          'Naše zvídavá, laskavá a statečná holčička, která dělá svět kolem sebe krásnějším.',
          'rose', now() - interval '60 days', now() - interval '60 days')
  returning id into eliska;

  insert into public.children (owner_id, name, birth_date, description, color, created_at, updated_at)
  values (uid, 'Matěj', (current_date - interval '3 years 2 months')::date,
          'Malý stavitel, který nejraději staví vysoké věže a pak je s chutí boří.',
          'sage', now() - interval '59 days', now() - interval '59 days')
  returning id into matej;

  insert into public.children (owner_id, name, birth_date, description, color, created_at, updated_at)
  values (uid, 'Aneta', (current_date - interval '12 years 7 months')::date,
          'Naše malá velká slečna. Miluje knížky, koně a dlouhé rozhovory u večeře.',
          'lavender', now() - interval '58 days', now() - interval '58 days')
  returning id into aneta;

  insert into public.letters
    (owner_id, child_id, title, body, status, occasion, paper, font, sticker, created_at, updated_at, finished_at)
  values
    (uid, eliska, 'K tvým 7. narozeninám',
     E'Moje milá Eliško,\n\nsedm let! Pamatuješ, jak jsi letos v létě poprvé přeplavala celý bazén a pak jsi celá mokrá běžela za mnou, jestli jsem to viděla? Viděla. A byla jsem na tebe tak pyšná, že jsem skoro brečela.\n\nPřeju ti, aby tě život vedl tam, kde budeš šťastná. A když to někdy půjde ztěžka, vzpomeň si na ten bazén. Zvládla jsi to tenkrát a zvládneš to zase.\n\nS láskou\nmáma',
     'hotovo', 'K narozeninám', 'ruzova', 'caveat', 'srdce',
     now() - interval '40 days', now() - interval '38 days', now() - interval '38 days'),

    (uid, eliska, 'Na první den ve škole',
     E'Milá školačko,\n\ndneska jsi poprvé nesla aktovku, která byla skoro větší než ty. Ať je pro tebe škola místem, kde se budeš ráda ptát, objevovat a smát se s kamarády.\n\nNemusíš umět všechno hned. Stačí být zvědavá, a to ty umíš nejlíp.\n\nTvoje máma',
     'hotovo', 'První den ve škole', 'bezova', 'lora', 'hvezda',
     now() - interval '30 days', now() - interval '29 days', now() - interval '29 days'),

    (uid, eliska, 'Vzkaz, když budeš potřebovat sílu',
     E'Eliško,\n\nchci, abys vždycky věděla, že v tebe věřím. I ve dnech, kdy se ti nebude dařit a budeš mít pocit, že',
     'koncept', 'Až bude těžko', 'salvejova', 'lora', null,
     now() - interval '5 days', now() - interval '2 days', null),

    (uid, matej, 'Pohádka o odvážném medvídkovi',
     E'Byl jednou jeden malý medvídek, který se bál tmy. Každý večer si pod peřinou povídal s měsícem a ptal se ho, jestli se taky někdy bojí.\n\n„Taky,“ řekl měsíc. „Ale proto svítím. Když svítím já, nebojí se ostatní.“\n\nOd té doby si medvídek nechával pootevřené okno, aby na něj měsíc viděl. A víš, kdo byl ten medvídek? Ty, Matýsku.\n\nDobrou noc.',
     'hotovo', 'Na dobrou noc', 'piskova', 'nunito', 'medvidek',
     now() - interval '25 days', now() - interval '24 days', now() - interval '24 days'),

    (uid, matej, 'Až se naučíš jezdit na kole',
     E'Matýsku,\n\naž tohle budeš číst, možná už budeš jezdit bez koleček. Táta tě bude držet za sedlo a pak ho potichu pustí. Neboj se, když spadneš. Já jsem taky padala',
     'koncept', 'Až se naučíš jezdit na kole', 'merunkova', 'caveat', null,
     now() - interval '3 days', now() - interval '3 days', null),

    (uid, aneta, 'Náš výlet k moři',
     E'Aneto,\n\npamatuješ na to ráno, kdy jsme vstaly v pět, abychom viděly východ slunce nad mořem? Byla jsi rozespalá a protivná, a pak jsi najednou ztichla a chytila mě za ruku.\n\nTo je jedna z mých nejkrásnějších vzpomínek. Chci, abys ji měla i ty.\n\nMáma',
     'hotovo', null, 'salvejova', 'lora', 'slunce',
     now() - interval '20 days', now() - interval '19 days', now() - interval '19 days'),

    (uid, aneta, 'K tvým 18. narozeninám',
     E'Milá Aneto,\n\ndneska je ti osmnáct. Zkouším si tě představit: jestli máš pořád dlouhé vlasy, jestli pořád čteš pod peřinou s baterkou',
     'koncept', 'K 18. narozeninám', 'bezova', 'lora', null,
     now() - interval '1 day', now() - interval '1 day', null);
end;
$$;

revoke execute on function private.seed_demo(uuid) from public, anon, authenticated;

-- Po vytvoření anonymního (demo) účtu rovnou vložíme ukázková data.
-- Kdyby vložení selhalo, přihlášení nesmí spadnout, jen zapíšeme varování.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_anonymous then
    begin
      perform private.seed_demo(new.id);
    exception when others then
      raise warning 'seed_demo selhal pro %: %', new.id, sqlerrm;
    end;
  end if;
  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
