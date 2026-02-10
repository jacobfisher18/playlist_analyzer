import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCachedPlaylists } from "../api/spotifyCache";

export interface PlaylistOption {
  id: string;
  name: string;
  snapshot_id: string;
}

export function useCachedPlaylists(
  supabase: SupabaseClient | null,
  spotifyUserId: string | null
) {
  return useQuery({
    queryKey: ["cachedPlaylists", spotifyUserId],
    queryFn: async (): Promise<PlaylistOption[]> => {
      if (!supabase || !spotifyUserId) return [];
      const cached = await getCachedPlaylists(supabase, spotifyUserId);
      return (cached ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        snapshot_id: p.snapshot_id ?? "",
      }));
    },
    enabled: !!supabase && !!spotifyUserId,
    staleTime: 5 * 60 * 1000,
  });
}
