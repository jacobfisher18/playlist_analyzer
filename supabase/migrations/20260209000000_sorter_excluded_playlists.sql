-- Playlists excluded from "recommended playlists" in the Sorter.
-- Keyed by Spotify user and playlist ID.

create table if not exists public.sorter_excluded_playlists (
  spotify_user_id text not null,
  playlist_id text not null,
  created_at timestamptz not null default now(),
  primary key (spotify_user_id, playlist_id)
);

alter table public.sorter_excluded_playlists enable row level security;

drop policy if exists "Allow anon sorter_excluded_playlists" on public.sorter_excluded_playlists;
create policy "Allow anon sorter_excluded_playlists"
  on public.sorter_excluded_playlists for all to anon using (true) with check (true);
