import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Error 404
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
        <p className="text-lg text-muted-foreground">
          We could not find <code className="font-mono">{location.pathname}</code>. It may
          have been moved or removed.
        </p>
        <Button asChild size="lg" className="min-h-touch">
          <Link to="/">Back to the timer</Link>
        </Button>
      </div>
    </AppLayout>
  );
};

export default NotFound;
