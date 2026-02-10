import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/spotify";
import type { SpotifyUser } from "../types/user";

export function useUserProfile(accessToken: string | null) {
  return useQuery({
    queryKey: ["userProfile", accessToken],
    queryFn: async (): Promise<SpotifyUser | null> => {
      if (!accessToken) return null;
      return getUserProfile(accessToken);
    },
    enabled: !!accessToken,
    staleTime: 10 * 60 * 1000,
  });
}
