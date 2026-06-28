import { cn } from "@/lib/utils";

/**
 * Rishta logo mark — a crescent moon cradling a heart.
 * Symbolises love (heart) within faith (crescent) — a bond for life.
 */
export function LogoMark({
  className,
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm",
        rounded,
        className
      )}
    >
      <svg viewBox="0 0 512 512" className="w-[62%] h-[62%]" aria-hidden="true">
        <defs>
          <mask id="rishta-crescent">
            <rect width="512" height="512" fill="black" />
            <circle cx="232" cy="256" r="150" fill="white" />
            <circle cx="300" cy="256" r="128" fill="black" />
          </mask>
        </defs>
        {/* Crescent */}
        <rect width="512" height="512" fill="white" mask="url(#rishta-crescent)" />
        {/* Heart nestled in the crescent's opening */}
        <path
          transform="translate(286 196) scale(7.2)"
          fill="white"
          d="M12 21s-1-.7-2.6-2.1C6.9 16.6 3 13.2 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.3-3.9 7.7-6.4 10C13 20.3 12 21 12 21z"
        />
      </svg>
    </span>
  );
}

/**
 * Just the glyph (crescent + heart), no background — for placing on
 * coloured/glass surfaces. Inherits `currentColor` via fill override.
 */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <mask id="rishta-glyph-crescent">
          <rect width="512" height="512" fill="black" />
          <circle cx="232" cy="256" r="150" fill="white" />
          <circle cx="300" cy="256" r="128" fill="black" />
        </mask>
      </defs>
      <rect width="512" height="512" fill="currentColor" mask="url(#rishta-glyph-crescent)" />
      <path
        transform="translate(286 196) scale(7.2)"
        fill="currentColor"
        d="M12 21s-1-.7-2.6-2.1C6.9 16.6 3 13.2 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.3-3.9 7.7-6.4 10C13 20.3 12 21 12 21z"
      />
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
        <span className={cn("font-bold tracking-tight text-lg", wordClassName)}>
          Rishta
        </span>
        {showTagline && (
          <span className="text-[10px] text-gray-400 font-medium mt-0.5">
            رشتہ
          </span>
        )}
      </span>
    </span>
  );
}
