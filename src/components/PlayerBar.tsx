import { Box, UnstyledButton } from "@mantine/core";
import { COLORS } from "../styles/colors";
import { usePlayer } from "../contexts/PlayerContext";

const BUTTON_SIZE = 48;
const ICON_SIZE = 22;
const BAR_HEIGHT = 72;

const PlayerBar = (): JSX.Element => {
  const { isPlaying, loading, togglePlayPause } = usePlayer();

  return (
    <Box
      component="footer"
      style={{
        height: BAR_HEIGHT,
        minHeight: BAR_HEIGHT,
        width: "100%",
        backgroundColor: "rgba(24,24,24,0.98)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <UnstyledButton
        onClick={togglePlayPause}
        disabled={loading}
        style={{
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: "50%",
          backgroundColor: COLORS.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: loading ? 0.7 : 1,
        }}
        styles={{
          root: {
            "&:hover:not(:disabled)": { transform: "scale(1.06)" },
            "&:disabled": { cursor: "not-allowed" },
          },
        }}
      >
        {isPlaying ? (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="#fff">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="#fff"
            style={{ marginLeft: 2 }}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </UnstyledButton>
    </Box>
  );
};

export default PlayerBar;
