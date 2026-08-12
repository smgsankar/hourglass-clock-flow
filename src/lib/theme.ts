/**
 * Theme selection rules for the light/dark switcher.
 *
 * Deliberately free of React and DOM references so the behaviour can be unit
 * tested directly; the component in src/components/ThemeToggle.tsx only handles
 * rendering and delegates every decision to the helpers below.
 */

/** Order the switcher cycles through on each click. */
export const THEME_CYCLE = ['light', 'dark', 'system'] as const;

export type ThemeOption = (typeof THEME_CYCLE)[number];

export const THEME_LABELS: Record<ThemeOption, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * Coerces whatever next-themes hands back into a known option. It is `undefined`
 * until storage has been read, and could be a stale value from an older build,
 * so anything unrecognised falls back to following the operating system.
 */
export const normalizeTheme = (current: string | undefined | null): ThemeOption =>
  THEME_CYCLE.includes(current as ThemeOption) ? (current as ThemeOption) : 'system';

/** Returns the theme that follows `current` in the cycle. */
export const nextTheme = (current: string | undefined | null): ThemeOption => {
  const index = THEME_CYCLE.indexOf(normalizeTheme(current));
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
};

/** Accessible label describing the current theme and what clicking will do. */
export const describeTheme = (current: ThemeOption, upcoming: ThemeOption): string =>
  `Theme: ${THEME_LABELS[current]}. Switch to ${THEME_LABELS[upcoming].toLowerCase()}.`;

/**
 * Whether the `dark` class should be on <html>.
 *
 * The pre-paint script in index.html reimplements this rule in plain ES5 because
 * it has to run before any module loads. Change the two together.
 */
export const shouldUseDark = (
  stored: string | undefined | null,
  prefersDark: boolean
): boolean => {
  const theme = normalizeTheme(stored);
  return theme === 'dark' || (theme === 'system' && prefersDark);
};
