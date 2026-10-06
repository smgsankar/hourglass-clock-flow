import { describe, expect, it } from 'vitest';

import { formatClock, joinDuration, splitDuration } from './format';

describe('formatClock', () => {
  it.each([
    [0, '00:00'],
    [-5, '00:00'],
    [Number.NaN, '00:00'],
    [1, '00:01'],
    [999, '00:01'],
    [1_000, '00:01'],
    [1_001, '00:02'],
    [59_999, '01:00'],
    [300_000, '05:00'],
    [5_999_000, '99:59'],
    [10_000_000, '99:59'],
  ])('formatClock(%s) -> %s', (ms, expected) => {
    expect(formatClock(ms)).toBe(expected);
  });
});

describe('splitDuration', () => {
  it.each([
    [0, 0, 0],
    [59_999, 0, 59],
    [61_500, 1, 1],
    [300_000, 5, 0],
    [5_999_000, 99, 59],
    [-1_000, 0, 0],
    [Number.NaN, 0, 0],
  ])('splitDuration(%s) -> %i:%i', (ms, minutes, seconds) => {
    expect(splitDuration(ms)).toEqual({ minutes, seconds });
  });
});

describe('joinDuration', () => {
  it.each([
    [5, 0, 300_000],
    [1, 30, 90_000],
    [99, 59, 5_999_000],
    [150, 0, 5_940_000],
    [0, 75, 59_000],
    [-3, -10, 0],
    [Number.NaN, 20, 20_000],
    [2, Number.NaN, 120_000],
    [1.9, 5.7, 65_000],
  ])('joinDuration(%s, %s) -> %i', (minutes, seconds, expected) => {
    expect(joinDuration(minutes, seconds)).toBe(expected);
  });

  it.each([0, 1_000, 59_000, 61_000, 300_000, 1_500_000, 5_999_000])(
    'round-trips %i through split/join',
    (ms) => {
      const { minutes, seconds } = splitDuration(ms);
      expect(joinDuration(minutes, seconds)).toBe(ms);
    },
  );
});
