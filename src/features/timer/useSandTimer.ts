import { useCallback, useEffect, useReducer, useRef } from 'react';

import { createTimerState, timerReducer, type TimerStatus } from './timerMachine';

/** Extra delay so the deadline timeout lands just after endsAt, not just before. */
const DEADLINE_SLACK_MS = 20;

export interface SandTimer {
  status: TimerStatus;
  durationMs: number;
  remainingMs: number;
  /** 0..1 = (durationMs-remainingMs)/durationMs; 0 when durationMs===0; exactly 1 when finished. */
  progress: number;
  setDuration(ms: number): void;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  /** idle|finished -> start, running -> pause, paused -> resume. */
  toggle(): void;
}

interface UseSandTimerOptions {
  initialDurationMs?: number;
  onFinish?: () => void;
}

function computeProgress(status: TimerStatus, durationMs: number, remainingMs: number): number {
  if (durationMs === 0) return 0;
  if (status === 'finished') return 1;
  return Math.min(1, Math.max(0, (durationMs - remainingMs) / durationMs));
}

/**
 * React binding for the pure timer machine (contract C2). The clock is read
 * here (Date.now()) and passed into the reducer as `now`.
 */
export function useSandTimer(opts: UseSandTimerOptions = {}): SandTimer {
  const { initialDurationMs, onFinish } = opts;
  const [state, dispatch] = useReducer(timerReducer, initialDurationMs, createTimerState);
  const { status, durationMs, remainingMs, endsAt } = state;

  // Latest values for stable callbacks; updated every render.
  const statusRef = useRef<TimerStatus>(status);
  statusRef.current = status;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // rAF tick loop, only while running.
  useEffect(() => {
    if (status !== 'running') return undefined;
    let frame = 0;
    const loop = () => {
      dispatch({ type: 'tick', now: Date.now() });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [status]);

  // One deadline timeout so a hidden tab (rAF suspended) still finishes.
  useEffect(() => {
    if (status !== 'running' || endsAt === null) return undefined;
    const delay = Math.max(0, endsAt - Date.now()) + DEADLINE_SLACK_MS;
    const id = setTimeout(() => dispatch({ type: 'tick', now: Date.now() }), delay);
    return () => clearTimeout(id);
  }, [status, endsAt]);

  // Catch up immediately when the tab becomes visible again (no-op unless running).
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        dispatch({ type: 'tick', now: Date.now() });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // onFinish exactly once per run, on the running -> finished transition.
  const prevStatusRef = useRef<TimerStatus>(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === 'running' && status === 'finished') {
      onFinishRef.current?.();
    }
  }, [status]);

  const setDuration = useCallback((ms: number) => dispatch({ type: 'setDuration', durationMs: ms }), []);
  const start = useCallback(() => dispatch({ type: 'start', now: Date.now() }), []);
  const pause = useCallback(() => dispatch({ type: 'pause', now: Date.now() }), []);
  const resume = useCallback(() => dispatch({ type: 'resume', now: Date.now() }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const toggle = useCallback(() => {
    const now = Date.now();
    switch (statusRef.current) {
      case 'idle':
      case 'finished':
        dispatch({ type: 'start', now });
        return;
      case 'running':
        dispatch({ type: 'pause', now });
        return;
      case 'paused':
        dispatch({ type: 'resume', now });
        return;
    }
  }, []);

  return {
    status,
    durationMs,
    remainingMs,
    progress: computeProgress(status, durationMs, remainingMs),
    setDuration,
    start,
    pause,
    resume,
    reset,
    toggle,
  };
}
