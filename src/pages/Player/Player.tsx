import { useState } from "react";
import { Box, Button, Text, Stack } from "@mantine/core";
import { COLORS } from "../../styles/colors";
import { useAccessToken } from "../../hooks/useAccessToken";
import { connectPlayer, startPlayback } from "../../api/spotifyPlayback";

/** Sample track for "Play" demo (Spotify Premium required). */
const SAMPLE_TRACK_URI = "spotify:track:7qiZfU4dY1lWllzX7mPBI3"; // Ed Sheeran - Shape of You

const Player = (): JSX.Element => {
  const [accessToken] = useAccessToken();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleConnect = async () => {
    if (!accessToken) return;
    setStatus("connecting");
    setErrorMessage(null);
    try {
      const { deviceId: id } = await connectPlayer(() => accessToken);
      setDeviceId(id);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect player");
    }
  };

  const handlePlay = async () => {
    if (!accessToken || !deviceId) return;
    setPlaying(true);
    setErrorMessage(null);
    try {
      await startPlayback(accessToken, deviceId, SAMPLE_TRACK_URI);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Playback failed");
    } finally {
      setPlaying(false);
    }
  };

  return (
    <Box style={{ padding: 24 }}>
      <Stack spacing="md">
        <Text size="lg" fw={600} c="dark.0">
          Web player
        </Text>
        <Text size="sm" c="dark.2">
          Connect this browser as a Spotify device, then play a track. Requires Spotify Premium.
        </Text>

        {status === "idle" && (
          <Button
            onClick={handleConnect}
            color="green"
            variant="filled"
            style={{ backgroundColor: COLORS.primary, alignSelf: "flex-start" }}
          >
            Connect player
          </Button>
        )}

        {status === "connecting" && (
          <Text size="sm" c="dark.2">
            Connecting…
          </Text>
        )}

        {status === "ready" && (
          <Button
            onClick={handlePlay}
            color="green"
            variant="filled"
            loading={playing}
            style={{ backgroundColor: COLORS.primary, alignSelf: "flex-start" }}
          >
            Play sample track
          </Button>
        )}

        {status === "error" && errorMessage && (
          <Text size="sm" c="red">
            {errorMessage}
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default Player;
