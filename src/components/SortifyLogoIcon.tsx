import { COLORS } from "../styles/colors";

/** Single source of truth for the Sortify logo (three curved bars in a circle). */
const LOGO_VIEWBOX = "0 0 32 32";
const LOGO_CIRCLE = { cx: 16, cy: 16, r: 16 };
const LOGO_BARS_PATH =
  "M8 11 Q16 9 24 11 M10 16 Q16 14 22 16 M11 21 Q16 19 21 21";

interface SortifyLogoIconProps {
  size?: number;
  /** Stroke color for the three bars (e.g. "transparent" for sidebar, "#fff" for favicon). */
  strokeColor?: string;
}

export function SortifyLogoIcon({
  size = 32,
  strokeColor = "transparent",
}: SortifyLogoIconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      fill="none"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <circle
        cx={LOGO_CIRCLE.cx}
        cy={LOGO_CIRCLE.cy}
        r={LOGO_CIRCLE.r}
        fill={COLORS.primary}
      />
      <path
        d={LOGO_BARS_PATH}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { LOGO_VIEWBOX, LOGO_CIRCLE, LOGO_BARS_PATH };
