import { useEffect, useRef, useState } from "react";
import { nav, profile, socials } from "@/data/portfolio";
import { usePrefersReducedMotion, useSmoothScroll } from "@/hooks";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import CapabilityRadar from "@/components/CapabilityRadar";
import Journey from "@/components/Journey";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Contact from "@/components/Contact";
import { GlobalBackground3D } from "@/components/Scene3D";
import { cn } from "@/utils/cn";

/**
 * Soft cursor spotlight. Position is written straight to the DOM node
 * inside a rAF loop, so moving the mouse never re-renders React.
 */
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const node = ref.current;
    if (!node) return;

    let frame: number | null = null;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      node.style.transform = `translate3d(${currentX - 300}px, ${currentY - 300}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 -z-[5] hidden h-[600px] w-[600px] rounded-full opacity-60 mix-blend-screen md:block"
      style={{
        background:
          "radial-gradient(circle, rgba(34,211,238,0.10), rgba(139,92,246,0.06) 45%, transparent 70%)",
      }}
    />
  );
}

/** Floating "back to top" control that fades in after the first screen. */
function BackToTop() {
  const [visible, setVisible] = useState(false);
  const scrollTo = useSmoothScroll(0);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => scrollTo("home")}
      aria-label="Back to top"
      className={cn(
        "glass fixed right-5 bottom-5 z-40 grid h-12 w-12 place-items-center rounded-full text-white transition-all duration-500 hover:border-accent/40 hover:text-accent sm:right-8 sm:bottom-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      ↑
    </button>
  );
}

function Footer() {
  const scrollTo = useSmoothScroll(76);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 border-t border-white/[0.07]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-bold text-white">{profile.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">{profile.intro}</p>
          <div className="mt-5 flex gap-3">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.name}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-mist transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:text-white"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <p className="font-mono text-[10px] tracking-[0.28em] text-mist/60 uppercase">Navigate</p>
          {nav.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="w-fit text-sm text-mist transition-colors duration-300 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] tracking-[0.28em] text-mist/60 uppercase">Get in touch</p>
          <a
            href={`mailto:${profile.email}`}
            className="w-fit break-all text-sm text-mist transition-colors duration-300 hover:text-white"
          >
            {profile.email}
          </a>
          <p className="text-sm text-mist">{profile.location}</p>
          <p className="mt-2 text-xs text-mist/60">
            Built with <br /> React, TypeScript, Three.js, CSS & React Three Fiber. <br />Html, CSS & Javascript.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-6 text-xs text-mist/60 sm:flex-row sm:px-8">
        <p>© {year} {profile.name}. All rights reserved.</p>
        <p className="font-mono tracking-[0.2em] uppercase">Designed in the dark</p>
      </div>
    </footer>
  );
}

/**
 * Dipson Lamsal — 3D personal portfolio.
 * App only composes sections; every section owns its own logic and data.
 */
export default function App() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Global 3D environment */}
      <GlobalBackground3D />
      <CursorGlow />

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <About />
        <CapabilityRadar />
        <Journey />
        <Projects />
        <Services />
        <Stats />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
