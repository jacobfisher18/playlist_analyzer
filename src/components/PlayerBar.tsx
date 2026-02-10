import { useState, useCallback } from "react";
import { Box, Slider, UnstyledButton } from "@mantine/core";
import { COLORS } from "../styles/colors";
import { usePlayer } from "../contexts/PlayerContext";

const BUTTON_SIZE = 48;
const ICON_SIZE = 22;
const BAR_HEIGHT = 72;
const SCRUB_BAR_WIDTH = 280;

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const PlayerBar = (): JSX.Element => {
  const { isPlaying, loading, togglePlayPause, position, duration, canSeek, seek } =
    usePlayer();
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);

  const displayPosition = isScrubbing ? scrubPosition : position;
  const maxDuration = duration > 0 ? duration : 1;

  const handleChange = useCallback((value: number) => {
    setIsScrubbing(true);
    setScrubPosition(value);
  }, []);

  const handleChangeEnd = useCallback(
    (value: number) => {
      seek(value);
      setIsScrubbing(false);
    },
    [seek]
  );

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
        gap: 24,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
          fontVariantNumeric: "tabular-nums",
          minWidth: 36,
        }}
      >
        {formatTime(displayPosition)}
      </span>
      <Slider
        value={displayPosition}
        min={0}
        max={maxDuration}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        disabled={!canSeek || duration <= 0}
        size="sm"
        color={COLORS.primary}
        label={(value) => formatTime(value)}
        styles={{
          root: { width: SCRUB_BAR_WIDTH },
          track: { backgroundColor: "rgba(255,255,255,0.2)" },
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
          fontVariantNumeric: "tabular-nums",
          minWidth: 36,
        }}
      >
        {formatTime(duration)}
      </span>
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
