-- =============================================================================
-- Fotky, hlasové a video vzkazy
--
-- Vzpomínka má typ: dopis, fotka, hlas nebo video. Soubor leží v soukromém
-- úložišti "vzpominky" ve složce, která se jmenuje podle ID rodiče. Pravidla
-- úložiště pustí každého jen do jeho vlastní složky (a ke společným ukázkám
-- ve složce demo/, jen pro čtení).
-- =============================================================================

alter table public.letters
  add column kind text not null default 'dopis' check (kind in ('dopis', 'foto', 'hlas', 'video')),
  add column media_path text check (char_length(media_path) <= 300),
  add column media_mime text check (char_length(media_mime) <= 100),
  add column media_size integer check (media_size between 0 and 52428800),
  add column media_duration_ms integer check (media_duration_ms between 0 and 3600000);

grant insert (kind, media_path, media_mime, media_size, media_duration_ms) on public.letters to authenticated;
grant update (kind, media_path, media_mime, media_size, media_duration_ms) on public.letters to authenticated;

-- Soubor vzpomínky musí ležet ve složce jejího vlastníka (nebo jde o společnou ukázku).
-- Bez toho by šlo do vlastního vzkazu vložit cestu k cizímu souboru.
create or replace function private.check_media_path()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.media_path is not null and (
       new.media_path like '%..%'
       or not (new.media_path like new.owner_id::text || '/%' or new.media_path like 'demo/%')
     ) then
    raise exception 'Soubor vzpomínky musí patřit stejnému účtu.' using errcode = '42501';
  end if;
  if new.kind <> 'dopis' and tg_op = 'UPDATE' and old.kind <> new.kind then
    raise exception 'Typ vzpomínky nejde změnit.' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function private.check_media_path() from public, anon, authenticated;

create trigger t4_media_path before insert or update on public.letters
  for each row execute function private.check_media_path();

-- -----------------------------------------------------------------------------
-- Úložiště souborů: soukromé, max. 50 MB na soubor, jen obrázky, zvuk a video
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vzpominky', 'vzpominky', false, 52428800, array['image/*', 'audio/*', 'video/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Rodič čte své soubory a ukázky" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'vzpominky'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (storage.foldername(name))[1] = 'demo')
  );

create policy "Rodič nahrává jen do své složky" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'vzpominky' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Rodič mění jen své soubory" on storage.objects
  for update to authenticated
  using (bucket_id = 'vzpominky' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'vzpominky' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Rodič maže jen své soubory" on storage.objects
  for delete to authenticated
  using (bucket_id = 'vzpominky' and (storage.foldername(name))[1] = (select auth.uid())::text);
