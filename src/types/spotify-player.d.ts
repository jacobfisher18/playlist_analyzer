/** Global types for the Spotify Web Playback SDK (loaded via script tag) */

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyPlayerInstance {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(
    event: "ready" | "not_ready" | "player_state_changed" | "autoplay_failed",
    callback: (data: { device_id: string } | object) => void
  ): boolean;
  addListener(
    event: "initialization_error" | "authentication_error" | "account_error" | "playback_error",
    callback: (data: { message: string }) => void
  ): boolean;
  removeListener(event: string): boolean;
  getCurrentState(): Promise<{ paused: boolean } | null>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
  activateElement(): Promise<void>;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayerInstance;
    };
  }
}

export type { SpotifyPlayerInstance, SpotifyPlayerOptions };
