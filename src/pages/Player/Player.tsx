import { useState, useEffect, useRef } from "react";
import { Box, Text, Stack, UnstyledButton } from "@mantine/core";
import { COLORS } from "../../styles/colors";
import { useAccessToken } from "../../hooks/useAccessToken";
import {
  connectPlayer,
  startPlayback,
  resumePlayback,
  pausePlayback,
  getPlaybackState,
} from "../../api/spotifyPlayback";

/** Sample track for "Play" demo (Spotify Premium required). */
const SAMPLE_TRACK_URI = "spotify:track:7qiZfU4dY1lWllzX7mPBI3"; // Ed Sheeran - Shape of You

const Player = (): JSX.Element => {
  const [accessToken] = useAccessToken();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const connectPromiseRef = useRef<Promise<string> | null>(null);
  const justPausedRef = useRef(false);

  // Auto-connect when we have a token (e.g. on mount or when navigating to Player)
  useEffect(() => {
    if (!accessToken || deviceId) return;
    setConnectError(null);
    if (!connectPromiseRef.current) {
      connectPromiseRef.current = connectPlayer(() => accessToken)
        .then(({ deviceId: id }) => {
          setDeviceId(id);
          return id;
        })
        .catch((err) => {
          setConnectError(
            err instanceof Error ? err.message : "Failed to connect player",
          );
          connectPromiseRef.current = null;
          throw err;
        })
        .finally(() => {
          connectPromiseRef.current = null;
        });
    }
  }, [accessToken, deviceId]);

  // Sync isPlaying from Spotify when we have a device (e.g. after connect or page load)
  useEffect(() => {
    if (!accessToken || !deviceId) return;
    getPlaybackState(accessToken).then((state) => {
      if (state) setIsPlaying(state.isPlaying);
    });
  }, [accessToken, deviceId]);

  const handlePlay = async () => {
    if (!accessToken) return;
    setPlayError(null);
    setLoading(true);
    try {
      let id = deviceId;
      if (!id) {
        const connectPromise =
          connectPromiseRef.current ??
          (connectPromiseRef.current = connectPlayer(() => accessToken)
            .then(({ deviceId: d }) => {
              setDeviceId(d);
              return d;
            })
            .catch((err) => {
              connectPromiseRef.current = null;
              throw err;
            }));
        id = await connectPromise;
        connectPromiseRef.current = null;
      }
      if (justPausedRef.current) {
        await resumePlayback(accessToken, id);
        justPausedRef.current = false;
      } else {
        await startPlayback(accessToken, id, SAMPLE_TRACK_URI);
      }
      setIsPlaying(true);
    } catch (err) {
      setPlayError(err instanceof Error ? err.message : "Playback failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!accessToken || !deviceId) return;
    setPlayError(null);
    setLoading(true);
    try {
      await pausePlayback(accessToken, deviceId);
      justPausedRef.current = true;
      setIsPlaying(false);
    } catch (err) {
      setPlayError(err instanceof Error ? err.message : "Pause failed");
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = 56;
  const iconSize = 24;

  return (
    <Box style={{ padding: 24 }}>
      <Stack spacing="md">
        <Text size="lg" fw={600} c="dark.0">
          Web player
        </Text>
        <Text size="sm" c="dark.2">
          Play a track in this browser. Connects automatically when needed.
          Requires Spotify Premium.
        </Text>

        <UnstyledButton
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={loading || (isPlaying && !deviceId)}
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: "50%",
            backgroundColor: COLORS.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: loading ? 0.7 : 1,
          }}
          styles={{
            root: {
              "&:hover:not(:disabled)": { transform: "scale(1.05)" },
              "&:disabled": { cursor: "not-allowed" },
            },
          }}
        >
          {isPlaying ? (
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="#fff"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="#fff"
              style={{ marginLeft: 2 }}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </UnstyledButton>

        {connectError && (
          <Text size="sm" c="red">
            {connectError}
          </Text>
        )}
        {playError && (
          <Text size="sm" c="red">
            {playError}
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default Player;
