import { cn } from "@/lib/utils";

const HEART_PATH =
  "M12 21s-1-.7-2.6-2.1C6.9 16.6 3 13.2 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.3-3.9 7.7-6.4 10C13 20.3 12 21 12 21z";

/**
 * The Rishta mark — two interlocking wedding rings with a heart:
 * a bond (rings) built on love (heart). Gold + a second ring colour.
 * `animate` gives the heart a heartbeat and the rings a gentle pulse.
 */
function RingsHeart({
  ringA,
  ringB,
  heart,
  animate = false,
}: {
  ringA: string;
  ringB: string;
  heart: string;
  animate?: boolean;
}) {
  return (
    <>
      {/* Back ring */}
      <circle
        cx="206"
        cy="228"
        r="80"
        fill="none"
        stroke={ringA}
        strokeWidth="30"
        className={animate ? "animate-ring-pulse" : undefined}
      />
      {/* Front ring (drawn over) */}
      <circle cx="300" cy="228" r="80" fill="none" stroke={ringB} strokeWidth="30" />
      {/* Heart, in front, cradled below the rings */}
      <g transform="translate(186 246) scale(5.4)">
        <path d={HEART_PATH} fill={heart} className={animate ? "animate-heartbeat" : undefined} />
      </g>
    </>
  );
}

/**
 * Full app-icon tile: burgundy gradient + thin gold inner border + mark.
 */
export function LogoMark({
  className,
  rounded = "rounded-xl",
  animate = false,
}: {
  className?: string;
  rounded?: string;
  animate?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 shadow-sm overflow-hidden",
        rounded,
        className
      )}
    >
      <svg viewBox="0 0 512 512" className="w-[82%] h-[82%]" aria-hidden="true">
        {/* thin gold inner frame */}
        <rect
          x="26"
          y="26"
          width="460"
          height="460"
          rx="96"
          fill="none"
          stroke="#c1963a"
          strokeWidth="5"
          opacity="0.55"
        />
        <RingsHeart ringA="#cba14a" ringB="#ffffff" heart="#cba14a" animate={animate} />
      </svg>
    </span>
  );
}

/**
 * Bare mark (no tile) for placing on coloured/glass/light surfaces.
 * variant "onDark" → gold + white; "onLight" → gold + burgundy.
 */
export function LogoGlyph({
  className,
  variant = "onLight",
  animate = false,
}: {
  className?: string;
  variant?: "onDark" | "onLight";
  animate?: boolean;
}) {
  const colors =
    variant === "onDark"
      ? { ringA: "#cba14a", ringB: "#ffffff", heart: "#cba14a" }
      : { ringA: "#c1963a", ringB: "#9d2159", heart: "#9d2159" };
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <RingsHeart {...colors} animate={animate} />
    </svg>
  );
}

/**
 * Full logo: mark + wordmark.
 */
export function Logo({
  className,
  markClassName,
  wordClassName,
  showTagline = false,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("w-9 h-9", markClassName)} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-bold tracking-tight text-lg", wordClassName)}>Rishta</span>
        {showTagline && (
          <span className="text-[10px] text-gray-400 font-medium mt-0.5">رشتہ</span>
        )}
      </span>
    </span>
  );
}
