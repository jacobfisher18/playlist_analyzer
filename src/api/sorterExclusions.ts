import type { SupabaseClient } from "@supabase/supabase-js";

export async function getExcludedPlaylistIds(
  supabase: SupabaseClient | null,
  spotifyUserId: string,
): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from("sorter_excluded_playlists")
    .select("playlist_id")
    .eq("spotify_user_id", spotifyUserId);
  if (error) {
    console.error("getExcludedPlaylistIds error", error);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.playlist_id));
}

export async function excludePlaylist(
  supabase: SupabaseClient | null,
  spotifyUserId: string,
  playlistId: string,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("sorter_excluded_playlists").upsert(
    {
      spotify_user_id: spotifyUserId,
      playlist_id: playlistId,
    },
    { onConflict: "spotify_user_id,playlist_id" },
  );
  if (error) {
    console.error("excludePlaylist error", error);
    return false;
  }
  return true;
}

export async function includePlaylist(
  supabase: SupabaseClient | null,
  spotifyUserId: string,
  playlistId: string,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("sorter_excluded_playlists")
    .delete()
    .eq("spotify_user_id", spotifyUserId)
    .eq("playlist_id", playlistId);
  if (error) {
    console.error("includePlaylist error", error);
    return false;
  }
  return true;
}
