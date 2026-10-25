-- Jalankan di Supabase: SQL Editor -> New query -> Run
-- Urutan: supabase_profile.sql dulu, baru file ini (aman dijalankan ulang).
-- Ganti "uondmguwobgfksgavuag" bila project Supabase-mu berbeda.

-- 1) Bucket foto profil: publik dibaca, maks 200 KB, hanya WebP/JPEG
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 204800, array['image/webp', 'image/jpeg'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- 2) Setiap pengguna hanya boleh mengelola satu file miliknya: <user_id>/avatar
drop policy if exists "avatars_select_own" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar');
create policy "avatars_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar');
create policy "avatars_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar')
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar');
create policy "avatars_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '/avatar');

-- 3) Avatar yang boleh tampil di komentar: foto upload sendiri (project ini, folder milik sendiri) atau Discord
create or replace function public.clean_avatar(m jsonb, uid uuid) returns text
language plpgsql stable set search_path = public, pg_temp as $$
declare av text;
begin
  av := m->>'avatar_custom';
  if av ~ ('^https://uondmguwobgfksgavuag\.supabase\.co/storage/v1/object/public/avatars/' || uid::text || '/avatar(\?v=[0-9]+)?$') then
    return av;
  end if;
  av := coalesce(m->>'avatar_url', m->>'picture');
  if av ~ '^https://(cdn|media)\.discordapp\.(com|net)/' then return av; end if;
  return null;
end $$;
revoke execute on function public.clean_avatar(jsonb, uuid) from public, anon, authenticated;

-- 4) Trigger komentar & sinkronisasi komentar lama memakai aturan di atas
create or replace function public.set_comment_author() returns trigger
language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare m jsonb;
begin
  if auth.uid() is null then raise exception 'Harus login'; end if;
  if exists (select 1 from public.comments where user_id = auth.uid() and created_at > now() - interval '10 seconds') then
    raise exception 'Terlalu cepat, coba lagi sebentar';
  end if;
  select raw_user_meta_data into m from auth.users where id = auth.uid();
  new.user_id := auth.uid();
  new.author_name := public.clean_name(m, auth.uid());
  new.avatar_url := public.clean_avatar(m, auth.uid());
  return new;
end $$;

create or replace function public.sync_my_comments() returns void
language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare m jsonb;
begin
  if auth.uid() is null then return; end if;
  select raw_user_meta_data into m from auth.users where id = auth.uid();
  update public.comments
     set author_name = public.clean_name(m, auth.uid()),
         avatar_url  = public.clean_avatar(m, auth.uid())
   where user_id = auth.uid();
end $$;
revoke execute on function public.sync_my_comments() from public, anon;
grant execute on function public.sync_my_comments() to authenticated;
