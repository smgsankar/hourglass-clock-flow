import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  THEME_CYCLE,
  describeTheme,
  nextTheme,
  normalizeTheme,
  shouldUseDark,
} from './theme.ts';

describe('normalizeTheme', () => {
  it('keeps every value in the cycle as-is', () => {
    for (const theme of THEME_CYCLE) {
      assert.equal(normalizeTheme(theme), theme);
    }
  });

  it('falls back to system when the theme has not been read yet', () => {
    assert.equal(normalizeTheme(undefined), 'system');
    assert.equal(normalizeTheme(null), 'system');
  });

  it('falls back to system for stale or corrupt stored values', () => {
    assert.equal(normalizeTheme('sepia'), 'system');
    assert.equal(normalizeTheme(''), 'system');
    assert.equal(normalizeTheme('Dark'), 'system');
  });
});

describe('nextTheme', () => {
  it('cycles light to dark to system and back to light', () => {
    assert.equal(nextTheme('light'), 'dark');
    assert.equal(nextTheme('dark'), 'system');
    assert.equal(nextTheme('system'), 'light');
  });

  it('returns to the starting point after a full cycle', () => {
    const cycled = THEME_CYCLE.reduce<string>((theme) => nextTheme(theme), 'light');
    assert.equal(cycled, 'light');
  });

  it('reaches every option, so none of them are strandable', () => {
    const visited = new Set<string>();
    let theme: string = 'light';
    for (let i = 0; i < THEME_CYCLE.length; i += 1) {
      visited.add(theme);
      theme = nextTheme(theme);
    }
    assert.deepEqual([...visited].sort(), [...THEME_CYCLE].sort());
  });

  it('starts the cycle from light when the stored value is unusable', () => {
    assert.equal(nextTheme(undefined), 'light');
    assert.equal(nextTheme('sepia'), 'light');
  });
});

describe('describeTheme', () => {
  it('names the current theme and the one a click will select', () => {
    assert.equal(
      describeTheme('light', 'dark'),
      'Theme: Light. Switch to dark.'
    );
    assert.equal(
      describeTheme('system', 'light'),
      'Theme: System. Switch to light.'
    );
  });
});

describe('shouldUseDark', () => {
  it('honours an explicit choice regardless of the system preference', () => {
    assert.equal(shouldUseDark('dark', false), true);
    assert.equal(shouldUseDark('dark', true), true);
    assert.equal(shouldUseDark('light', true), false);
    assert.equal(shouldUseDark('light', false), false);
  });

  it('follows the system preference when set to system', () => {
    assert.equal(shouldUseDark('system', true), true);
    assert.equal(shouldUseDark('system', false), false);
  });

  it('follows the system preference on a first visit', () => {
    assert.equal(shouldUseDark(null, true), true);
    assert.equal(shouldUseDark(null, false), false);
  });

  it('follows the system preference for corrupt stored values', () => {
    assert.equal(shouldUseDark('sepia', true), true);
    assert.equal(shouldUseDark('sepia', false), false);
  });
});
