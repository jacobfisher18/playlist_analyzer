import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getExcludedPlaylistIds,
  excludePlaylist,
  includePlaylist,
} from "../api/sorterExclusions";

const QUERY_KEY = "sorterExclusions";

export function useSorterExclusions(
  supabase: SupabaseClient | null,
  spotifyUserId: string | null
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, spotifyUserId],
    queryFn: async (): Promise<Set<string>> => {
      if (!supabase || !spotifyUserId) return new Set();
      return getExcludedPlaylistIds(supabase, spotifyUserId);
    },
    enabled: !!supabase && !!spotifyUserId,
    staleTime: 2 * 60 * 1000,
  });

  const excludeMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!supabase || !spotifyUserId) return false;
      return excludePlaylist(supabase, spotifyUserId, playlistId);
    },
    onSuccess: (_, playlistId) => {
      queryClient.setQueryData<Set<string>>(
        [QUERY_KEY, spotifyUserId],
        (prev) => {
          const next = new Set(prev ?? []);
          next.add(playlistId);
          return next;
        }
      );
    },
  });

  const includeMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!supabase || !spotifyUserId) return false;
      return includePlaylist(supabase, spotifyUserId, playlistId);
    },
    onSuccess: (_, playlistId) => {
      queryClient.setQueryData<Set<string>>(
        [QUERY_KEY, spotifyUserId],
        (prev) => {
          const next = new Set(prev ?? []);
          next.delete(playlistId);
          return next;
        }
      );
    },
  });

  return {
    excludedIds: query.data ?? new Set(),
    isLoading: query.isLoading,
    excludePlaylist: excludeMutation.mutateAsync,
    excludeLoading: excludeMutation.isPending,
    includePlaylist: includeMutation.mutateAsync,
    includeLoading: includeMutation.isPending,
  };
}
