-- Ephemeral cache for Spotify playlists and tracks. Safe to truncate anytime.

create table if not exists public.spotify_playlist_cache (
  spotify_user_id text not null,
  playlist_id text not null,
  snapshot_id text not null,
  playlist_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (spotify_user_id, playlist_id)
);

create table if not exists public.spotify_playlist_tracks_cache (
  spotify_user_id text not null,
  playlist_id text not null,
  snapshot_id text not null,
  tracks_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (spotify_user_id, playlist_id)
);

alter table public.spotify_playlist_cache enable row level security;
alter table public.spotify_playlist_tracks_cache enable row level security;

drop policy if exists "Allow anon spotify_playlist_cache" on public.spotify_playlist_cache;
create policy "Allow anon spotify_playlist_cache"
  on public.spotify_playlist_cache for all to anon using (true) with check (true);

drop policy if exists "Allow anon spotify_playlist_tracks_cache" on public.spotify_playlist_tracks_cache;
create policy "Allow anon spotify_playlist_tracks_cache"
  on public.spotify_playlist_tracks_cache for all to anon using (true) with check (true);
