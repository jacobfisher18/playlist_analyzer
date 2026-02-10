import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  connectPlayer,
  startPlayback,
  resumePlayback,
  pausePlayback,
  getPlaybackState,
} from "../api/spotifyPlayback";
import type {
  SpotifyPlayerInstance,
  WebPlaybackState,
} from "../types/spotify-player";

interface PlayerContextValue {
  isPlaying: boolean;
  loading: boolean;
  error: string | null;
  playTrack: (trackUri: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  /** Pause playback (e.g. on logout). No-op if not connected or not playing. */
  pause: () => Promise<void>;
  /** Set the track that should play when pressing play without a current track (e.g. Sorter's selected track). */
  setSelectedTrackUri: (uri: string | null) => void;
  /** Current position in ms. 0 when no track. */
  position: number;
  /** Track duration in ms. 0 when no track. */
  duration: number;
  /** Whether seeking is allowed (false during ads). */
  canSeek: boolean;
  /** Seek to position in ms. */
  seek: (positionMs: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const DEFAULT_TRACK_URI = "spotify:track:7qiZfU4dY1lWllzX7mPBI3";

export function PlayerProvider({
  children,
  accessToken,
}: {
  children: ReactNode;
  accessToken: string | undefined;
}): JSX.Element {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrackUri, setCurrentTrackUri] = useState<string | null>(null);
  const [selectedTrackUri, setSelectedTrackUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canSeek, setCanSeek] = useState(true);
  const connectPromiseRef = useRef<Promise<{ deviceId: string; player: SpotifyPlayerInstance }> | null>(null);
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const justPausedRef = useRef(false);
  const lastStateRef = useRef<{ position: number; timestamp: number } | null>(null);

  const updateFromState = useCallback((state: WebPlaybackState | null) => {
    if (!state) {
      setPosition(0);
      setDuration(0);
      lastStateRef.current = null;
      return;
    }
    const pos = state.position;
    const dur = state.duration ?? state.track_window?.current_track?.duration_ms ?? 0;
    setPosition(pos);
    setDuration(dur);
    setCanSeek(state.disallows?.seeking !== true);
    lastStateRef.current = { position: pos, timestamp: Date.now() };
  }, []);

  const setupPlayerListeners = useCallback(
    (player: SpotifyPlayerInstance) => {
      player.addListener("player_state_changed", (state: unknown) => {
        updateFromState(state as WebPlaybackState | null);
        if (state) setIsPlaying(!(state as WebPlaybackState).paused);
      });
      player.getCurrentState().then((state) => {
        updateFromState(state);
        if (state) setIsPlaying(!state.paused);
      });
    },
    [updateFromState]
  );

  useEffect(() => {
    if (!accessToken || deviceId) return;
    if (!connectPromiseRef.current) {
      connectPromiseRef.current = connectPlayer(() => accessToken)
        .then(({ deviceId: id, player }) => {
          setDeviceId(id);
          playerRef.current = player;
          setupPlayerListeners(player);
          return { deviceId: id, player };
        })
        .catch((err) => {
          connectPromiseRef.current = null;
          throw err;
        })
        .finally(() => {
          connectPromiseRef.current = null;
        });
    }
  }, [accessToken, deviceId, setupPlayerListeners]);

  useEffect(() => {
    if (!accessToken || !deviceId) return;
    getPlaybackState(accessToken).then((state) => {
      if (state) setIsPlaying(state.isPlaying);
    });
  }, [accessToken, deviceId]);

  useEffect(() => {
    if (!isPlaying || duration <= 0) return;
    const INTERVAL_MS = 250;
    const id = setInterval(() => {
      const last = lastStateRef.current;
      if (!last) return;
      const elapsed = Date.now() - last.timestamp;
      const next = Math.min(last.position + elapsed, duration);
      setPosition(next);
      lastStateRef.current = { position: next, timestamp: Date.now() };
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPlaying, duration]);

  const seek = useCallback(async (positionMs: number) => {
    const player = playerRef.current;
    if (!player || !canSeek) return;
    try {
      await player.seek(Math.max(0, Math.floor(positionMs)));
      setPosition(positionMs);
      lastStateRef.current = { position: positionMs, timestamp: Date.now() };
    } catch {
      // Ignore seek errors
    }
  }, [canSeek]);

  const ensureDeviceId = useCallback(async (): Promise<string> => {
    if (deviceId) return deviceId;
    const promise =
      connectPromiseRef.current ??
      (connectPromiseRef.current = connectPlayer(() => accessToken!)
        .then(({ deviceId: d, player }) => {
          setDeviceId(d);
          playerRef.current = player;
          setupPlayerListeners(player);
          return { deviceId: d, player };
        })
        .catch((err) => {
          connectPromiseRef.current = null;
          throw err;
        }));
    const { deviceId: id } = await promise;
    connectPromiseRef.current = null;
    return id;
  }, [accessToken, deviceId, setupPlayerListeners]);

  const playTrack = useCallback(
    async (trackUri: string) => {
      if (!accessToken) return;
      setError(null);
      setLoading(true);
      try {
        const id = await ensureDeviceId();
        setCurrentTrackUri(trackUri);
        await startPlayback(accessToken, id, trackUri);
        justPausedRef.current = false;
        setIsPlaying(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Playback failed");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, ensureDeviceId],
  );

  const togglePlayPause = useCallback(async () => {
    if (!accessToken) return;
    setError(null);
    setLoading(true);
    try {
      const id = await ensureDeviceId();
      if (isPlaying) {
        await pausePlayback(accessToken, id);
        justPausedRef.current = true;
        setIsPlaying(false);
      } else {
        if (justPausedRef.current) {
          await resumePlayback(accessToken, id);
          justPausedRef.current = false;
        } else {
          const uriToPlay = currentTrackUri ?? selectedTrackUri ?? DEFAULT_TRACK_URI;
          await startPlayback(accessToken, id, uriToPlay);
          if (!currentTrackUri) setCurrentTrackUri(uriToPlay);
        }
        setIsPlaying(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playback failed");
    } finally {
      setLoading(false);
    }
  }, [accessToken, ensureDeviceId, isPlaying, currentTrackUri, selectedTrackUri]);

  const pause = useCallback(async () => {
    if (!accessToken || !deviceId) return;
    try {
      await pausePlayback(accessToken, deviceId);
      setIsPlaying(false);
      justPausedRef.current = true;
    } catch {
      // Ignore errors (e.g. already stopped or token invalid)
    }
  }, [accessToken, deviceId]);

  const value: PlayerContextValue = {
    isPlaying,
    loading,
    error,
    playTrack,
    togglePlayPause,
    pause,
    setSelectedTrackUri,
    position,
    duration,
    canSeek,
    seek,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
