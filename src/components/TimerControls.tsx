import { Pause, Play, RotateCcw, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  disabled?: boolean;
}

/**
 * Start/pause is a single button in a fixed position so keyboard and switch
 * users are not forced to re-find it every time the timer changes state.
 * Stop and Reset stay mounted (disabled when unavailable) for the same reason —
 * controls appearing and disappearing mid-session breaks focus.
 */
export const TimerControls = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  disabled,
}: TimerControlsProps) => {
  const isCountingDown = isRunning && !isPaused;
  const canStop = isRunning || isPaused;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {isCountingDown ? (
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={onPause}
          className="min-h-touch min-w-[8rem] gap-2 text-base"
        >
          <Pause aria-hidden="true" />
          Pause
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          onClick={onStart}
          disabled={disabled}
          className="min-h-touch min-w-[8rem] gap-2 text-base"
        >
          <Play aria-hidden="true" />
          {isPaused ? "Resume" : "Start"}
        </Button>
      )}

      <Button
        type="button"
        size="lg"
        variant="destructive"
        onClick={onStop}
        disabled={!canStop}
        className="min-h-touch gap-2 text-base"
      >
        <Square aria-hidden="true" />
        Stop
      </Button>

      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={onReset}
        className="min-h-touch gap-2 text-base"
      >
        <RotateCcw aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
};
