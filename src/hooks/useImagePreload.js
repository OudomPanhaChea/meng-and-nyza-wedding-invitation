import { useEffect, useState } from "react";

/* Resolves to true once every src in `srcs` has either loaded or
   errored. Use to gate cinematic intros that look broken without
   their decorative imagery — keeps a solid loading state up until
   the assets are in cache, then lets the entrance play smoothly.

   `timeoutMs` (default 12s) forces ready even if an image stalls
   so the page can never hang on a single slow asset. */
export function useImagePreload(srcs, timeoutMs = 12000) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const fallback = setTimeout(() => {
      if (alive) setReady(true);
    }, timeoutMs);

    const probes = srcs.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    );

    Promise.all(probes).then(() => {
      if (!alive) return;
      clearTimeout(fallback);
      setReady(true);
    });

    return () => {
      alive = false;
      clearTimeout(fallback);
    };
    // srcs is a module-level constant array in callers — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
}
