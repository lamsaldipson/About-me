import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile, socials, stats } from "@/data/portfolio";
import { useInView, usePrefersReducedMotion } from "@/hooks";
import { GlowButton, Reveal } from "@/components/Primitives";
import { HeroObject3D } from "@/components/Scene3D";
import { cn } from "@/utils/cn";

/**
 * One-time global keyframes for the small set of ambient/hover motions used
 * in this file that don't already exist in the design system (breathing
 * glow, sweeping sheen). Injected once via a plain <style> tag so nothing
 * outside this component needs to change.
 */
const heroMotionStyles = `
@keyframes hero-breathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.08); opacity: 1; }
}
.hero-breathe { animation: hero-breathe 6s ease-in-out infinite; }

@keyframes hero-sheen-sweep {
  0% { transform: translateX(-130%) rotate(8deg); }
  100% { transform: translateX(130%) rotate(8deg); }
}
.hero-sheen { position: relative; }
.hero-sheen::after {
  content: "";
  position: absolute;
  inset: -20% -60%;
  background: linear-gradient(75deg, transparent 42%, rgba(255,255,255,0.16) 50%, transparent 58%);
  animation: hero-sheen-sweep 5.5s ease-in-out infinite;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .hero-breathe,
  .hero-sheen::after {
    animation: none;
  }
}
`;

/** Cycles through an index on an interval — the rotation clock for the role list. */
function useRotatingIndex(length: number, enabled: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [length, enabled]);

  return index;
}

/**
 * Applies a smoothed pointer-parallax translation directly to the DOM node
 * inside a rAF loop — no React state updates, so the main thread stays free.
 */
function useParallax<T extends HTMLElement>(
  strength: number,
  enabled: boolean,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    let frame: number | null = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * strength;
      targetY = (event.clientY / window.innerHeight - 0.5) * strength;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame !== null) cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [strength, enabled]);

  return ref;
}

/**
 * Smooth 3D pointer-tilt for a single element: leans gently toward the
 * cursor and eases back to flat on leave. Same no-re-render, rAF-driven
 * approach as useParallax, just rotating instead of translating.
 */
function useTilt<T extends HTMLElement>(maxDegrees: number, enabled: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    let frame: number | null = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentScale = 1;
    let targetScale = 1;

    const onPointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      targetY = (px - 0.5) * maxDegrees * 2;
      targetX = (0.5 - py) * maxDegrees * 2;
      targetScale = 1.04;
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      targetScale = 1;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      currentScale += (targetScale - currentScale) * 0.12;
      node.style.transform = `perspective(900px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;
      frame = requestAnimationFrame(loop);
    };

    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerleave", onPointerLeave);
      if (frame !== null) cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [maxDegrees, enabled]);

  return ref;
}

/**
 * Subtle magnetic pull: the wrapped element drifts a few pixels toward the
 * cursor while hovered nearby and glides back to rest on leave.
 */
function useMagnetic<T extends HTMLElement>(strength: number, enabled: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    let frame: number | null = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = (event.clientX - cx) * strength;
      targetY = (event.clientY - cy) * strength;
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      node.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerleave", onPointerLeave);
      if (frame !== null) cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [strength, enabled]);

  return ref;
}

/** Wraps a single interactive child (button, icon) with the magnetic-hover effect. */
function Magnetic({
  children,
  strength = 0.3,
  enabled,
  className,
}: {
  children: ReactNode;
  strength?: number;
  enabled: boolean;
  className?: string;
}) {
  const ref = useMagnetic<HTMLDivElement>(strength, enabled);
  return (
    <div ref={ref} className={cn("inline-block", className)}>
      {children}
    </div>
  );
}

/**
 * Drives a `--spot-x` / `--spot-y` CSS variable pair on an existing element
 * so a radial gradient elsewhere in the tree can trail the cursor. Reuses
 * the target's own ref rather than creating a new one, so it composes with
 * whatever else (like useInView) is already attached to that node.
 */
function useSpotlight(targetRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const node = targetRef.current;
    if (!node) return;

    let frame: number | null = null;
    let currentX = 50;
    let currentY = 40;
    let targetX = 50;
    let targetY = 40;

    const onPointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      node.style.setProperty("--spot-x", `${currentX.toFixed(2)}%`);
      node.style.setProperty("--spot-y", `${currentY.toFixed(2)}%`);
      frame = requestAnimationFrame(loop);
    };

    node.addEventListener("pointermove", onPointerMove);
    frame = requestAnimationFrame(loop);

    return () => {
      node.removeEventListener("pointermove", onPointerMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [targetRef, enabled]);
}

/**
 * Renders the role list with a soft glowing pill that glides beneath
 * whichever role is currently active, plus a blinking typewriter caret —
 * the detail that makes this headline worth watching for an extra second.
 */
function RoleRotator({ roles, enabled }: { roles: string[]; enabled: boolean }) {
  const activeIndex = useRotatingIndex(roles.length, enabled);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [pill, setPill] = useState({ x: 0, width: 0, ready: false });

  useEffect(() => {
    const container = containerRef.current;
    const active = itemRefs.current[activeIndex];
    if (!container || !active) return;

    const update = () => {
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      setPill({
        x: activeRect.left - containerRect.left,
        width: activeRect.width,
        ready: true,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeIndex, roles]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start"
    >
      {pill.ready && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-0 h-[1.9em] -translate-y-1/2 rounded-full bg-gradient-to-r from-accent/15 via-accent/10 to-accent-3/15 transition-[transform,width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${pill.x}px) translateY(-50%)`, width: pill.width }}
        />
      )}
      {roles.map((role, index) => (
        <span key={role} className="relative flex items-center gap-4">
          <span
            ref={(node: HTMLSpanElement | null) => {
              itemRefs.current[index] = node;
            }}
            className={cn(
              "relative px-1 py-0.5 transition-all duration-500",
              index === activeIndex ? "scale-[1.04] text-white" : "text-mist/60",
            )}
          >
            {role}
            {index === activeIndex && (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.1em] animate-pulse bg-accent align-middle"
              />
            )}
          </span>
          {index < roles.length - 1 && (
            <span aria-hidden="true" className="text-accent/30">
              •
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Compact premium portrait: a breathing glow halo behind the photo, a
 * slowly orbiting dashed ring, a thin gradient hairline border that tilts
 * toward the cursor, and a sheen that sweeps across on a loop. It stays
 * small on purpose so the headline and the 3D scene keep the spotlight.
 */
function ProfilePortrait({ name, reduced }: { name: string; reduced: boolean }) {
  const [failed, setFailed] = useState(false);
  const tiltRef = useTilt<HTMLDivElement>(9, !reduced);

  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-fit">
      {/* Soft glow behind the photo — breathes slowly so it feels alive at rest */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute -inset-7 -z-10 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.28),transparent_65%)] blur-2xl",
          !reduced && "hero-breathe",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.20),transparent_62%)] blur-xl",
          !reduced && "hero-breathe",
        )}
        style={{ animationDelay: "1.4s" }}
      />

      {/* Slowly orbiting dashed halo, echoing the rings around the 3D object */}
      <div
        aria-hidden="true"
        className="animate-spin-slower absolute -inset-4 -z-10 rounded-full border border-dashed border-white/10"
      />

      {/* Glowing gradient hairline frame — leans gently toward the cursor */}
      <div
        ref={tiltRef}
        className="rounded-[26px] bg-gradient-to-br from-accent/70 via-white/15 to-accent-3/70 p-[1.5px] shadow-[0_0_45px_-10px_rgba(34,211,238,0.55)] transition-shadow duration-500 hover:shadow-[0_0_60px_-8px_rgba(34,211,238,0.75)]"
      >
        <div
          className={cn(
            "h-32 w-32 overflow-hidden rounded-[25px] bg-white/[0.04] sm:h-36 sm:w-36 lg:h-40 lg:w-40 xl:h-44 xl:w-44",
            !reduced && "hero-sheen",
          )}
        >
          {failed ? (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold tracking-tight text-white/70">
              {initials}
            </div>
          ) : (
            <img
              src="/photo.jpg"
              alt="Dipson Lamsal"
              width={400}
              height={400}
              loading="eager"
              decoding="async"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.06]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** A single social icon with a per-instance magnetic pull and a real hover glow. */
function SocialLink({
  social,
  enabled,
}: {
  social: (typeof socials)[number];
  enabled: boolean;
}) {
  const magnetRef = useMagnetic<HTMLAnchorElement>(0.3, enabled);

  return (
    <a
      ref={magnetRef}
      href={social.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={social.name}
      className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-mist transition-all duration-500 hover:-translate-y-1 hover:border-[color:var(--hover)] hover:text-white hover:shadow-[0_0_24px_-6px_var(--hover)]"
      style={{ ["--hover" as string]: social.accent }}
    >
      <span className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
        {social.icon}
      </span>
    </a>
  );
}

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const [containerRef, inView] = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: "200px 0px",
    once: false,
  });
  // Latch: mount the WebGL canvas the first time the hero is near the viewport,
  // then simply pause its render loop when it scrolls away instead of
  // tearing the context down and rebuilding it.
  const [mounted, setMounted] = useState(false);
  const parallaxRef = useParallax<HTMLDivElement>(26, !reduced);
  const chipParallaxRef = useParallax<HTMLDivElement>(14, !reduced);
  const stageTiltRef = useTilt<HTMLDivElement>(5, !reduced);
  useSpotlight(containerRef, !reduced);

  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      <style>{heroMotionStyles}</style>

      {/* Decorative halos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/2 left-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.14),transparent_62%)] blur-2xl" />
        <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_45%,black,transparent)]" />
        {/* Cursor-following light — makes the whole hero feel responsive, not just its buttons */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 transition-opacity duration-700 lg:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 40%), rgba(34,211,238,0.10), transparent 45%)",
          }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-28 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pt-32">
        {/* ---------------- Photo + copy ---------------- */}
        <div ref={parallaxRef} className="order-1">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <Reveal dir="up" delay={60}>
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium tracking-[0.22em] text-mist uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {profile.availability}
              </span>
            </Reveal>

            <Reveal dir="up" delay={140}>
              <p className="mt-7 font-mono text-sm tracking-[0.3em] text-accent/80 uppercase">
                {profile.greeting}
              </p>
            </Reveal>

            {/* Photo and identity share a row on desktop, then stack on mobile. */}
            <div className="mt-6 flex w-full flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-8 lg:gap-7 xl:gap-10">
              <Reveal dir="scale" delay={220} className="shrink-0">
                <ProfilePortrait name={profile.name} reduced={reduced} />
              </Reveal>

              <div className="flex min-w-0 flex-col items-center sm:items-start">
                <Reveal dir="up" delay={300}>
                  <h1 className="font-display text-[clamp(2.2rem,6.5vw,4.2rem)] leading-[0.95] font-bold tracking-tight">
                    <span className="text-gradient">{profile.name}</span>
                  </h1>
                </Reveal>

                <Reveal dir="up" delay={380}>
                  <div className="mt-5 font-display text-lg text-white/85 sm:text-2xl">
                    <RoleRotator roles={profile.roles} enabled={!reduced} />
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Everything below returns to the left edge of the photo. */}
            <Reveal dir="up" delay={460}>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
                {profile.intro}
              </p>
            </Reveal>

            <Reveal dir="up" delay={540}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Magnetic strength={0.25} enabled={!reduced}>
                  <GlowButton href="#projects" className="px-8 py-4 text-[15px]">
                    Explore My Work
                    <span className="transition-transform duration-500 group-hover:translate-x-1.5 group-hover:rotate-[8deg]">
                      →
                    </span>
                  </GlowButton>
                </Magnetic>
                <Magnetic strength={0.25} enabled={!reduced}>
                  <GlowButton
                    href="#contact"
                    variant="ghost"
                    className="px-8 py-4 text-[15px]"
                  >
                    Let&apos;s Connect
                  </GlowButton>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal dir="up" delay={620}>
              <div className="mt-12 flex items-center gap-6">
                {socials.slice(0, 4).map((social) => (
                  <SocialLink key={social.name} social={social} enabled={!reduced} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ---------------- 3D stage ---------------- */}
        <Reveal dir="scale" delay={200} className="order-2 w-full">
          <div
            ref={stageTiltRef}
            className="relative mx-auto aspect-square w-[min(88vw,520px)] will-change-transform"
          >
            {/* Orbiting CSS rings add depth behind the canvas */}
            <div
              aria-hidden="true"
              className="animate-spin-slower absolute inset-[8%] rounded-full border border-dashed border-white/10"
            />
            <div
              aria-hidden="true"
              className="animate-spin-slow absolute inset-[18%] rounded-full border border-white/[0.07]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-[26%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_65%)] blur-2xl"
            />

            {/* WebGL canvas — mounted once, paused while off-screen */}
            <div className="absolute inset-0">
              {mounted && <HeroObject3D active={inView} />}
            </div>

            {/* Floating glass chips — carry a touch of their own parallax for layered depth */}
            <div ref={chipParallaxRef} className="pointer-events-none absolute inset-0">
              <div className="glass animate-float absolute top-2 left-0 hidden rounded-xl px-4 py-2 text-xs tracking-wide text-white/80 sm:block">
                <span className="text-accent">◆</span> Creative Development
              </div>
              <div
                className="glass animate-float absolute right-0 bottom-6 hidden rounded-xl px-4 py-2 text-xs tracking-wide text-white/80 sm:block"
                style={{ animationDelay: "1.6s" }}
              >
                <span className="text-accent-3">✦</span> 3D Web Experiences
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Scroll cue + micro stats */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.35em] text-mist/60 uppercase">
            Scroll
          </span>
          <span className="relative h-10 w-[1px] overflow-hidden bg-white/10">
            <span className="absolute inset-x-0 top-0 h-4 animate-[sweep_2.4s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-accent to-transparent" />
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center gap-10 lg:hidden">
        {stats.slice(0, 2).map((stat) => (
          <span
            key={stat.label}
            className="font-mono text-[11px] tracking-[0.2em] text-mist/60 uppercase"
          >
            {stat.value}
            {stat.suffix} {stat.label}
          </span>
        ))}
      </div>
    </section>
  );
}
