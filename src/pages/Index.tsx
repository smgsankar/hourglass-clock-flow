import { useEffect } from 'react';
import { Hourglass } from '@/components/Hourglass';
import { TimerInput } from '@/components/TimerInput';
import { TimerControls } from '@/components/TimerControls';
import { useTimer } from '@/hooks/useTimer';
import { toast } from 'sonner';

// Timer-first layout: the hourglass and the remaining time are the page, and
// everything else — presets, the exact minutes/seconds, the buttons — sits
// below them in one column. The previous three-column arrangement hid the
// remaining time until the timer had been started once, which is the one
// number a timer exists to show.
const Index = () => {
  const timer = useTimer(300); // Default 5 minutes

  useEffect(() => {
    if (!timer.isComplete) return;
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2keIzuKy/LVgiMFl5xgLowv0cyZr8eOqPDhmvhzyVrJyMzv8fGHoG5z5MvEMOwS2M7dFT9h9wLiIo9e9tZo5lBo0hbKdoQ9lW5e5G8J0OHEL6H5pxXe');
      audio.play().catch(() => {});
    } catch {
      // A browser that refuses autoplay still gets the toast.
    }
    toast.success("Time's up! ⏰", {
      description: 'Your timer has completed.',
      duration: 5000,
    });
  }, [timer.isComplete]);

  const handleStart = () => {
    if (timer.totalSeconds > 0) {
      timer.start();
    } else {
      toast.error('Set a time first');
    }
  };

  const lastMinute = timer.remainingSeconds > 0 && timer.remainingSeconds < 60;
  const status = timer.isComplete
    ? 'Completed'
    : timer.isRunning && !timer.isPaused
      ? 'Running'
      : timer.isPaused
        ? 'Paused'
        : 'Ready';

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-14">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
          Sand Timer
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          Set a time, flip the glass, stay with it.
        </p>
      </header>

      <section
        aria-label="Timer"
        className="flex flex-col items-center gap-6 w-full max-w-md"
      >
        <Hourglass isRunning={timer.isRunning && !timer.isPaused} progress={timer.progress} />

        {/* Remaining time is always visible — before, during and after a run. */}
        <div className="text-center" role="timer" aria-live="polite" aria-atomic="true">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {status}
          </div>
          <div
            className={`mt-1 text-6xl sm:text-7xl font-mono font-bold tabular-nums transition-colors duration-300 ${
              lastMinute ? 'text-destructive animate-pulse-glow' : 'text-foreground'
            }`}
          >
            {timer.formatTime()}
          </div>
          {lastMinute && (
            <div className="text-sm font-medium text-destructive mt-1 animate-pulse">
              Less than a minute left
            </div>
          )}
          {timer.isComplete && (
            <div className="mt-3 inline-block rounded-2xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-timer-complete">
              🎉 Great job staying focused
            </div>
          )}
        </div>

        <TimerControls
          isRunning={timer.isRunning}
          isPaused={timer.isPaused}
          onStart={handleStart}
          onPause={timer.pause}
          onStop={timer.stop}
          onReset={timer.reset}
          disabled={timer.totalSeconds === 0}
        />

        <TimerInput
          totalSeconds={timer.totalSeconds}
          onTimeSet={timer.setTime}
          disabled={timer.isRunning}
        />
      </section>

      <footer className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">Focus • Productivity • Mindfulness</p>
      </footer>
    </main>
  );
};

export default Index;
