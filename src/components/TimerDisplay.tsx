import { AlertTriangle, CheckCircle2, CircleDot, PauseCircle, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatClock, formatSpokenTime } from "@/lib/time";

export type TimerStatus = "idle" | "running" | "paused" | "complete";

interface TimerDisplayProps {
  remainingSeconds: number;
  status: TimerStatus;
  /** Text pushed to the polite live region; changing it triggers one announcement. */
  announcement: string;
  /** Urgent text (timer finished) — interrupts, so keep it rare. */
  alert: string;
}

const STATUS_META: Record<TimerStatus, { label: string; Icon: typeof CircleDot; className: string }> = {
  idle: { label: "Ready", Icon: CircleDot, className: "bg-muted text-muted-foreground" },
  running: { label: "Running", Icon: PlayCircle, className: "bg-primary text-primary-foreground" },
  paused: { label: "Paused", Icon: PauseCircle, className: "bg-secondary text-secondary-foreground" },
  complete: { label: "Finished", Icon: CheckCircle2, className: "bg-success text-success-foreground" },
};

export const TimerDisplay = ({
  remainingSeconds,
  status,
  announcement,
  alert,
}: TimerDisplayProps) => {
  const { label, Icon, className } = STATUS_META[status];
  const isEndingSoon = status === "running" && remainingSeconds > 0 && remainingSeconds < 60;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {/* Status is carried by an icon and a word, never by colour alone. */}
      <p
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
          className
        )}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {label}
      </p>

      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Time remaining
        </p>
        {/*
         * The digits are decorative duplication: `MM:SS` is read out
         * inconsistently, so assistive tech gets the spelled-out version below.
         */}
        <p
          aria-hidden="true"
          className={cn(
            "font-mono text-6xl font-bold tabular-nums sm:text-7xl",
            isEndingSoon ? "text-destructive" : "text-foreground"
          )}
        >
          {formatClock(remainingSeconds)}
        </p>
        <p className="sr-only">{formatSpokenTime(remainingSeconds)} remaining</p>
      </div>

      {isEndingSoon && (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
          Less than a minute left
        </p>
      )}

      {/*
       * Single polite live region for the whole timer. Announcements are
       * throttled by the caller so a screen reader is not interrupted every
       * second of the countdown.
       */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <p role="alert" className="sr-only">
        {alert}
      </p>
    </div>
  );
};
