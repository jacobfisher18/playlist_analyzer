import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCachedTracksForPlaylists } from "../api/spotifyCache";

export interface PlaylistTrackItem {
  track: {
    id: string;
    uri: string;
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images?: Array<{ url: string }> };
  };
}

export function useCachedPlaylistTracks(
  supabase: SupabaseClient | null,
  spotifyUserId: string | null,
  playlistId: string | null
) {
  return useQuery({
    queryKey: ["cachedPlaylistTracks", spotifyUserId, playlistId],
    queryFn: async (): Promise<PlaylistTrackItem[]> => {
      if (!supabase || !spotifyUserId || !playlistId) return [];
      const map = await getCachedTracksForPlaylists(supabase, spotifyUserId, [
        playlistId,
      ]);
      const entry = map?.get(playlistId);
      const items = (entry?.items ?? []) as Array<{ track?: unknown }>;
      return items.filter(
        (i) => i?.track && typeof (i.track as { id?: string }).id === "string"
      ) as PlaylistTrackItem[];
    },
    enabled: !!supabase && !!spotifyUserId && !!playlistId,
    staleTime: 2 * 60 * 1000,
  });
}
