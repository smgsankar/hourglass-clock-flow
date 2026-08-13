import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { Hourglass } from "@/components/Hourglass";
import { TimerControls } from "@/components/TimerControls";
import { TimerDisplay, type TimerStatus } from "@/components/TimerDisplay";
import { TimerInput } from "@/components/TimerInput";
import { useTimer } from "@/hooks/useTimer";
import { formatSpokenTime, shouldAnnounceRemaining } from "@/lib/time";

const COMPLETION_CHIME =
  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2keIzuKy/LVgiMFl5xgLowv0cyZr8eOqPDhmvhzyVrJyMzv8fGHoG5z5MvEMOwS2M7dFT9h9wLiIo9e9tZo5lBo0hbKdoQ9lW5e5G8J0OHEL6H5pxXe";

const SHORTCUTS = [
  { keys: "Space", action: "Start or pause the timer" },
  { keys: "S", action: "Stop the timer" },
  { keys: "R", action: "Reset to the set duration" },
];

/** True when the keystroke belongs to whatever the user is typing in / operating. */
const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName);
};

const Index = () => {
  const {
    totalSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    isComplete,
    progress,
    start,
    pause,
    stop,
    reset,
    setTime,
  } = useTimer(300);

  const [announcement, setAnnouncement] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const lastAnnouncedRef = useRef<number | null>(null);

  const status: TimerStatus = isComplete
    ? "complete"
    : isPaused
      ? "paused"
      : isRunning
        ? "running"
        : "idle";

  // Completion: sound, toast and an assertive announcement.
  useEffect(() => {
    if (!isComplete) {
      setAlertMessage("");
      return;
    }

    try {
      void new Audio(COMPLETION_CHIME).play().catch(() => {
        /* autoplay may be blocked — the toast and live region still fire */
      });
    } catch {
      /* Audio is unavailable in this environment; ignore. */
    }

    setAlertMessage("Time is up. Your timer has finished.");
    toast.success("Time's up!", {
      description: "Your timer has finished.",
      duration: 8000,
    });
  }, [isComplete]);

  // Throttled progress announcements so screen readers are not flooded.
  useEffect(() => {
    if (status !== "running") {
      lastAnnouncedRef.current = null;
      return;
    }

    if (
      shouldAnnounceRemaining(remainingSeconds) &&
      lastAnnouncedRef.current !== remainingSeconds
    ) {
      lastAnnouncedRef.current = remainingSeconds;
      setAnnouncement(`${formatSpokenTime(remainingSeconds)} remaining`);
    }
  }, [status, remainingSeconds]);

  const handleStart = useCallback(() => {
    if (totalSeconds === 0) {
      setAnnouncement("Set a duration before starting the timer.");
      toast.error("Set a duration first");
      return;
    }

    const resuming = isPaused;
    start();
    setAnnouncement(
      `${resuming ? "Timer resumed" : "Timer started"}, ${formatSpokenTime(
        remainingSeconds
      )} remaining`
    );
  }, [totalSeconds, isPaused, start, remainingSeconds]);

  const handlePause = useCallback(() => {
    pause();
    setAnnouncement(`Timer paused at ${formatSpokenTime(remainingSeconds)} remaining`);
  }, [pause, remainingSeconds]);

  const handleStop = useCallback(() => {
    stop();
    setAnnouncement(`Timer stopped at ${formatSpokenTime(remainingSeconds)} remaining`);
  }, [stop, remainingSeconds]);

  const handleReset = useCallback(() => {
    reset();
    setAnnouncement(`Timer reset to ${formatSpokenTime(totalSeconds)}`);
  }, [reset, totalSeconds]);

  // Keyboard shortcuts, ignored while the user is typing or operating a control
  // so they never steal Space from a focused button.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (isInteractiveTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (event.key === " " || key === "k") {
        event.preventDefault();
        if (isRunning && !isPaused) handlePause();
        else handleStart();
      } else if (key === "s") {
        event.preventDefault();
        handleStop();
      } else if (key === "r") {
        event.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleStart, handlePause, handleStop, handleReset, isRunning, isPaused]);

  return (
    <AppLayout
      footerContent={
        <div>
          <h2 className="mb-2 font-medium text-foreground">Keyboard shortcuts</h2>
          <dl className="flex flex-wrap gap-x-6 gap-y-1">
            {SHORTCUTS.map(({ keys, action }) => (
              <div key={keys} className="flex items-center gap-2">
                <dt>
                  <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                    {keys}
                  </kbd>
                </dt>
                <dd>{action}</dd>
              </div>
            ))}
          </dl>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Sand Timer</h1>
          <p className="mx-auto max-w-prose text-lg text-muted-foreground">
            A calm hourglass timer for focused work. Everything here is reachable by
            keyboard and announced to screen readers.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="timer-heading" className="surface-card p-6 sm:p-8">
            <h2 id="timer-heading" className="sr-only">
              Timer
            </h2>
            <div className="flex flex-col items-center gap-8">
              <Hourglass
                progress={progress}
                isRunning={status === "running"}
                valueText={`${Math.round(progress)}% elapsed`}
              />
              <TimerDisplay
                remainingSeconds={remainingSeconds}
                status={status}
                announcement={announcement}
                alert={alertMessage}
              />
              <TimerControls
                isRunning={isRunning}
                isPaused={isPaused}
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
                onReset={handleReset}
                disabled={totalSeconds === 0}
              />
            </div>
          </section>

          <section aria-labelledby="setup-heading" className="surface-card p-6 sm:p-8">
            <h2 id="setup-heading" className="mb-4 text-xl font-semibold">
              Set duration
            </h2>
            <TimerInput
              totalSeconds={totalSeconds}
              onTimeSet={setTime}
              disabled={isRunning}
            />
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
