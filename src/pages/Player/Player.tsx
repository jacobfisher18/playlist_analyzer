import { Box, Text } from "@mantine/core";

const Player = (): JSX.Element => {
  return (
    <Box
      style={{
        padding: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
      }}
    >
      <Text size="sm" c="dimmed">
        Use the player at the bottom to control playback. Double‑click a track in Search to play it.
      </Text>
    </Box>
  );
};

export default Player;
