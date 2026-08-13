import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

/**
 * Segmented light / dark / system control.
 *
 * Deliberately three explicit buttons rather than one cycling button: a
 * cycling control gives no way to know what the next press will do, and its
 * accessible name has to change on every press.
 */
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // `theme` is only meaningful once we are on the client, so render the group
  // in an indeterminate state first to avoid claiming the wrong option.
  useEffect(() => setMounted(true), []);

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-border bg-card p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = mounted && theme === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex min-h-touch items-center gap-2 rounded-[calc(var(--radius)-6px)] px-3 text-sm font-medium transition-colors",
              "hover:bg-muted focus-visible:outline-none",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="sr-only sm:not-sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
