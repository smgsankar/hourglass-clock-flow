/**
 * Time formatting helpers.
 *
 * The app shows a compact `MM:SS` clock, but screen readers announce that
 * string inconsistently ("oh five colon zero zero", "5:00" as a time of day,
 * ...). Anything exposed to assistive tech therefore uses `formatSpokenTime`,
 * which spells the duration out in words.
 */

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** `325` -> `"05:25"`. Visual only — pair it with `formatSpokenTime`. */
export const formatClock = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

/** `325` -> `"5 minutes 25 seconds"`. Used for aria-label / live regions. */
export const formatSpokenTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  if (seconds > 0 || minutes === 0) {
    parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);
  }

  return parts.join(" ");
};

/**
 * Screen readers should not hear a new countdown value every second — it makes
 * the page unusable. Announce on a decaying schedule instead: every minute,
 * then at 30s and 10s, then each of the final five seconds.
 */
export const shouldAnnounceRemaining = (remainingSeconds: number) => {
  if (remainingSeconds <= 0) return false;
  if (remainingSeconds <= 5) return true;
  if (remainingSeconds === 10 || remainingSeconds === 30) return true;
  return remainingSeconds % 60 === 0;
};
