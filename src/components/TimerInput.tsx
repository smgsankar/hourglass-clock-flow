import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface TimerInputProps {
  onTimeSet: (totalSeconds: number) => void;
  disabled?: boolean;
}

export const TimerInput = ({ onTimeSet, disabled }: TimerInputProps) => {
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');

  const handleMinutesChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= 99) {
      setMinutes(value);
      onTimeSet((num * 60) + (parseInt(seconds) || 0));
    }
  };

  const handleSecondsChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= 59) {
      setSeconds(value);
      onTimeSet((parseInt(minutes) || 0) * 60 + num);
    }
  };

  return (
    <Card className="p-6 timer-glow bg-card/80 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Set Timer</h3>
          <p className="text-sm text-muted-foreground">Enter your desired time</p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="minutes" className="text-sm font-medium">Minutes</Label>
            <Input
              id="minutes"
              type="number"
              value={minutes}
              onChange={(e) => handleMinutesChange(e.target.value)}
              min="0"
              max="99"
              disabled={disabled}
              className="w-20 text-center text-lg font-mono bg-input/50 border-border/50 focus:border-primary focus:ring-primary/20"
            />
          </div>
          
          <div className="mt-6 text-2xl font-light text-muted-foreground">:</div>
          
          <div className="space-y-2">
            <Label htmlFor="seconds" className="text-sm font-medium">Seconds</Label>
            <Input
              id="seconds"
              type="number"
              value={seconds}
              onChange={(e) => handleSecondsChange(e.target.value)}
              min="0"
              max="59"
              disabled={disabled}
              className="w-20 text-center text-lg font-mono bg-input/50 border-border/50 focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-primary">
            {minutes.padStart(2, '0')}:{seconds.padStart(2, '0')}
          </div>
        </div>
      </div>
    </Card>
  );
};