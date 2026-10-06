import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-[2rem] border-2 border-border bg-card p-8 text-center shadow-sm">
        <svg viewBox="0 0 80 100" className="mx-auto h-24 w-auto" aria-hidden="true" focusable="false">
          <rect x={8} y={4} width={64} height={14} rx={7} className="fill-wood" />
          <rect x={8} y={82} width={64} height={14} rx={7} className="fill-wood" />
          <path
            d="M18 18 H62 C62 40 46 46 42 50 C46 54 62 60 62 82 H18 C18 60 34 54 38 50 C34 46 18 40 18 18 Z"
            className="fill-glass stroke-glass-edge"
            fillOpacity={0.6}
            strokeWidth={2.5}
          />
          <path d="M24 82 Q40 66 56 82 Z" className="fill-sand" />
          <path d="M30 32 L36 38 M36 32 L30 38" className="stroke-foreground" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M44 32 L50 38 M50 32 L44 38" className="stroke-foreground" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M35 45 Q40 42 45 45" className="stroke-foreground" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </svg>
        <h1 className="mt-4 font-display text-6xl font-bold text-primary">404</h1>
        <p className="mt-3 text-lg font-semibold">This page slipped through the cracks of time.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nothing at <code className="break-all rounded bg-muted px-1.5 py-0.5">{location.pathname}</code> - not even a grain.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 font-display text-lg font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          Back to the timer
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
