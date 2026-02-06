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

interface PlayerContextValue {
  isPlaying: boolean;
  loading: boolean;
  error: string | null;
  playTrack: (trackUri: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectPromiseRef = useRef<Promise<string> | null>(null);
  const justPausedRef = useRef(false);

  useEffect(() => {
    if (!accessToken || deviceId) return;
    if (!connectPromiseRef.current) {
      connectPromiseRef.current = connectPlayer(() => accessToken)
        .then(({ deviceId: id }) => {
          setDeviceId(id);
          return id;
        })
        .catch((err) => {
          connectPromiseRef.current = null;
          throw err;
        })
        .finally(() => {
          connectPromiseRef.current = null;
        });
    }
  }, [accessToken, deviceId]);

  useEffect(() => {
    if (!accessToken || !deviceId) return;
    getPlaybackState(accessToken).then((state) => {
      if (state) setIsPlaying(state.isPlaying);
    });
  }, [accessToken, deviceId]);

  const ensureDeviceId = useCallback(async (): Promise<string> => {
    if (deviceId) return deviceId;
    const promise =
      connectPromiseRef.current ??
      (connectPromiseRef.current = connectPlayer(() => accessToken!)
        .then(({ deviceId: d }) => {
          setDeviceId(d);
          return d;
        })
        .catch((err) => {
          connectPromiseRef.current = null;
          throw err;
        }));
    const id = await promise;
    connectPromiseRef.current = null;
    return id;
  }, [accessToken, deviceId]);

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
          await startPlayback(
            accessToken,
            id,
            currentTrackUri ?? DEFAULT_TRACK_URI,
          );
          if (!currentTrackUri) setCurrentTrackUri(DEFAULT_TRACK_URI);
        }
        setIsPlaying(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playback failed");
    } finally {
      setLoading(false);
    }
  }, [accessToken, ensureDeviceId, isPlaying, currentTrackUri]);

  const value: PlayerContextValue = {
    isPlaying,
    loading,
    error,
    playTrack,
    togglePlayPause,
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
