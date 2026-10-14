-- Jalankan di Supabase: SQL Editor -> New query -> Run
create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_slug text not null check (char_length(post_slug) between 1 and 200),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null default 'Anonim',
  avatar_url text,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists comments_slug_idx on public.comments (post_slug, created_at desc);

alter table public.comments enable row level security;

drop policy if exists "comments_read" on public.comments;
drop policy if exists "comments_insert_own" on public.comments;
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_read" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy "comments_delete_own" on public.comments for delete to authenticated using (user_id = auth.uid());

-- Nama & foto diambil server-side dari akun login (tidak bisa dipalsukan dari browser)
-- + batas kecepatan: 1 komentar per 10 detik per pengguna
create or replace function public.set_comment_author() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare m jsonb;
begin
  if exists (select 1 from public.comments where user_id = auth.uid() and created_at > now() - interval '10 seconds') then
    raise exception 'Terlalu cepat, coba lagi sebentar';
  end if;
  select raw_user_meta_data into m from auth.users where id = auth.uid();
  new.user_id := auth.uid();
  new.author_name := left(coalesce(m->>'full_name', m->>'name', m->>'user_name', 'Anonim'), 60);
  new.avatar_url := coalesce(m->>'avatar_url', m->>'picture');
  return new;
end $$;

drop trigger if exists comments_set_author on public.comments;
create trigger comments_set_author before insert on public.comments
for each row execute function public.set_comment_author();

-- Hitung jumlah komentar per artikel (dipakai badge di daftar artikel)
create or replace view public.comment_counts as
  select post_slug, count(*)::int as total from public.comments group by post_slug;
grant select on public.comment_counts to anon, authenticated;
