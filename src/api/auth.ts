import { clientID, scopes, redirect_uri } from "../utilities/constants";

const CODE_VERIFIER_KEY = "spotify_code_verifier";

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(hash);
}

export const authWithSpotify = async (): Promise<void> => {
  const code_verifier = generateCodeVerifier();
  const code_challenge = await generateCodeChallenge(code_verifier);
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(CODE_VERIFIER_KEY, code_verifier);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientID,
    scope: scopes,
    redirect_uri,
    code_challenge_method: "S256",
    code_challenge: code_challenge,
    show_dialog: "true",
  });
  const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?${params.toString()}`;
  window.location.href = SPOTIFY_AUTH_URL;
};

const TOKEN_URL = "https://accounts.spotify.com/api/token";

export const exchangeCodeForToken = async (code: string): Promise<string | null> => {
  const code_verifier =
    typeof sessionStorage !== "undefined" ? sessionStorage.getItem(CODE_VERIFIER_KEY) : null;
  if (!code_verifier) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri,
    client_id: clientID,
    code_verifier,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(CODE_VERIFIER_KEY);
  }
  return data.access_token || null;
};
