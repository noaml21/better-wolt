import { useEffect, useState } from 'react';

/* The CSS half of the motion rule lives in base.css; this is for the
   motion CSS cannot reach — a video that would otherwise play itself.
   The mobile client's equivalent is `useReducedMotion` in src/theme. */

const QUERY = '(prefers-reduced-motion: reduce)';

export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.(QUERY).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(QUERY);

    if (!media) {
      return undefined;
    }

    const update = (event) => setReduced(event.matches);

    setReduced(media.matches);
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}
