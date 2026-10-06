import type { CSSProperties } from "react";
import { PartyPopper, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CompletionCelebrationProps {
  show: boolean;
  reducedMotion: boolean;
  onDismiss(): void;
}

const CONFETTI_COUNT = 16;
const CONFETTI_COLOURS = ["bg-primary", "bg-accent", "bg-sand", "bg-sand-light", "bg-primary/70", "bg-accent/70"];

interface ConfettiPiece {
  style: CSSProperties;
  className: string;
}

/** Deterministic burst: evenly fanned angles with a little per-index jitter, computed once at module load. */
const CONFETTI: ConfettiPiece[] = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
  const angle = (i / CONFETTI_COUNT) * Math.PI * 2 + ((i % 3) - 1) * 0.18;
  const distance = 90 + ((i * 37) % 60);
  const dx = Math.round(Math.cos(angle) * distance);
  const dy = Math.round(Math.sin(angle) * distance * 0.75 - 30);
  const rot = (i % 2 === 0 ? 1 : -1) * (360 + ((i * 53) % 360));
  const shape = i % 3 === 0 ? "h-2.5 w-2.5 rounded-full" : i % 3 === 1 ? "h-3 w-1.5 rounded-sm" : "h-2 w-3 rounded-[2px]";
  return {
    className: cn(shape, CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]),
    style: {
      "--dx": `${dx}px`,
      "--dy": `${dy}px`,
      "--rot": `${rot}deg`,
      animationDelay: `${(i % 4) * 40}ms`,
    } as CSSProperties,
  };
});

export function CompletionCelebration({ show, reducedMotion, onDismiss }: CompletionCelebrationProps) {
  if (!show) return null;

  return (
    <div className="relative w-full max-w-sm">
      {!reducedMotion && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10" aria-hidden="true">
          {CONFETTI.map((piece, i) => (
            <span
              key={i}
              className={cn("absolute left-0 top-0 animate-confetti-burst opacity-0", piece.className)}
              style={piece.style}
            />
          ))}
        </div>
      )}

      {/* aria-live="off": the page's single polite region already announces "Time's up!" */}
      <div
        role="status"
        aria-live="off"
        className={cn(
          "relative flex items-start gap-3 rounded-3xl border-2 border-primary/30 bg-card p-4 pr-12 shadow-lg shadow-primary/10",
          !reducedMotion && "animate-in fade-in zoom-in-95 duration-300",
        )}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <PartyPopper className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold leading-tight text-foreground">Time&apos;s up!</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Every last grain made it down. Stretch, sip some water, take a bow.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss celebration"
          className="absolute right-2.5 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
