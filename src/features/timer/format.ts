/** Time formatting helpers for the sand timer (contract C3). */

const MAX_MINUTES = 99;
const MAX_SECONDS = 59;

function toInt(value: number): number {
  return typeof value === 'number' && !Number.isNaN(value) ? Math.trunc(value) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 'MM:SS' using ceil seconds, so a running clock shows '00:01' until the final
 * second has fully elapsed. ms <= 0 or NaN -> '00:00'. Capped at '99:59'.
 */
export function formatClock(ms: number): string {
  if (typeof ms !== 'number' || Number.isNaN(ms) || ms <= 0) return '00:00';
  const totalSeconds = Math.min(Math.ceil(ms / 1000), MAX_MINUTES * 60 + MAX_SECONDS);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Split into minutes/seconds from the whole seconds of ms (floor; NaN/negative -> 0). */
export function splitDuration(ms: number): { minutes: number; seconds: number } {
  const totalSeconds =
    typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
}

/** Join to ms; minutes clamped 0..99, seconds clamped 0..59, NaN -> 0. */
export function joinDuration(minutes: number, seconds: number): number {
  const m = clamp(toInt(minutes), 0, MAX_MINUTES);
  const s = clamp(toInt(seconds), 0, MAX_SECONDS);
  return (m * 60 + s) * 1000;
}
