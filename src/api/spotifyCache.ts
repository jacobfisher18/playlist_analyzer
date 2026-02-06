import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCachedPlaylists(
  supabase: SupabaseClient | null,
  spotifyUserId: string
): Promise<Array<{ id: string; name: string; snapshot_id: string }> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("spotify_playlist_cache")
    .select("playlist_data")
    .eq("spotify_user_id", spotifyUserId)
    .order("playlist_data->>name");
  if (error) {
    console.error("getCachedPlaylists error", error);
    return null;
  }
  if (!data?.length) return null;
  return data.map((row) => row.playlist_data as { id: string; name: string; snapshot_id: string });
}

export async function getCachedTracksForPlaylists(
  supabase: SupabaseClient | null,
  spotifyUserId: string,
  playlistIds: string[]
): Promise<Map<string, { snapshotId: string; items: unknown[] }> | null> {
  if (!supabase || !playlistIds.length) return null;
  const { data, error } = await supabase
    .from("spotify_playlist_tracks_cache")
    .select("playlist_id, snapshot_id, tracks_data")
    .eq("spotify_user_id", spotifyUserId)
    .in("playlist_id", playlistIds);
  if (error) {
    console.error("getCachedTracksForPlaylists error", error);
    return null;
  }
  if (!data?.length) return null;
  const map = new Map<string, { snapshotId: string; items: unknown[] }>();
  for (const row of data) {
    map.set(row.playlist_id, {
      snapshotId: row.snapshot_id,
      items: (row.tracks_data as unknown[]) ?? [],
    });
  }
  return map;
}

export async function setCachedPlaylists(
  supabase: SupabaseClient | null,
  spotifyUserId: string,
  playlists: Array<{ id: string; name: string; snapshot_id: string; [k: string]: unknown }>
): Promise<void> {
  if (!supabase) return;
  const rows = playlists.map((p) => ({
    spotify_user_id: spotifyUserId,
    playlist_id: p.id,
    snapshot_id: p.snapshot_id ?? "",
    playlist_data: p,
  }));
  const { error: upsertError } = await supabase
    .from("spotify_playlist_cache")
    .upsert(rows, { onConflict: "spotify_user_id,playlist_id" });
  if (upsertError) {
    console.error("setCachedPlaylists upsert error", upsertError);
    return;
  }
  const ids = new Set(playlists.map((p) => p.id));
  const { data: existing } = await supabase
    .from("spotify_playlist_cache")
    .select("playlist_id")
    .eq("spotify_user_id", spotifyUserId);
  const toDelete = (existing ?? []).filter((r) => !ids.has(r.playlist_id)).map((r) => r.playlist_id);
  if (toDelete.length) {
    await supabase
      .from("spotify_playlist_cache")
      .delete()
      .eq("spotify_user_id", spotifyUserId)
      .in("playlist_id", toDelete);
  }
}

export async function setCachedTracksForPlaylist(
  supabase: SupabaseClient | null,
  spotifyUserId: string,
  playlistId: string,
  snapshotId: string,
  items: unknown[]
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("spotify_playlist_tracks_cache").upsert(
    {
      spotify_user_id: spotifyUserId,
      playlist_id: playlistId,
      snapshot_id: snapshotId,
      tracks_data: items,
    },
    { onConflict: "spotify_user_id,playlist_id" }
  );
  if (error) console.error("setCachedTracksForPlaylist error", error);
}
