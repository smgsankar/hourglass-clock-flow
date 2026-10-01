import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TimerInputProps {
  /** The timer's current total, so presets and the fields stay in step. */
  totalSeconds: number;
  onTimeSet: (totalSeconds: number) => void;
  disabled?: boolean;
}

/** One tap for the durations people actually set; the fields cover the rest. */
export const PRESETS: { label: string; seconds: number }[] = [
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '25 min', seconds: 1500 },
];

const clamp = (value: string, max: number) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
};

export const TimerInput = ({ totalSeconds, onTimeSet, disabled }: TimerInputProps) => {
  const [minutes, setMinutes] = useState(String(Math.floor(totalSeconds / 60)));
  const [seconds, setSeconds] = useState(String(totalSeconds % 60));

  // A preset (or a reset) changes the total from outside; reflect it in the
  // fields rather than letting them disagree with the hourglass.
  useEffect(() => {
    setMinutes(String(Math.floor(totalSeconds / 60)));
    setSeconds(String(totalSeconds % 60));
  }, [totalSeconds]);

  const commit = (m: string, s: string) => onTimeSet(clamp(m, 99) * 60 + clamp(s, 59));

  const handleMinutes = (value: string) => {
    setMinutes(value);
    commit(value, seconds);
  };
  const handleSeconds = (value: string) => {
    setSeconds(value);
    commit(minutes, value);
  };

  return (
    <Card className="w-full p-5 timer-glow bg-card/80 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Quick presets">
          {PRESETS.map((p) => (
            <Button
              key={p.seconds}
              type="button"
              size="sm"
              variant={totalSeconds === p.seconds ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => onTimeSet(p.seconds)}
              className="rounded-full px-4"
              aria-pressed={totalSeconds === p.seconds}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex items-end justify-center gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="minutes" className="text-xs font-medium text-muted-foreground">
              Minutes
            </Label>
            <Input
              id="minutes"
              type="number"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => handleMinutes(e.target.value)}
              min="0"
              max="99"
              disabled={disabled}
              className="w-20 text-center text-lg font-mono tabular-nums bg-input/50 border-border/50 focus:border-primary focus:ring-primary/20"
            />
          </div>
          <div className="pb-2 text-2xl font-light text-muted-foreground" aria-hidden="true">
            :
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seconds" className="text-xs font-medium text-muted-foreground">
              Seconds
            </Label>
            <Input
              id="seconds"
              type="number"
              inputMode="numeric"
              value={seconds}
              onChange={(e) => handleSeconds(e.target.value)}
              min="0"
              max="59"
              disabled={disabled}
              className="w-20 text-center text-lg font-mono tabular-nums bg-input/50 border-border/50 focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
