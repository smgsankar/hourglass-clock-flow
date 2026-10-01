import { useState, useEffect, useCallback } from 'react';

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const useTimer = (initialSeconds: number = 300) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // One interval per run. The previous version listed remainingSeconds as a
  // dependency, so the interval was torn down and recreated every second —
  // each tick then landed a little late and a 5-minute timer drifted long.
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsPaused(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const start = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [remainingSeconds]);

  const pause = useCallback(() => setIsPaused(true), []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds]);

  const setTime = useCallback(
    (seconds: number) => {
      if (!isRunning) {
        setTotalSeconds(seconds);
        setRemainingSeconds(seconds);
      }
    },
    [isRunning],
  );

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const isComplete = remainingSeconds === 0 && totalSeconds > 0;

  return {
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
    formatTime: (seconds?: number) => formatTime(seconds ?? remainingSeconds),
  };
};
