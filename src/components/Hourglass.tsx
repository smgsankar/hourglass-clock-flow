import { useId, type CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { clamp } from "@/lib/time";

interface HourglassProps {
  /** Elapsed fraction of the timer, 0-100. */
  progress: number;
  /** Sand only flows while the timer is actually counting down. */
  isRunning: boolean;
  /** Spoken description of the current progress, e.g. "42% elapsed". */
  valueText: string;
  className?: string;
}

/* Geometry of the glass, in viewBox units. */
const TOP_CHAMBER = { top: 18, bottom: 96 };
const BOTTOM_CHAMBER = { top: 104, bottom: 182 };

/**
 * The hourglass is a *drawing* of the timer's progress, so the SVG itself is
 * hidden from assistive tech and the wrapper carries `role="progressbar"`.
 * That way a screen reader hears one meaningful value instead of a pile of
 * anonymous shapes, and the percentage is also on screen as text so progress
 * is never conveyed by the animation alone.
 */
export const Hourglass = ({
  progress,
  isRunning,
  valueText,
  className,
}: HourglassProps) => {
  const id = useId();
  const topClipId = `${id}-top`;
  const bottomClipId = `${id}-bottom`;
  const sandGradientId = `${id}-sand`;
  const glassGradientId = `${id}-glass`;

  const elapsed = clamp(progress, 0, 100);

  // Sand in the top chamber drains downwards towards the neck.
  const topHeight = ((100 - elapsed) / 100) * (TOP_CHAMBER.bottom - TOP_CHAMBER.top);
  const topY = TOP_CHAMBER.bottom - topHeight;

  // The pile in the bottom chamber grows upwards from the base.
  const bottomHeight = (elapsed / 100) * (BOTTOM_CHAMBER.bottom - BOTTOM_CHAMBER.top);
  const bottomY = BOTTOM_CHAMBER.bottom - bottomHeight;

  const isFlowing = isRunning && elapsed < 100;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(elapsed)}
      aria-valuetext={valueText}
      className={cn("flex flex-col items-center gap-3", className)}
    >
      <svg
        viewBox="0 0 120 200"
        aria-hidden="true"
        focusable="false"
        className="h-auto w-40 max-w-full sm:w-48"
      >
        <defs>
          <linearGradient id={sandGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--sand))" />
            <stop offset="100%" stopColor="hsl(var(--sand-deep))" />
          </linearGradient>
          <linearGradient id={glassGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--glass))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--glass))" stopOpacity="0.4" />
          </linearGradient>

          <clipPath id={topClipId}>
            <polygon points="14,18 106,18 62,96 58,96" />
          </clipPath>
          <clipPath id={bottomClipId}>
            <polygon points="58,104 62,104 106,182 14,182" />
          </clipPath>
        </defs>

        {/* Glass body */}
        <polygon
          points="14,18 106,18 62,96 58,96"
          fill={`url(#${glassGradientId})`}
          stroke="hsl(var(--glass-edge))"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <polygon
          points="58,104 62,104 106,182 14,182"
          fill={`url(#${glassGradientId})`}
          stroke="hsl(var(--glass-edge))"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Sand remaining in the top chamber */}
        <g clipPath={`url(#${topClipId})`}>
          <rect
            x="0"
            y={topY}
            width="120"
            height={Math.max(topHeight, 0)}
            fill={`url(#${sandGradientId})`}
            className="transition-all duration-1000 ease-linear"
          />
        </g>

        {/* Sand collected in the bottom chamber */}
        <g clipPath={`url(#${bottomClipId})`}>
          <rect
            x="0"
            y={bottomY}
            width="120"
            height={Math.max(bottomHeight, 0)}
            fill={`url(#${sandGradientId})`}
            className="transition-all duration-1000 ease-linear"
          />
        </g>

        {/* Falling stream — decorative, and suppressed by prefers-reduced-motion */}
        {isFlowing && (
          <g clipPath={`url(#${bottomClipId})`}>
            <rect
              x="59"
              y="104"
              width="2"
              height={Math.max(bottomY - 104, 0)}
              fill="hsl(var(--sand))"
            />
            {[0, 0.45, 0.9].map((delay) => (
              <circle
                key={delay}
                cx="60"
                cy="106"
                r="2"
                fill="hsl(var(--sand))"
                className="animate-sand-fall"
                style={
                  {
                    animationDelay: `${delay}s`,
                    "--sand-fall-distance": `${Math.max(bottomY - 108, 0)}px`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        )}

        {/* Frame plates and neck */}
        <rect x="8" y="8" width="104" height="10" rx="5" fill="hsl(var(--primary))" />
        <rect x="8" y="182" width="104" height="10" rx="5" fill="hsl(var(--primary))" />
        <rect x="56" y="96" width="8" height="8" rx="2" fill="hsl(var(--glass-edge))" />
      </svg>

      {/* Visible echo of the progressbar value; the role above carries it for
          assistive tech, so this copy is hidden to avoid a double announcement. */}
      <p aria-hidden="true" className="text-sm font-medium text-muted-foreground">
        {Math.round(elapsed)}% elapsed
      </p>
    </div>
  );
};
