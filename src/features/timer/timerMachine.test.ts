import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DURATION_MS,
  MAX_DURATION_MS,
  TIMER_ACTION_TYPES,
  TIMER_STATUSES,
  createTimerState,
  timerReducer,
  type TimerAction,
  type TimerState,
  type TimerStatus,
} from './timerMachine';

const T0 = 1_000_000;
const D = 10_000;

const run = (state: TimerState, ...actions: TimerAction[]) => actions.reduce(timerReducer, state);

/** One representative state per status, all with durationMs = D. */
const STATE_IN: Record<TimerStatus, () => TimerState> = {
  idle: () => createTimerState(D),
  running: () => run(createTimerState(D), { type: 'start', now: T0 }),
  paused: () => run(createTimerState(D), { type: 'start', now: T0 }, { type: 'pause', now: T0 + 4_000 }),
  finished: () => run(createTimerState(D), { type: 'start', now: T0 }, { type: 'tick', now: T0 + D }),
};

const ACTION_OF: Record<TimerAction['type'], TimerAction> = {
  setDuration: { type: 'setDuration', durationMs: 60_000 },
  start: { type: 'start', now: T0 + 5_000 },
  pause: { type: 'pause', now: T0 + 5_000 },
  resume: { type: 'resume', now: T0 + 5_000 },
  reset: { type: 'reset' },
  tick: { type: 'tick', now: T0 + 5_000 },
};

/** Every (status, action) pair that must be a same-reference no-op. */
const NO_OPS: Record<TimerStatus, TimerAction['type'][]> = {
  idle: ['pause', 'resume', 'reset', 'tick'],
  running: ['setDuration', 'start', 'resume'],
  paused: ['setDuration', 'start', 'pause', 'tick'],
  finished: ['pause', 'resume', 'tick'],
};

describe('createTimerState', () => {
  it.each([
    [undefined, DEFAULT_DURATION_MS],
    [90_000, 90_000],
    [1_999, 1_000],
    [-5, 0],
    [Number.NaN, 0],
    [MAX_DURATION_MS + 60_000, MAX_DURATION_MS],
  ])('createTimerState(%s) -> idle with durationMs %i', (input, expected) => {
    expect(createTimerState(input)).toEqual({
      status: 'idle',
      durationMs: expected,
      remainingMs: expected,
      endsAt: null,
    });
  });
});

describe('timerReducer transitions', () => {
  it.each<[string, TimerState, TimerAction, TimerState]>([
    [
      'start from idle',
      STATE_IN.idle(),
      { type: 'start', now: T0 },
      { status: 'running', durationMs: D, remainingMs: D, endsAt: T0 + D },
    ],
    [
      'start from finished restarts',
      STATE_IN.finished(),
      { type: 'start', now: T0 + 50_000 },
      { status: 'running', durationMs: D, remainingMs: D, endsAt: T0 + 50_000 + D },
    ],
    [
      'pause from running',
      STATE_IN.running(),
      { type: 'pause', now: T0 + 3_250 },
      { status: 'paused', durationMs: D, remainingMs: D - 3_250, endsAt: null },
    ],
    [
      'pause at zero -> finished',
      STATE_IN.running(),
      { type: 'pause', now: T0 + D + 500 },
      { status: 'finished', durationMs: D, remainingMs: 0, endsAt: null },
    ],
    [
      'resume from paused',
      STATE_IN.paused(),
      { type: 'resume', now: T0 + 20_000 },
      { status: 'running', durationMs: D, remainingMs: D - 4_000, endsAt: T0 + 20_000 + D - 4_000 },
    ],
    [
      'tick while running derives remaining from endsAt',
      STATE_IN.running(),
      { type: 'tick', now: T0 + 2_500 },
      { status: 'running', durationMs: D, remainingMs: D - 2_500, endsAt: T0 + D },
    ],
    [
      'tick reaching zero -> finished',
      STATE_IN.running(),
      { type: 'tick', now: T0 + D },
      { status: 'finished', durationMs: D, remainingMs: 0, endsAt: null },
    ],
    [
      'tick past the deadline clamps to 0',
      STATE_IN.running(),
      { type: 'tick', now: T0 + D * 5 },
      { status: 'finished', durationMs: D, remainingMs: 0, endsAt: null },
    ],
    [
      'tick with a backward clock clamps to durationMs',
      STATE_IN.running(),
      { type: 'tick', now: T0 - 60_000 },
      { status: 'running', durationMs: D, remainingMs: D, endsAt: T0 + D },
    ],
    [
      'pause with a backward clock clamps to durationMs',
      STATE_IN.running(),
      { type: 'pause', now: T0 - 60_000 },
      { status: 'paused', durationMs: D, remainingMs: D, endsAt: null },
    ],
    ...TIMER_STATUSES.filter((s) => s !== 'idle').map(
      (s): [string, TimerState, TimerAction, TimerState] => [
        `reset from ${s} keeps durationMs`,
        STATE_IN[s](),
        { type: 'reset' },
        { status: 'idle', durationMs: D, remainingMs: D, endsAt: null },
      ],
    ),
    [
      'setDuration in idle',
      STATE_IN.idle(),
      { type: 'setDuration', durationMs: 65_000 },
      { status: 'idle', durationMs: 65_000, remainingMs: 65_000, endsAt: null },
    ],
    [
      'setDuration in finished -> idle',
      STATE_IN.finished(),
      { type: 'setDuration', durationMs: 65_000 },
      { status: 'idle', durationMs: 65_000, remainingMs: 65_000, endsAt: null },
    ],
  ])('%s', (_name, state, action, expected) => {
    expect(timerReducer(state, action)).toEqual(expected);
  });

  it.each([
    [61_999, 61_000],
    [999, 0],
    [-1_000, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, MAX_DURATION_MS],
    [MAX_DURATION_MS + 1, MAX_DURATION_MS],
    [MAX_DURATION_MS, MAX_DURATION_MS],
  ])('setDuration(%s) normalises to %i', (input, expected) => {
    const next = timerReducer(STATE_IN.idle(), { type: 'setDuration', durationMs: input });
    expect(next.durationMs).toBe(expected);
    expect(next.remainingMs).toBe(expected);
  });
});

describe('timerReducer no-ops return the same reference', () => {
  const cases = TIMER_STATUSES.flatMap((status) =>
    NO_OPS[status].map((type) => [status, type] as const),
  );

  it.each(cases)('%s + %s', (status, type) => {
    const state = STATE_IN[status]();
    expect(timerReducer(state, ACTION_OF[type])).toBe(state);
  });

  it.each<[string, TimerState, TimerAction]>([
    ['start with durationMs 0 from idle', createTimerState(0), { type: 'start', now: T0 }],
    [
      'start with durationMs 0 from finished',
      // A zero-duration timer cannot finish via the reducer; build the state directly.
      { status: 'finished', durationMs: 0, remainingMs: 0, endsAt: null },
      { type: 'start', now: T0 },
    ],
    ['setDuration to the same value in idle', STATE_IN.idle(), { type: 'setDuration', durationMs: D + 400 }],
    ['tick that does not change remainingMs', STATE_IN.running(), { type: 'tick', now: T0 }],
  ])('%s', (_name, state, action) => {
    expect(timerReducer(state, action)).toBe(state);
  });
});

describe('timerReducer timing', () => {
  it('is drift-free across pause/resume: total running time equals durationMs', () => {
    // Run 3s, pause 100s, run 2.5s, pause 7s, then finish exactly at the remaining 4.5s.
    let s = run(
      createTimerState(D),
      { type: 'start', now: T0 },
      { type: 'tick', now: T0 + 3_000 },
      { type: 'pause', now: T0 + 3_000 },
      { type: 'resume', now: T0 + 103_000 },
      { type: 'pause', now: T0 + 105_500 },
      { type: 'resume', now: T0 + 112_500 },
    );
    expect(s).toMatchObject({ status: 'running', remainingMs: 4_500, endsAt: T0 + 117_000 });
    s = timerReducer(s, { type: 'tick', now: T0 + 116_999 });
    expect(s).toMatchObject({ status: 'running', remainingMs: 1 });
    s = timerReducer(s, { type: 'tick', now: T0 + 117_000 });
    expect(s).toMatchObject({ status: 'finished', remainingMs: 0, endsAt: null });
  });

  it('never mutates its input', () => {
    const state = Object.freeze(STATE_IN.running());
    expect(() => timerReducer(state, { type: 'tick', now: T0 + 1_000 })).not.toThrow();
  });
});

describe('vocabulary parity', () => {
  it.each(TIMER_STATUSES)('status %s is reachable from createTimerState()', (status) => {
    // STATE_IN builds each status purely via actions from createTimerState.
    expect(STATE_IN[status]().status).toBe(status);
  });

  it('TIMER_STATUSES and TIMER_ACTION_TYPES have no duplicates', () => {
    expect(new Set(TIMER_STATUSES).size).toBe(TIMER_STATUSES.length);
    expect(new Set(TIMER_ACTION_TYPES).size).toBe(TIMER_ACTION_TYPES.length);
  });

  it.each(TIMER_ACTION_TYPES)('action %s changes state from at least one status', (type) => {
    const changesSomething = TIMER_STATUSES.some((status) => {
      const state = STATE_IN[status]();
      return timerReducer(state, ACTION_OF[type]) !== state;
    });
    expect(changesSomething).toBe(true);
  });
});
