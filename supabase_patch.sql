-- Jalankan di Supabase: SQL Editor -> New query -> Run (aman dijalankan ulang)

-- 1) Daftar admin (boleh memakai nama "Admin" dsb). Tidak bisa diakses dari browser.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
-- Daftarkan akunmu (UUID ada di Authentication -> Users), hilangkan tanda "--" lalu isi:
-- insert into public.admins (user_id) values ('UUID-AKUNMU');

-- 2) Trigger komentar: cegah nama menyamar, batasi avatar hanya dari Discord
create or replace function public.set_comment_author() returns trigger
language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare m jsonb; n text; k text; av text;
begin
  if auth.uid() is null then raise exception 'Harus login'; end if;
  if exists (select 1 from public.comments where user_id = auth.uid() and created_at > now() - interval '10 seconds') then
    raise exception 'Terlalu cepat, coba lagi sebentar';
  end if;
  select raw_user_meta_data into m from auth.users where id = auth.uid();
  n := btrim(left(coalesce(m->>'full_name', m->>'name', m->>'user_name', ''), 60));
  k := lower(regexp_replace(n, '[^[:alnum:]]', '', 'g'));
  if n = '' then
    n := 'Anonim';
  elsif k ~ '(admin|moderator|staff|owner|allpirate|fletro)'
        and not exists (select 1 from public.admins where user_id = auth.uid()) then
    n := 'Pengguna';
  end if;
  av := coalesce(m->>'avatar_url', m->>'picture');
  if av is null or av !~ '^https://(cdn|media)\.discordapp\.(com|net)/' then av := null; end if;
  new.user_id := auth.uid();
  new.author_name := n;
  new.avatar_url := av;
  return new;
end $$;

-- 3) View jumlah komentar: jalankan dengan hak pemanggil (hilangkan peringatan linter)
alter view public.comment_counts set (security_invoker = true);
