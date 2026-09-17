import { useEffect, useRef, useState } from "react";
import { profile, socials, stats } from "@/data/portfolio";
import { useInView, usePrefersReducedMotion } from "@/hooks";
import { GlowButton, Reveal } from "@/components/Primitives";
import { HeroObject3D } from "@/components/Scene3D";
import { cn } from "@/utils/cn";

/** Cycles through a list of words with a typewriter feel. */
function useRotatingWord(words: string[], enabled: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [words, enabled]);

  return words[index];
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
 * Compact premium portrait: a soft glow halo behind the photo, a slowly
 * orbiting dashed ring, and a thin gradient hairline border. It stays small
 * on purpose so the headline and the 3D scene keep the spotlight.
 */
function ProfilePortrait({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative w-fit">
      {/* Soft glow behind the photo */}
      <div
        aria-hidden="true"
        className="absolute -inset-7 -z-10 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.28),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.20),transparent_62%)] blur-xl"
      />

      {/* Slowly orbiting dashed halo, echoing the rings around the 3D object */}
      <div
        aria-hidden="true"
        className="animate-spin-slower absolute -inset-4 -z-10 rounded-full border border-dashed border-white/10"
      />

      {/* Glowing gradient hairline frame */}
      <div className="rounded-[26px] bg-gradient-to-br from-accent/70 via-white/15 to-accent-3/70 p-[1.5px] shadow-[0_0_45px_-10px_rgba(34,211,238,0.55)]">
        <div className="relative h-32 w-32 overflow-hidden rounded-[25px] bg-white/[0.04] sm:h-36 sm:w-36 lg:h-40 lg:w-40 xl:h-44 xl:w-44">
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

          {/* Cinematic sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"
          />
        </div>
      </div>
    </div>
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
  const rotatingRole = useRotatingWord(profile.roles, !reduced);

  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      {/* Decorative halos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/2 left-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.14),transparent_62%)] blur-2xl" />
        <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_45%,black,transparent)]" />
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
                <ProfilePortrait name={profile.name} />
              </Reveal>

              <div className="flex min-w-0 flex-col items-center sm:items-start">
                <Reveal dir="up" delay={300}>
                  <h1 className="font-display text-[clamp(2.2rem,6.5vw,4.2rem)] leading-[0.95] font-bold tracking-tight">
                    <span className="text-gradient">{profile.name}</span>
                  </h1>
                </Reveal>

                <Reveal dir="up" delay={380}>
                  <div className="mt-5 flex flex-col items-center gap-1 font-display text-lg text-white/85 sm:items-start sm:text-2xl">
                    <p className="flex flex-wrap items-center justify-center gap-x-3 sm:justify-start">
                      {profile.roles.slice(0, 2).map((role, index) => (
                        <span key={role} className="flex items-center gap-3">
                          <span
                            className={cn(
                              "transition-colors duration-500",
                              rotatingRole === role
                                ? "text-white"
                                : "text-mist/70",
                            )}
                          >
                            {role}
                          </span>
                          {index === 0 && (
                            <span className="text-accent/40">•</span>
                          )}
                        </span>
                      ))}
                    </p>
                    {profile.roles.slice(2).map((role) => (
                      <p
                        key={role}
                        className={cn(
                          "transition-colors duration-500",
                          rotatingRole === role ? "text-white" : "text-mist/70",
                        )}
                      >
                        {role}
                      </p>
                    ))}
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
                <GlowButton href="#projects" className="px-8 py-4 text-[15px]">
                  Explore My Work
                  <span className="transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </GlowButton>
                <GlowButton
                  href="#contact"
                  variant="ghost"
                  className="px-8 py-4 text-[15px]"
                >
                  Let&apos;s Connect
                </GlowButton>
              </div>
            </Reveal>

            <Reveal dir="up" delay={620}>
              <div className="mt-12 flex items-center gap-6">
                {socials.slice(0, 4).map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.name}
                    className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-mist transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:text-white"
                    style={{ ["--hover" as string]: social.accent }}
                  >
                    <span className="transition-transform duration-500 group-hover:scale-110">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ---------------- 3D stage ---------------- */}
        <Reveal dir="scale" delay={200} className="order-2 w-full">
          <div className="relative mx-auto aspect-square w-[min(88vw,520px)]">
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

            {/* Floating glass chips */}
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
