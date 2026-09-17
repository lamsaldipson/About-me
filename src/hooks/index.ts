import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Tracks a CSS media query. Used for the mobile / reduced-motion switches
 * that lower 3D complexity.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when the visitor prefers less motion — every animation respects this. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True on tablet / phone sized viewports where we cut particle counts. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 900px)");
}

/**
 * Reveals an element once it enters the viewport.
 * Returns a ref to attach plus the current visibility flag.
 * `once` keeps the element visible after the first reveal (default true).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string; once?: boolean } = {},
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.2, rootMargin = "0px 0px -10% 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Elements already on screen (page refresh mid-page) reveal instantly.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * Eases a number from 0 → target using requestAnimationFrame.
 * Used by the stats counters and the radar chart sweep.
 */
export function useCountUp(target: number, active: boolean, duration = 1600): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);
  const start = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (time: number) => {
      if (!start.current) start.current = time;
      const progress = Math.min((time - start.current) / duration, 1);
      setValue(target * easeOutCubic(progress));
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      start.current = 0;
    };
  }, [target, active, duration]);

  return value;
}

/**
 * Generic 0 → 1 progress driver, restarted whenever `active` flips to true.
 * Powers the radar chart growth animation.
 */
export function useProgress(active: boolean, duration = 1400): number {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);
  const start = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = (time: number) => {
      if (!start.current) start.current = time;
      const p = Math.min((time - start.current) / duration, 1);
      setProgress(easeOutQuart(p));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      start.current = 0;
    };
  }, [active, duration]);

  return progress;
}

/**
 * Normalised pointer position (-0.5 … 0.5 on both axes) for parallax /
 * tilt effects. Values are lerped by the consumer for smoothness.
 */
export function usePointerNormalised() {
  const pointer = useRef({ x: 0, y: 0 });

  const onPointerMove = useCallback((event: PointerEvent) => {
    pointer.current.x = event.clientX / window.innerWidth - 0.5;
    pointer.current.y = event.clientY / window.innerHeight - 0.5;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [onPointerMove]);

  return pointer;
}

/**
 * Tracks window scroll offset + document progress (0 → 1) with a
 * rAF-throttled listener so scroll never thrashes React state.
 */
export function useScrollProgress() {
  const [scroll, setScroll] = useState({ y: 0, progress: 0 });

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScroll({ y: window.scrollY, progress: max > 0 ? window.scrollY / max : 0 });
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return scroll;
}

/** Smoothly scrolls to a section id, accounting for the fixed navbar. */
export function useSmoothScroll(offset = 72) {
  return useMemo(
    () => (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    },
    [offset],
  );
}

/**
 * Observes a list of section ids and reports the one currently in view.
 * Drives the active state of the navbar links.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}
