import { memo, useLayoutEffect, useRef } from "react";
import { Pause, Play, Repeat, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimerStatus } from "@/features/timer/timerMachine";

export interface TimerControlsProps {
  status: TimerStatus;
  canStart: boolean;
  onStart(): void;
  onPause(): void;
  onResume(): void;
  onReset(): void;
}

const PILL =
  "h-12 min-w-[8.5rem] rounded-full px-7 font-display text-lg font-semibold shadow-sm transition-transform active:scale-95 [&_svg]:size-5";
const PRIMARY = cn(PILL, "shadow-md shadow-primary/25 hover:-translate-y-0.5");
const SECONDARY = cn(PILL, "border-2 bg-card hover:bg-secondary hover:text-secondary-foreground");

type PrimaryConfig = { label: string; icon: JSX.Element; onClick(): void; disabled: boolean };

function TimerControlsImpl({ status, canStart, onStart, onPause, onResume, onReset }: TimerControlsProps) {
  const primaryRef = useRef<HTMLButtonElement>(null);
  // True while Reset was the last thing focused. Cleared only when focus moves to another element
  // (relatedTarget set), so a blur fired by Reset's own removal does not clear it.
  const resetHadFocusRef = useRef(false);

  // Reset unmounts when the timer returns to idle (via click or the R shortcut). If it held focus,
  // the browser drops focus to <body>; hand it to the primary button instead (WCAG 2.4.3).
  useLayoutEffect(() => {
    if (status !== "idle" || !resetHadFocusRef.current) return;
    resetHadFocusRef.current = false;
    const active = document.activeElement;
    if (active === null || active === document.body) primaryRef.current?.focus();
  }, [status]);

  let primary: PrimaryConfig;
  switch (status) {
    case "idle":
      primary = { label: "Start", icon: <Play aria-hidden="true" className="fill-current" />, onClick: onStart, disabled: !canStart };
      break;
    case "running":
      primary = { label: "Pause", icon: <Pause aria-hidden="true" className="fill-current" />, onClick: onPause, disabled: false };
      break;
    case "paused":
      primary = { label: "Resume", icon: <Play aria-hidden="true" className="fill-current" />, onClick: onResume, disabled: false };
      break;
    case "finished":
      primary = { label: "Again", icon: <Repeat aria-hidden="true" />, onClick: onStart, disabled: !canStart };
      break;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }

  // Every status renders the same shape (keyed primary + optional Reset) so React reuses the primary
  // <button> across transitions and keyboard focus survives Start -> Pause -> Resume.
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        key="primary"
        ref={primaryRef}
        type="button"
        size="lg"
        className={PRIMARY}
        onClick={primary.onClick}
        disabled={primary.disabled}
      >
        {primary.icon}
        {primary.label}
      </Button>
      {status !== "idle" && (
        <Button
          key="reset"
          type="button"
          size="lg"
          variant="outline"
          className={SECONDARY}
          onClick={onReset}
          onFocus={() => {
            resetHadFocusRef.current = true;
          }}
          onBlur={(e) => {
            if (e.relatedTarget !== null) resetHadFocusRef.current = false;
          }}
        >
          <RotateCcw aria-hidden="true" />
          Reset
        </Button>
      )}
    </div>
  );
}

export const TimerControls = memo(TimerControlsImpl);
TimerControls.displayName = "TimerControls";
