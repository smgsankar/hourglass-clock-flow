import { cn } from "@/lib/utils";
import { formatClock } from "@/features/timer/format";
import type { TimerStatus } from "@/features/timer/timerMachine";

export interface TimeDisplayProps {
  remainingMs: number;
  status: TimerStatus;
}

const CLOCK_TONE: Record<TimerStatus, string> = {
  idle: "text-foreground",
  running: "text-foreground",
  paused: "text-muted-foreground",
  finished: "text-primary",
};

export function TimeDisplay({ remainingMs, status }: TimeDisplayProps) {
  const seconds = Math.ceil(remainingMs / 1000);
  const warning = (status === "running" || status === "paused") && seconds < 60 && seconds > 0;

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div
        role="timer"
        aria-live="off"
        aria-atomic="true"
        className={cn(
          "font-display text-6xl font-semibold leading-none tracking-tight tabular-nums transition-colors duration-300 lg:text-7xl",
          warning ? "text-destructive" : CLOCK_TONE[status],
        )}
      >
        {formatClock(remainingMs)}
      </div>
      <p className="h-6 text-sm font-bold text-destructive" aria-hidden={!warning}>
        {warning && <span className="inline-block animate-warn-wiggle">Under a minute - hustle, little grains!</span>}
      </p>
    </div>
  );
}
