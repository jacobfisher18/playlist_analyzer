import { useCallback, useState } from "react";

const STORAGE_KEY = "spotify_access_token";

export function useAccessToken(): [
  string | undefined,
  (token: string) => void,
  () => void,
] {
  const [token, setTokenState] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(STORAGE_KEY) ?? undefined;
  });

  const setToken = useCallback((value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setTokenState(value);
  }, []);

  const removeToken = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTokenState(undefined);
  }, []);

  return [token, setToken, removeToken];
}
