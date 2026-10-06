/**
 * Tiny synthesised chime (WebAudio, no audio asset) plus the persisted mute
 * preference. Every entry point swallows errors: sound is a nicety, never a
 * reason for the timer to break.
 */

export const MUTE_STORAGE_KEY = "sand-timer:muted";

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "true" : "false");
  } catch {
    // storage unavailable (private mode, quota, disabled) - nothing to do
  }
}

/** Create / resume the shared AudioContext. Call from a user gesture (Start click). */
export function primeAudio(): void {
  try {
    if (!ctx) {
      const Ctor = getAudioContextCtor();
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => undefined);
    }
  } catch {
    ctx = null;
  }
}

const NOTES_HZ = [784, 988, 1319]; // G5, B5, E6 - a bright little arpeggio
const NOTE_STAGGER_S = 0.15;
const NOTE_DECAY_S = 0.9;

function playNote(audio: AudioContext, freq: number, at: number): void {
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.22, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + NOTE_DECAY_S);
  gain.connect(audio.destination);

  const partials: Array<{ type: OscillatorType; mult: number; level: number }> = [
    { type: "sine", mult: 1, level: 1 },
    { type: "triangle", mult: 2, level: 0.18 },
  ];

  for (const p of partials) {
    const osc = audio.createOscillator();
    const partialGain = audio.createGain();
    osc.type = p.type;
    osc.frequency.setValueAtTime(freq * p.mult, at);
    partialGain.gain.setValueAtTime(p.level, at);
    osc.connect(partialGain);
    partialGain.connect(gain);
    osc.start(at);
    osc.stop(at + NOTE_DECAY_S + 0.05);
  }
}

/** Play the finish chime. No-op if never primed or muted. */
export function playChime(): void {
  try {
    if (!ctx || readMuted()) return;
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => undefined);
    }
    const start = ctx.currentTime + 0.02;
    NOTES_HZ.forEach((freq, i) => playNote(ctx as AudioContext, freq, start + i * NOTE_STAGGER_S));
  } catch {
    // never let audio take the app down
  }
}
