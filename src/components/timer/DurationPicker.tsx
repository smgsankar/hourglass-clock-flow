import { memo, useId, type ChangeEvent } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { joinDuration, splitDuration } from "@/features/timer/format";
import { MAX_DURATION_MS } from "@/features/timer/timerMachine";

export interface DurationPickerProps {
  valueMs: number;
  onChange(ms: number): void;
  disabled: boolean;
  presetsMs?: number[];
}

const DEFAULT_PRESETS_MS = [60_000, 180_000, 300_000, 600_000, 1_500_000];
const MINUTE_MS = 60_000;
const FIVE_SECONDS_MS = 5_000;

function clampTotal(ms: number): number {
  return Math.min(MAX_DURATION_MS, Math.max(0, ms));
}

/** "" -> 0, anything non-numeric stripped. */
function digitsToNumber(raw: string): number {
  const digits = raw.replace(/\D/g, "").slice(0, 2);
  return digits === "" ? 0 : Number(digits);
}

function presetLabel(ms: number): { short: string; long: string } {
  if (ms % MINUTE_MS === 0) {
    const m = ms / MINUTE_MS;
    return { short: `${m}m`, long: `${m} minute${m === 1 ? "" : "s"}` };
  }
  const s = Math.round(ms / 1000);
  return { short: `${s}s`, long: `${s} seconds` };
}

const STEP_BUTTON =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card text-foreground transition-[transform,background-color] hover:bg-secondary active:scale-90 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface FieldProps {
  id: string;
  label: string;
  value: number;
  disabled: boolean;
  onInput(e: ChangeEvent<HTMLInputElement>): void;
  onDecrement(): void;
  onIncrement(): void;
  decrementLabel: string;
  incrementLabel: string;
  canDecrement: boolean;
  canIncrement: boolean;
}

function StepField({
  id,
  label,
  value,
  disabled,
  onInput,
  onDecrement,
  onIncrement,
  decrementLabel,
  incrementLabel,
  canDecrement,
  canIncrement,
}: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex w-full items-center justify-center gap-1.5">
        <button
          type="button"
          className={STEP_BUTTON}
          onClick={onDecrement}
          disabled={disabled || !canDecrement}
          aria-label={decrementLabel}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          autoComplete="off"
          value={String(value)}
          onChange={onInput}
          onFocus={(e) => e.currentTarget.select()}
          disabled={disabled}
          className="h-12 w-full min-w-0 max-w-[4.5rem] rounded-2xl border-2 border-input bg-background text-center font-display text-2xl font-semibold tabular-nums text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="button"
          className={STEP_BUTTON}
          onClick={onIncrement}
          disabled={disabled || !canIncrement}
          aria-label={incrementLabel}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function DurationPickerImpl({ valueMs, onChange, disabled, presetsMs = DEFAULT_PRESETS_MS }: DurationPickerProps) {
  const baseId = useId();
  const { minutes, seconds } = splitDuration(valueMs);
  const canDecrement = valueMs > 0;
  const canIncrement = valueMs < MAX_DURATION_MS;

  const step = (delta: number) => onChange(clampTotal(valueMs + delta));

  return (
    <fieldset disabled={disabled} className="w-full min-w-0 space-y-4 disabled:opacity-60">
      <legend className="mb-3 w-full text-center font-display text-lg font-semibold text-foreground">
        How long?
      </legend>

      <div className="flex flex-wrap justify-center gap-2">
        {presetsMs.map((ms) => {
          const active = ms === valueMs;
          const { short, long } = presetLabel(ms);
          return (
            <button
              key={ms}
              type="button"
              aria-pressed={active}
              aria-label={long}
              onClick={() => onChange(clampTotal(ms))}
              disabled={disabled}
              className={cn(
                "h-10 min-w-[3.25rem] rounded-full border-2 px-3.5 font-display text-base font-semibold transition-[transform,background-color,color,border-color] active:scale-95 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-accent bg-accent text-accent-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-accent/60",
              )}
            >
              {short}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StepField
          id={`${baseId}-minutes`}
          label="Minutes"
          value={minutes}
          disabled={disabled}
          onInput={(e) => onChange(joinDuration(digitsToNumber(e.target.value), seconds))}
          onDecrement={() => step(-MINUTE_MS)}
          onIncrement={() => step(MINUTE_MS)}
          decrementLabel="Remove a minute"
          incrementLabel="Add a minute"
          canDecrement={canDecrement}
          canIncrement={canIncrement}
        />
        <StepField
          id={`${baseId}-seconds`}
          label="Seconds"
          value={seconds}
          disabled={disabled}
          onInput={(e) => onChange(joinDuration(minutes, digitsToNumber(e.target.value)))}
          onDecrement={() => step(-FIVE_SECONDS_MS)}
          onIncrement={() => step(FIVE_SECONDS_MS)}
          decrementLabel="Remove 5 seconds"
          incrementLabel="Add 5 seconds"
          canDecrement={canDecrement}
          canIncrement={canIncrement}
        />
      </div>
    </fieldset>
  );
}

export const DurationPicker = memo(DurationPickerImpl);
DurationPicker.displayName = "DurationPicker";
