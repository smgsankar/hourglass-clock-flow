import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export const TimerControls = ({ 
  isRunning, 
  isPaused, 
  onStart, 
  onPause, 
  onStop, 
  onReset,
  disabled 
}: TimerControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {!isRunning || isPaused ? (
        <Button
          onClick={onStart}
          disabled={disabled}
          size="lg"
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl timer-glow transition-all duration-300"
        >
          <Play className="w-5 h-5 mr-2" />
          {isPaused ? 'Resume' : 'Start'}
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="secondary"
          className="px-8 py-3 font-semibold rounded-2xl timer-glow transition-all duration-300"
        >
          <Pause className="w-5 h-5 mr-2" />
          Pause
        </Button>
      )}

      {(isRunning || isPaused) && (
        <Button
          onClick={onStop}
          size="lg"
          variant="destructive"
          className="px-6 py-3 font-semibold rounded-2xl timer-glow transition-all duration-300"
        >
          <Square className="w-5 h-5 mr-2" />
          Stop
        </Button>
      )}

      <Button
        onClick={onReset}
        size="lg"
        variant="outline"
        className="px-6 py-3 font-semibold rounded-2xl timer-glow bg-card/50 border-border/50 hover:bg-accent/50 transition-all duration-300"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Reset
      </Button>
    </div>
  );
};