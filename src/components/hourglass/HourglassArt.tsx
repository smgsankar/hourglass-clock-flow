import { useId, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { TimerStatus } from "@/features/timer/timerMachine";

export interface HourglassArtProps {
  progress: number;
  status: TimerStatus;
  reducedMotion: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Geometry (viewBox 0 0 200 300)                                      */
/* ------------------------------------------------------------------ */

const GLASS_PATH =
  "M58 62 H142 C142 110 114 133 105 151 L105 159 C114 177 142 200 142 248 H58 C58 200 86 177 95 159 L95 151 C86 133 58 110 58 62 Z";
const TOP_BULB_PATH =
  "M58 62 H142 C142 110 114 133 105 151 L105 155 H95 L95 151 C86 133 58 110 58 62 Z";
const BOTTOM_BULB_PATH =
  "M95 155 H105 L105 159 C114 177 142 200 142 248 H58 C58 200 86 177 95 159 Z";

const TOP_SAND_FULL_Y = 64; // sand surface when progress = 0
const NECK_Y = 153; // sand surface when the top bulb is empty
const TOP_SAND_HEIGHT = NECK_Y - TOP_SAND_FULL_Y;
const BOTTOM_FLOOR_Y = 248;
const BOTTOM_MOUND_MAX = 86;

const STATUS_WORD: Record<TimerStatus, string> = {
  idle: "ready",
  running: "running",
  paused: "paused",
  finished: "finished",
};

/** Ink for facial features: fixed so it reads on the wooden head in both themes. */
const INK = "hsl(20 45% 12%)";

function clampProgress(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.min(1, Math.max(0, p));
}

/* ------------------------------------------------------------------ */
/* Face                                                               */
/* ------------------------------------------------------------------ */

const EYE_L = 74;
const EYE_R = 126;
const EYE_Y = 33;

function Eye({ cx, status }: { cx: number; status: TimerStatus }) {
  const cy = EYE_Y;
  switch (status) {
    case "idle":
      // sleepy, half-lidded
      return (
        <g>
          <path d={`M${cx - 9} ${cy} A9 9 0 0 0 ${cx + 9} ${cy} Z`} fill="white" />
          <circle cx={cx} cy={cy + 4} r={3.6} fill={INK} />
          <path
            d={`M${cx - 10.5} ${cy} Q${cx} ${cy - 2.5} ${cx + 10.5} ${cy}`}
            stroke={INK}
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );
    case "running":
      // wide awake, eyes on the sand
      return (
        <g>
          <circle cx={cx} cy={cy} r={10} fill="white" />
          <circle cx={cx} cy={cy + 4} r={5.2} fill={INK} />
          <circle cx={cx + 1.8} cy={cy + 2.2} r={1.6} fill="white" />
        </g>
      );
    case "paused":
      // eyes closed, catching a breather
      return (
        <path
          d={`M${cx - 9} ${cy + 1} Q${cx} ${cy + 8} ${cx + 9} ${cy + 1}`}
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      );
    case "finished":
      // happy ^ ^
      return (
        <path
          d={`M${cx - 9} ${cy + 4} L${cx} ${cy - 5} L${cx + 9} ${cy + 4}`}
          stroke={INK}
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function Brows({ status }: { status: TimerStatus }) {
  const common = { stroke: INK, strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };
  switch (status) {
    case "running":
      // determined: slanting down toward the middle
      return (
        <g {...common}>
          <path d={`M${EYE_L - 11} ${EYE_Y - 16} L${EYE_L + 7} ${EYE_Y - 12}`} />
          <path d={`M${EYE_R + 11} ${EYE_Y - 16} L${EYE_R - 7} ${EYE_Y - 12}`} />
        </g>
      );
    case "finished":
      // raised with delight
      return (
        <g {...common}>
          <path d={`M${EYE_L - 9} ${EYE_Y - 13} Q${EYE_L} ${EYE_Y - 20} ${EYE_L + 9} ${EYE_Y - 13}`} />
          <path d={`M${EYE_R - 9} ${EYE_Y - 13} Q${EYE_R} ${EYE_Y - 20} ${EYE_R + 9} ${EYE_Y - 13}`} />
        </g>
      );
    case "idle":
    case "paused":
      // soft and relaxed
      return (
        <g {...common} strokeOpacity={0.75}>
          <path d={`M${EYE_L - 8} ${EYE_Y - 11} Q${EYE_L} ${EYE_Y - 14} ${EYE_L + 8} ${EYE_Y - 11}`} />
          <path d={`M${EYE_R - 8} ${EYE_Y - 11} Q${EYE_R} ${EYE_Y - 14} ${EYE_R + 8} ${EYE_Y - 11}`} />
        </g>
      );
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function Mouth({ status }: { status: TimerStatus }) {
  switch (status) {
    case "idle":
      return (
        <path d="M92 45 Q100 51 108 45" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      );
    case "running":
      return <ellipse cx={100} cy={47} rx={3.6} ry={4.2} fill={INK} />;
    case "paused":
      return (
        <path d="M95 47 Q100 49.5 105 47" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      );
    case "finished":
      return (
        <g>
          <path d="M86 42 Q100 62 114 42 Z" fill={INK} strokeLinejoin="round" />
          <path d="M92.5 49.5 Q100 46 107.5 49.5 Q100 56.5 92.5 49.5 Z" className="fill-blush" />
        </g>
      );
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Arms - little sticks sprouting from the posts                       */
/* ------------------------------------------------------------------ */

const ARM_PATHS: Record<TimerStatus, { left: string; hand: [number, number] }> = {
  // resting by its sides
  idle: { left: "M33 150 Q18 162 17 182", hand: [17, 184] },
  // fists up: "you've got this"
  running: { left: "M33 146 Q12 146 16 122", hand: [16, 119] },
  // hanging loose
  paused: { left: "M33 152 Q22 168 22 190", hand: [22, 192] },
  // arms up, celebrating
  finished: { left: "M33 128 Q14 112 14 84", hand: [14, 81] },
};

function Arms({ status }: { status: TimerStatus }) {
  const { left, hand } = ARM_PATHS[status];
  const arm = (
    <g>
      <path d={left} className="stroke-foreground" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <circle cx={hand[0]} cy={hand[1]} r={5.5} className="fill-foreground" />
    </g>
  );
  return (
    <g>
      {arm}
      <g transform="translate(200 0) scale(-1 1)">{arm}</g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Decorations per status                                              */
/* ------------------------------------------------------------------ */

function Sparkle({ x, y, size, className }: { x: number; y: number; size: number; className: string }) {
  const s = size;
  return (
    <path
      d={`M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s} Z`}
      className={className}
    />
  );
}

function SleepyZ() {
  return (
    <text
      x={178}
      y={0}
      className="fill-muted-foreground font-display"
      fontSize={20}
      fontWeight={700}
      transform="rotate(-12 178 0)"
    >
      z
    </text>
  );
}

function PauseBubble() {
  return (
    <g>
      <circle cx={170} cy={8} r={3} className="fill-card stroke-border" strokeWidth={1.5} />
      <rect x={164} y={-26} width={42} height={27} rx={13.5} className="fill-card stroke-border" strokeWidth={1.5} />
      <text
        x={185}
        y={-7.5}
        textAnchor="middle"
        className="fill-muted-foreground font-display"
        fontSize={15}
        fontWeight={700}
      >
        Zz
      </text>
    </g>
  );
}

function PauseBadge() {
  return (
    <g>
      <rect x={84} y={256} width={32} height={22} rx={11} className="fill-card" />
      <rect x={93} y={261} width={4.5} height={12} rx={2} className="fill-foreground" />
      <rect x={102.5} y={261} width={4.5} height={12} rx={2} className="fill-foreground" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const GRAINS = [
  { x: 99, delay: "0s", r: 1.9 },
  { x: 102, delay: "0.22s", r: 1.5 },
  { x: 98, delay: "0.45s", r: 1.7 },
  { x: 101, delay: "0.67s", r: 1.4 },
];

export function HourglassArt({ progress, status, reducedMotion, className }: HourglassArtProps) {
  const p = clampProgress(progress);
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
    top: `hg-top-${uid}`,
    bottom: `hg-bottom-${uid}`,
    sand: `hg-sand-${uid}`,
    wood: `hg-wood-${uid}`,
    glass: `hg-glass-${uid}`,
  };

  // Replay the flip whenever a fresh run begins (idle->running, finished->running).
  // Derived during render (React's "adjust state on prop change" pattern), so no extra effect pass.
  const [prevStatus, setPrevStatus] = useState<TimerStatus>(status);
  const [flipKey, setFlipKey] = useState(0);
  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status === "running" && (prevStatus === "idle" || prevStatus === "finished")) {
      setFlipKey((k) => k + 1);
    }
  }

  const topSurfaceY = NECK_Y - (1 - p) * TOP_SAND_HEIGHT;
  const moundTopY = BOTTOM_FLOOR_Y - p * BOTTOM_MOUND_MAX;
  const showTopSand = p < 0.999;
  const flowing = status === "running" && p < 1;
  const animateMotion = !reducedMotion;

  const bodyMotion: Record<TimerStatus, string> = {
    idle: "animate-idle-bob",
    running: "",
    paused: "",
    finished: "animate-celebrate-pop [animation-iteration-count:3]",
  };

  const label = `Hourglass, ${Math.round(p * 100)}% elapsed, ${STATUS_WORD[status]}`;

  return (
    <div className={cn("relative aspect-[2/3]", className)} role="img" aria-label={label}>
      <div className={cn("h-full w-full", animateMotion && bodyMotion[status])}>
        <svg
          viewBox="0 0 200 300"
          className="h-full w-full overflow-visible"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id={ids.top}>
              <path d={TOP_BULB_PATH} />
            </clipPath>
            <clipPath id={ids.bottom}>
              <path d={BOTTOM_BULB_PATH} />
            </clipPath>
            <linearGradient id={ids.sand} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "hsl(var(--sand-light))" }} />
              <stop offset="55%" style={{ stopColor: "hsl(var(--sand))" }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--sand-dark))" }} />
            </linearGradient>
            <linearGradient id={ids.wood} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "hsl(var(--wood-light))" }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--wood))" }} />
            </linearGradient>
            <linearGradient id={ids.glass} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: "hsl(var(--glass))", stopOpacity: 0.75 }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--glass))", stopOpacity: 0.35 }} />
            </linearGradient>
          </defs>

          {/* ground shadow */}
          <ellipse cx={100} cy={294} rx={74} ry={6} className="fill-foreground" fillOpacity={0.1} />

          <g
            key={flipKey}
            className={cn("svg-origin-center", animateMotion && flipKey > 0 && "animate-hourglass-flip-in")}
          >
            {/* arms sit behind the posts */}
            <Arms status={status} />

            {/* side posts */}
            {[30, 158].map((x) => (
              <g key={x}>
                <rect x={x} y={54} width={12} height={200} rx={6} className="fill-wood" />
                <rect x={x + 2.5} y={60} width={3} height={188} rx={1.5} className="fill-wood-light" fillOpacity={0.8} />
              </g>
            ))}

            {/* glass body */}
            <path d={GLASS_PATH} fill={`url(#${ids.glass})`} />

            {/* top sand pile, draining with a little funnel dip */}
            {showTopSand && (
              <g clipPath={`url(#${ids.top})`}>
                <path
                  d={`M50 ${topSurfaceY} Q100 ${topSurfaceY + 9} 150 ${topSurfaceY} V160 H50 Z`}
                  fill={`url(#${ids.sand})`}
                />
                <path
                  d={`M50 ${topSurfaceY} Q100 ${topSurfaceY + 9} 150 ${topSurfaceY}`}
                  className="stroke-sand-light"
                  strokeWidth={2}
                  fill="none"
                />
              </g>
            )}

            {/* bottom dune, rising */}
            <g clipPath={`url(#${ids.bottom})`}>
              <path
                d={`M50 252 V${moundTopY + 14} Q100 ${moundTopY - 12} 150 ${moundTopY + 14} V252 Z`}
                fill={`url(#${ids.sand})`}
              />
              {p > 0.04 && (
                <g className="fill-sand-dark" fillOpacity={0.45}>
                  <circle cx={80} cy={244} r={1.4} />
                  <circle cx={112} cy={240} r={1.2} />
                  <circle cx={96} cy={246} r={1.1} />
                  <circle cx={124} cy={245} r={1.3} />
                </g>
              )}

              {/* falling grains */}
              {flowing &&
                animateMotion &&
                GRAINS.map((g, i) => (
                  <circle
                    key={i}
                    cx={g.x}
                    cy={161}
                    r={g.r}
                    className="fill-sand-dark svg-origin-center animate-grain-fall"
                    style={
                      {
                        "--fall": `${Math.max(6, moundTopY - 164)}px`,
                        animationDelay: g.delay,
                      } as CSSProperties
                    }
                  />
                ))}
            </g>

            {/* the stream through the neck */}
            {flowing && (
              <line
                x1={100}
                y1={148}
                x2={100}
                y2={Math.max(162, moundTopY + 1)}
                className={cn("stroke-sand-dark", animateMotion && "animate-sand-stream")}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeDasharray={animateMotion ? "7 5" : undefined}
              />
            )}

            {/* glass outline + highlights */}
            <path
              d={GLASS_PATH}
              fill="none"
              className="stroke-glass-edge"
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <g stroke="white" strokeOpacity={0.75} strokeLinecap="round" fill="none">
              <path d="M68 74 C68 100 77 117 87 131" strokeWidth={4} />
              <path d="M71 236 C70 214 77 198 86 187" strokeWidth={3} />
              <circle cx={130} cy={78} r={2} fill="white" fillOpacity={0.75} stroke="none" />
            </g>

            {/* bottom cap + little feet */}
            <ellipse cx={62} cy={286} rx={16} ry={6} className="fill-wood-dark" />
            <ellipse cx={138} cy={286} rx={16} ry={6} className="fill-wood-dark" />
            <rect x={18} y={246} width={164} height={38} rx={17} fill={`url(#${ids.wood})`} />
            <rect x={30} y={274} width={140} height={4} rx={2} className="fill-wood-dark" fillOpacity={0.35} />
            <rect x={30} y={253} width={70} height={4} rx={2} className="fill-wood-light" fillOpacity={0.7} />

            {/* top cap = the head */}
            <rect x={18} y={6} width={164} height={56} rx={26} fill={`url(#${ids.wood})`} />
            <rect x={34} y={12} width={88} height={5} rx={2.5} className="fill-wood-light" fillOpacity={0.8} />
            <rect x={28} y={56} width={144} height={4} rx={2} className="fill-wood-dark" fillOpacity={0.4} />

            {/* face */}
            <ellipse
              cx={56}
              cy={46}
              rx={8}
              ry={4.5}
              className="fill-blush"
              fillOpacity={status === "finished" ? 0.75 : 0.45}
            />
            <ellipse
              cx={144}
              cy={46}
              rx={8}
              ry={4.5}
              className="fill-blush"
              fillOpacity={status === "finished" ? 0.75 : 0.45}
            />
            <Brows status={status} />
            <Eye cx={EYE_L} status={status} />
            <Eye cx={EYE_R} status={status} />
            <Mouth status={status} />

            {status === "paused" && <PauseBadge />}
          </g>

          {/* floating extras live outside the flipping group */}
          {status === "idle" && <SleepyZ />}
          {status === "paused" && <PauseBubble />}
          {status === "finished" && (
            <g>
              <Sparkle x={6} y={58} size={9} className="fill-sand" />
              <Sparkle x={194} y={64} size={11} className="fill-accent" />
              <Sparkle x={186} y={112} size={6} className="fill-primary" />
              <Sparkle x={10} y={20} size={6} className="fill-primary" />
              <Sparkle x={190} y={18} size={7} className="fill-sand" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
