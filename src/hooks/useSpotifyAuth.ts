import { useQuery } from "@tanstack/react-query";
import { authWithSpotify, exchangeCodeForToken } from "../api/auth";

export function useSpotifyAuth() {
  const loginWithSpotify = () => authWithSpotify();

  return { loginWithSpotify };
}

export function useAuthCodeExchange(code: string | null) {
  return useQuery({
    queryKey: ["authCodeExchange", code],
    queryFn: async () => {
      if (!code) return null;
      return exchangeCodeForToken(code);
    },
    enabled: !!code,
    retry: false,
    staleTime: Infinity,
  });
}
