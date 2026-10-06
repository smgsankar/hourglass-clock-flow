/**
 * Pure sand-timer state machine (contract C1).
 *
 * Time is derived from `endsAt` (an epoch-ms deadline on the Date.now() basis),
 * never by decrementing per tick. The reducer never reads the clock itself:
 * every time-dependent action carries `now`. Any action that does not change
 * the state returns the SAME object reference.
 */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerState {
  status: TimerStatus;
  /** Integer ms, whole seconds, 0..MAX_DURATION_MS. */
  durationMs: number;
  /** Integer ms, 0..durationMs. */
  remainingMs: number;
  /** Epoch ms deadline; non-null ONLY while status === 'running'. */
  endsAt: number | null;
}

/** 5:00, preserved from the previous app. */
export const DEFAULT_DURATION_MS = 300_000;
/** 99:59, preserved from the previous app. */
export const MAX_DURATION_MS = 5_999_000;

export type TimerAction =
  | { type: 'setDuration'; durationMs: number }
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'reset' }
  | { type: 'tick'; now: number };

export const TIMER_STATUSES: readonly TimerStatus[] = ['idle', 'running', 'paused', 'finished'];

export const TIMER_ACTION_TYPES: readonly TimerAction['type'][] = [
  'setDuration',
  'start',
  'pause',
  'resume',
  'reset',
  'tick',
];

/** Clamp to [0, MAX_DURATION_MS] and floor to whole seconds; NaN/negative -> 0. */
function normaliseDuration(ms: number): number {
  if (typeof ms !== 'number' || Number.isNaN(ms) || ms <= 0) return 0;
  return Math.floor(Math.min(ms, MAX_DURATION_MS) / 1000) * 1000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function remainingAt(state: TimerState, now: number): number {
  // endsAt is non-null whenever this is called (status === 'running').
  return clamp((state.endsAt as number) - now, 0, state.durationMs);
}

function idle(durationMs: number): TimerState {
  return { status: 'idle', durationMs, remainingMs: durationMs, endsAt: null };
}

function finished(durationMs: number): TimerState {
  return { status: 'finished', durationMs, remainingMs: 0, endsAt: null };
}

export function createTimerState(durationMs: number = DEFAULT_DURATION_MS): TimerState {
  return idle(normaliseDuration(durationMs));
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'setDuration': {
      if (state.status === 'running' || state.status === 'paused') return state;
      const durationMs = normaliseDuration(action.durationMs);
      if (
        state.status === 'idle' &&
        state.durationMs === durationMs &&
        state.remainingMs === durationMs &&
        state.endsAt === null
      ) {
        return state;
      }
      return idle(durationMs);
    }

    case 'start': {
      if (state.status !== 'idle' && state.status !== 'finished') return state;
      if (state.durationMs === 0) return state;
      return {
        status: 'running',
        durationMs: state.durationMs,
        remainingMs: state.durationMs,
        endsAt: action.now + state.durationMs,
      };
    }

    case 'pause': {
      if (state.status !== 'running') return state;
      const remainingMs = remainingAt(state, action.now);
      if (remainingMs === 0) return finished(state.durationMs);
      return { status: 'paused', durationMs: state.durationMs, remainingMs, endsAt: null };
    }

    case 'resume': {
      if (state.status !== 'paused') return state;
      return {
        status: 'running',
        durationMs: state.durationMs,
        remainingMs: state.remainingMs,
        endsAt: action.now + state.remainingMs,
      };
    }

    case 'reset': {
      if (
        state.status === 'idle' &&
        state.remainingMs === state.durationMs &&
        state.endsAt === null
      ) {
        return state;
      }
      return idle(state.durationMs);
    }

    case 'tick': {
      if (state.status !== 'running') return state;
      const remainingMs = remainingAt(state, action.now);
      if (remainingMs === 0) return finished(state.durationMs);
      if (remainingMs === state.remainingMs) return state;
      return { ...state, remainingMs };
    }

    default: {
      const unreachable: never = action;
      void unreachable;
      return state;
    }
  }
}
