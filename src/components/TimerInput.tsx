import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { clamp, formatSpokenTime } from "@/lib/time";

const MAX_MINUTES = 99;
const MAX_SECONDS = 59;

const PRESETS = [
  { label: "1 min", minutes: 1 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "25 min", minutes: 25 },
] as const;

interface TimerInputProps {
  /** Currently configured duration, in seconds. */
  totalSeconds: number;
  onTimeSet: (totalSeconds: number) => void;
  disabled?: boolean;
}

export const TimerInput = ({ totalSeconds, onTimeSet, disabled }: TimerInputProps) => {
  const id = useId();
  const minutesId = `${id}-minutes`;
  const secondsId = `${id}-seconds`;
  const hintId = `${id}-hint`;

  // Raw strings so a half-typed value ("" or "1") is not clobbered mid-keystroke.
  const [minutes, setMinutes] = useState(() => String(Math.floor(totalSeconds / 60)));
  const [seconds, setSeconds] = useState(() => String(totalSeconds % 60));

  // Re-sync when the duration is changed from outside (presets, reset).
  useEffect(() => {
    const local = (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
    if (local !== totalSeconds) {
      setMinutes(String(Math.floor(totalSeconds / 60)));
      setSeconds(String(totalSeconds % 60));
    }
    // Only react to external changes, not to the user's own typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  const commit = (nextMinutes: string, nextSeconds: string) => {
    const mins = clamp(parseInt(nextMinutes, 10) || 0, 0, MAX_MINUTES);
    const secs = clamp(parseInt(nextSeconds, 10) || 0, 0, MAX_SECONDS);
    onTimeSet(mins * 60 + secs);
  };

  const handleMinutesChange = (value: string) => {
    setMinutes(value);
    commit(value, seconds);
  };

  const handleSecondsChange = (value: string) => {
    setSeconds(value);
    commit(minutes, value);
  };

  /** Snap the visible field to the value we actually stored. */
  const handleBlur = () => {
    setMinutes(String(clamp(parseInt(minutes, 10) || 0, 0, MAX_MINUTES)));
    setSeconds(String(clamp(parseInt(seconds, 10) || 0, 0, MAX_SECONDS)));
  };

  const applyPreset = (presetMinutes: number) => {
    setMinutes(String(presetMinutes));
    setSeconds("0");
    onTimeSet(presetMinutes * 60);
  };

  return (
    <fieldset disabled={disabled} className="space-y-5">
      <legend className="sr-only">Set duration</legend>

      <div>
        <p id={hintId} className="text-sm text-muted-foreground">
          {disabled
            ? "Stop or reset the timer to change the duration."
            : `Pick a preset or enter up to ${MAX_MINUTES} minutes and ${MAX_SECONDS} seconds.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Duration presets">
        {PRESETS.map((preset) => {
          const isActive = totalSeconds === preset.minutes * 60;

          return (
            <Button
              key={preset.label}
              type="button"
              variant={isActive ? "default" : "outline"}
              aria-pressed={isActive}
              onClick={() => applyPreset(preset.minutes)}
              className="min-h-touch"
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor={minutesId}>Minutes</Label>
          <Input
            id={minutesId}
            type="number"
            inputMode="numeric"
            value={minutes}
            onChange={(event) => handleMinutesChange(event.target.value)}
            onBlur={handleBlur}
            min={0}
            max={MAX_MINUTES}
            aria-describedby={hintId}
            className="h-touch w-24 text-center font-mono text-lg"
          />
        </div>

        <span aria-hidden="true" className="pb-2 text-2xl font-light text-muted-foreground">
          :
        </span>

        <div className="space-y-2">
          <Label htmlFor={secondsId}>Seconds</Label>
          <Input
            id={secondsId}
            type="number"
            inputMode="numeric"
            value={seconds}
            onChange={(event) => handleSecondsChange(event.target.value)}
            onBlur={handleBlur}
            min={0}
            max={MAX_SECONDS}
            aria-describedby={hintId}
            className="h-touch w-24 text-center font-mono text-lg"
          />
        </div>
      </div>

      <p className={cn("text-sm", totalSeconds === 0 ? "text-destructive" : "text-muted-foreground")}>
        {totalSeconds === 0
          ? "Set a duration above before starting the timer."
          : `Timer set to ${formatSpokenTime(totalSeconds)}.`}
      </p>
    </fieldset>
  );
};
