import { useState, useEffect } from 'react';
import { Hourglass } from '@/components/Hourglass';
import { TimerInput } from '@/components/TimerInput';
import { TimerControls } from '@/components/TimerControls';
import { useTimer } from '@/hooks/useTimer';
import { toast } from 'sonner';

const Index = () => {
  const timer = useTimer(300); // Default 5 minutes
  const [hasStarted, setHasStarted] = useState(false);

  // Handle timer completion
  useEffect(() => {
    if (timer.isComplete) {
      // Play notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2keIzuKy/LVgiMFl5xgLowv0cyZr8eOqPDhmvhzyVrJyMzv8fGHoG5z5MvEMOwS2M7dFT9h9wLiIo9e9tZo5lBo0hbKdoQ9lW5e5G8J0OHEL6H5pxXe');
        audio.play().catch(() => {}); // Ignore if audio fails
      } catch (error) {
        // Ignore audio errors
      }
      
      toast.success('Time\'s up! ⏰', {
        description: 'Your timer has completed successfully.',
        duration: 5000,
      });
      
      setHasStarted(false);
    }
  }, [timer.isComplete]);

  const handleStart = () => {
    if (timer.totalSeconds > 0) {
      timer.start();
      setHasStarted(true);
    } else {
      toast.error('Please set a time first');
    }
  };

  const handleReset = () => {
    timer.reset();
    setHasStarted(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent mb-4">
          Sand Timer
        </h1>
        <p className="text-xl text-muted-foreground max-w-md">
          A beautiful hourglass timer to help you stay focused and productive
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl w-full">
        {/* Timer Input */}
        <div className="flex-shrink-0">
          <TimerInput
            onTimeSet={timer.setTime}
            disabled={timer.isRunning}
          />
        </div>

        {/* Hourglass */}
        <div className="flex-shrink-0">
          <Hourglass
            isRunning={timer.isRunning && !timer.isPaused}
            progress={timer.progress}
            onComplete={() => {}}
          />
        </div>

        {/* Current Time Display & Controls */}
        <div className="flex flex-col items-center gap-8">
          {hasStarted && (
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-2">Time Remaining</div>
              <div className={`text-6xl font-mono font-bold transition-colors duration-300 ${
                timer.remainingSeconds < 60 ? 'text-destructive animate-pulse-glow' : 'text-foreground'
              }`}>
                {timer.formatTime()}
              </div>
              {timer.remainingSeconds < 60 && timer.remainingSeconds > 0 && (
                <div className="text-sm font-medium text-destructive mt-2 animate-pulse">
                  Less than a minute left!
                </div>
              )}
            </div>
          )}

          <TimerControls
            isRunning={timer.isRunning}
            isPaused={timer.isPaused}
            onStart={handleStart}
            onPause={timer.pause}
            onStop={timer.stop}
            onReset={handleReset}
            disabled={timer.totalSeconds === 0}
          />

          {timer.isComplete && (
            <div className="text-center animate-timer-complete p-4 rounded-2xl bg-primary/10">
              <div className="text-2xl font-bold text-primary mb-2">🎉 Completed!</div>
              <div className="text-sm text-muted-foreground">Great job staying focused!</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          Focus • Productivity • Mindfulness
        </p>
      </div>
    </div>
  );
};

export default Index;
