import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { HourglassArt } from "@/components/hourglass/HourglassArt";
import { CompletionCelebration } from "@/components/timer/CompletionCelebration";
import { DurationPicker } from "@/components/timer/DurationPicker";
import { TimeDisplay } from "@/components/timer/TimeDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { Button } from "@/components/ui/button";
import { formatClock, splitDuration } from "@/features/timer/format";
import type { TimerStatus } from "@/features/timer/timerMachine";
import { useSandTimer } from "@/features/timer/useSandTimer";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { playChime, primeAudio, readMuted, writeMuted } from "@/lib/chime";
import { cn } from "@/lib/utils";

const STATUS_CAPTION: Record<TimerStatus, string> = {
  idle: "Ready when you are - pick a time!",
  running: "Sand's flowing. You've got this.",
  paused: "Taking a breather...",
  finished: "Ding! Every grain is home.",
};

const STATUS_CHIP: Record<TimerStatus, { label: string; className: string }> = {
  idle: { label: "Ready", className: "bg-secondary text-secondary-foreground" },
  running: { label: "Flowing", className: "bg-accent text-accent-foreground" },
  paused: { label: "Paused", className: "bg-muted text-muted-foreground" },
  finished: { label: "Done!", className: "bg-primary text-primary-foreground" },
};

const ONE_MINUTE_S = 60;

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function describeDuration(ms: number): string {
  const { minutes, seconds } = splitDuration(ms);
  return `${plural(minutes, "minute")} ${plural(seconds, "second")}`;
}

function isTypingTarget(target: EventTarget | null, includeButtons: boolean): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const selector = includeButtons
    ? "input, textarea, select, [contenteditable], button, [role='button']"
    : "input, textarea, select, [contenteditable]";
  return target.closest(selector) !== null;
}

function hasModifier(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
}

const Index = () => {
  const reducedMotion = useReducedMotion();
  const [muted, setMuted] = useState<boolean>(readMuted);
  const mutedRef = useRef(muted);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const handleFinish = useCallback(() => {
    setCelebrating(true);
    if (!mutedRef.current) playChime();
  }, []);

  const { status, durationMs, remainingMs, progress, setDuration, start, pause, resume, reset, toggle } =
    useSandTimer({ onFinish: handleFinish });

  /* ---------------- handlers (stable, so the memoised panels skip rAF renders) ---------------- */

  const handleStart = useCallback(() => {
    primeAudio();
    setCelebrating(false);
    start();
  }, [start]);

  const handleReset = useCallback(() => {
    setCelebrating(false);
    reset();
  }, [reset]);

  const handleDurationChange = useCallback(
    (ms: number) => {
      setCelebrating(false);
      setDuration(ms);
    },
    [setDuration],
  );

  const handleDismiss = useCallback(() => setCelebrating(false), []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    writeMuted(next);
  };

  /* ---------------- announcements (one polite live region) ---------------- */

  const [announcement, setAnnouncement] = useState({ id: 0, text: "" });
  const announce = useCallback((text: string) => setAnnouncement((a) => ({ id: a.id + 1, text })), []);
  const prevStatusRef = useRef<TimerStatus>(status);
  const minuteAnnouncedRef = useRef(true);

  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev === status) return;
    prevStatusRef.current = status;

    switch (status) {
      case "running":
        if (prev === "paused") {
          announce("Resumed");
        } else {
          // A run that starts under a minute never gets the "one minute left" nudge.
          minuteAnnouncedRef.current = Math.ceil(durationMs / 1000) < ONE_MINUTE_S;
          announce(`Timer started: ${describeDuration(durationMs)}`);
        }
        break;
      case "paused":
        announce(`Paused with ${formatClock(remainingMs)} left`);
        break;
      case "idle":
        announce(`Reset to ${formatClock(durationMs)}`);
        break;
      case "finished":
        announce("Time's up!");
        break;
      default: {
        const exhaustive: never = status;
        return exhaustive;
      }
    }
  }, [status, durationMs, remainingMs, announce]);

  useEffect(() => {
    if (status !== "running" || minuteAnnouncedRef.current) return;
    const seconds = Math.ceil(remainingMs / 1000);
    if (seconds < ONE_MINUTE_S && seconds > 0) {
      minuteAnnouncedRef.current = true;
      announce("One minute left");
    }
  }, [status, remainingMs, announce]);

  /* ---------------- keyboard: Space toggles, R resets (one listener, latest state via refs) ---------------- */

  const keyStateRef = useRef({ status, toggle, reset: handleReset });
  useEffect(() => {
    keyStateRef.current = { status, toggle, reset: handleReset };
  }, [status, toggle, handleReset]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const { status: current, toggle: doToggle, reset: doReset } = keyStateRef.current;

      if (e.code === "Space" || e.key === " ") {
        if (e.repeat || hasModifier(e) || isTypingTarget(e.target, true)) return;
        e.preventDefault();
        if (current === "idle" || current === "finished") {
          primeAudio();
          setCelebrating(false);
        }
        doToggle();
        return;
      }

      if (e.key === "r" || e.key === "R") {
        if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target, false)) return;
        doReset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---------------- render ---------------- */

  const pickerDisabled = status === "running" || status === "paused";
  const showCelebration = celebrating && status === "finished";
  const chip = STATUS_CHIP[status];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4 px-4 pt-6 sm:px-6 lg:pt-10">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sand <span className="text-primary">Timer</span>
          </h1>
          <p className="mt-1.5 max-w-md text-base text-muted-foreground sm:text-lg">
            Flip it, focus, and let the little guy do the counting.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute chime" : "Mute chime"}
          title={muted ? "Unmute chime" : "Mute chime"}
          className="h-11 w-11 shrink-0 rounded-full border-2 border-border bg-card/70 [&_svg]:size-5"
        >
          {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </Button>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-10">
        {/* Stage: the character */}
        <section
          aria-label="Hourglass"
          className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[2rem] border-2 border-border bg-card/60 px-4 pb-6 pt-10 shadow-sm backdrop-blur-sm sm:px-8 lg:pt-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sand-light/40 blur-2xl dark:bg-accent/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-[130%] -translate-x-1/2 rounded-[100%] bg-sand/20"
          />
          <span
            className={cn(
              "absolute left-4 top-4 rounded-full px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider transition-colors",
              chip.className,
            )}
          >
            {chip.label}
          </span>

          <HourglassArt
            progress={progress}
            status={status}
            reducedMotion={reducedMotion}
            className="relative h-64 lg:h-[26rem]"
          />

          <CompletionCelebration show={showCelebration} reducedMotion={reducedMotion} onDismiss={handleDismiss} />
        </section>

        {/* Panel: the controls */}
        <section
          aria-label="Timer"
          className="flex flex-col items-center gap-6 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-8"
        >
          <div className="flex flex-col items-center gap-2">
            <TimeDisplay remainingMs={remainingMs} status={status} />
            <p className="text-center font-semibold text-muted-foreground">{STATUS_CAPTION[status]}</p>
          </div>

          <DurationPicker valueMs={durationMs} onChange={handleDurationChange} disabled={pickerDisabled} />

          <TimerControls
            status={status}
            canStart={durationMs > 0}
            onStart={handleStart}
            onPause={pause}
            onResume={resume}
            onReset={handleReset}
          />

          <p className="hidden text-xs text-muted-foreground sm:block">
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans font-bold">Space</kbd>{" "}
            start/pause ·{" "}
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans font-bold">R</kbd> reset
          </p>
        </section>
      </main>

      <footer className="px-4 pb-6 text-center text-sm text-muted-foreground">
        Made with patience and roughly 4,000 grains of sand.
      </footer>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement.text && <span key={announcement.id}>{announcement.text}</span>}
      </div>
    </div>
  );
};

export default Index;
