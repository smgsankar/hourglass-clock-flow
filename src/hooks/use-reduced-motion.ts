import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(QUERY);
}

/** True when the user prefers reduced motion; live-updating; false without matchMedia. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => getMediaQueryList()?.matches ?? false);

  useEffect(() => {
    const mql = getMediaQueryList();
    if (!mql) return undefined;
    const onChange = () => setReduced(mql.matches);
    onChange();
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Safari < 14 fallback.
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return reduced;
}
