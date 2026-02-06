/**
 * Minimal integration with Spotify Web Playback SDK and Web API
 * for playing a track in the browser. Requires Spotify Premium.
 */

import type { SpotifyPlayerInstance } from "../types/spotify-player";

const PLAYER_NAME = "Sortify Web Player";
const TRANSFER_URL = "https://api.spotify.com/v1/me/player";
const PLAY_API_URL = "https://api.spotify.com/v1/me/player/play";
const PAUSE_API_URL = "https://api.spotify.com/v1/me/player/pause";
const PLAYER_STATE_URL = "https://api.spotify.com/v1/me/player";

function waitForSDK(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Spotify?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    (window as Window & { onSpotifyWebPlaybackSDKReady: () => void }).onSpotifyWebPlaybackSDKReady =
      () => resolve();
  });
}

export interface WebPlaybackState {
  deviceId: string | null;
  ready: boolean;
  error: string | null;
}

/**
 * Create and connect a Spotify Web Playback SDK player. Resolves with
 * device_id when the player is ready. Caller should store device_id
 * to start playback via startPlayback().
 */
export async function connectPlayer(
  getAccessToken: () => string
): Promise<{ deviceId: string; player: SpotifyPlayerInstance }> {
  await waitForSDK();

  return new Promise((resolve, reject) => {
    const player = new window.Spotify.Player({
      name: PLAYER_NAME,
      getOAuthToken: (cb) => cb(getAccessToken()),
      volume: 0.7,
    }) as SpotifyPlayerInstance;

    player.addListener("initialization_error", ({ message }) => reject(new Error(message)));
    player.addListener("authentication_error", ({ message }) => reject(new Error(message)));
    player.addListener("account_error", ({ message }) => reject(new Error(message)));
    player.addListener("playback_error", ({ message }) => reject(new Error(message)));

    player.addListener("ready", (data) => {
      const { device_id } = data as { device_id: string };
      resolve({ deviceId: device_id, player });
    });

    player.connect();
  });
}

/**
 * Transfer the user's playback to our device. Must be called before startPlayback
 * (otherwise the play request returns 403 Restriction violated).
 */
async function transferPlayback(accessToken: string, deviceId: string): Promise<void> {
  const res = await fetch(TRANSFER_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Transfer failed: ${res.status}`);
  }
}

/**
 * Start playback of a track on the given device using the Web API.
 * Requires user-modify-playback-state scope and Spotify Premium.
 */
export async function startPlayback(
  accessToken: string,
  deviceId: string,
  trackUri: string
): Promise<void> {
  await transferPlayback(accessToken, deviceId);

  const res = await fetch(`${PLAY_API_URL}?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Playback failed: ${res.status}`);
  }
}

/**
 * Resume playback on the given device (continues from current position).
 * Requires user-modify-playback-state scope.
 */
export async function resumePlayback(accessToken: string, deviceId: string): Promise<void> {
  await transferPlayback(accessToken, deviceId);
  const res = await fetch(`${PLAY_API_URL}?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: "{}",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Resume failed: ${res.status}`);
  }
}

/**
 * Pause playback on the given device. Requires user-modify-playback-state scope.
 */
export async function pausePlayback(accessToken: string, deviceId: string): Promise<void> {
  const res = await fetch(`${PAUSE_API_URL}?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Pause failed: ${res.status}`);
  }
}

/**
 * Get current playback state. Returns null if nothing is playing or request fails.
 */
export async function getPlaybackState(accessToken: string): Promise<{ isPlaying: boolean } | null> {
  const res = await fetch(PLAYER_STATE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 204 || !res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data) return null;
  return { isPlaying: !!data.is_playing };
}
