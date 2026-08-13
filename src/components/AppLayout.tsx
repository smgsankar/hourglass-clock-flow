import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Hourglass as HourglassIcon } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
  /** Rendered inside the footer, above the tagline. */
  footerContent?: ReactNode;
}

/**
 * Page chrome shared by every route: skip link, banner, main landmark and
 * contentinfo. Keeping it in one place means each page has exactly one `<h1>`
 * and one `<main id="main-content">` for the skip link to target.
 */
export const AppLayout = ({ children, footerContent }: AppLayoutProps) => (
  <div className="flex min-h-screen flex-col">
    <a
      href="#main-content"
      className="sr-only left-4 top-4 z-50 rounded-[var(--radius)] bg-primary px-4 py-3 font-medium text-primary-foreground focus:not-sr-only focus:absolute"
    >
      Skip to main content
    </a>

    <header className="border-b border-border/70">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-[var(--radius)] text-lg font-semibold tracking-tight"
        >
          <HourglassIcon aria-hidden="true" className="size-5 text-primary" />
          Sand Timer
        </Link>
        <ThemeToggle />
      </div>
    </header>

    <main id="main-content" tabIndex={-1} className="container flex-1 py-8 focus:outline-none sm:py-12">
      {children}
    </main>

    <footer className="border-t border-border/70">
      <div className="container flex flex-col gap-4 py-6 text-sm text-muted-foreground">
        {footerContent}
        <p>Focus &middot; Productivity &middot; Mindfulness</p>
      </div>
    </footer>
  </div>
);
