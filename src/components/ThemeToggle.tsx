import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { describeTheme, nextTheme, normalizeTheme, type ThemeOption } from '@/lib/theme';
import { cn } from '@/lib/utils';

const THEME_ICONS: Record<ThemeOption, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

interface ThemeToggleProps {
  className?: string;
}

/** Button that cycles the colour theme between light, dark and system. */
export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The stored theme is only readable on the client, so hold the icon back until
  // after the first paint rather than flashing the wrong one.
  useEffect(() => {
    setMounted(true);
  }, []);

  const current = normalizeTheme(theme);
  const upcoming = nextTheme(current);
  const Icon = THEME_ICONS[current];
  const label = describeTheme(current, upcoming);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          onClick={() => setTheme(upcoming)}
          className={cn(
            'rounded-2xl timer-glow bg-card/50 border-border/50 hover:bg-accent/50 transition-all duration-300',
            className
          )}
        >
          <Icon
            className={cn('w-5 h-5 transition-opacity duration-300', !mounted && 'opacity-0')}
            aria-hidden="true"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};
