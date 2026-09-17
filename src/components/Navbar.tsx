import { useEffect, useMemo, useState } from "react";
import { nav, profile } from "@/data/portfolio";
import { useActiveSection, useScrollProgress, useSmoothScroll } from "@/hooks";
import { cn } from "@/utils/cn";

/**
 * Fixed glass navigation.
 * - turns solid after scrolling past the hero fold
 * - highlights the section currently in view
 * - collapses into a full-screen panel on small screens
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { progress } = useScrollProgress();
  const scrollTo = useSmoothScroll(76);

  const ids = useMemo(() => nav.map((item) => item.target), []);
  const active = useActiveSection(ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleNavigate = (target: string) => {
    setOpen(false);
    // Let the panel unmount before scrolling so the offset is measured correctly.
    window.setTimeout(() => scrollTo(target), open ? 220 : 0);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "py-2.5" : "py-4 sm:py-5",
        )}
      >
        <nav
          className={cn(
            "mx-auto flex w-[min(96%,1240px)] items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-5",
            scrolled
              ? "glass-strong shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)]"
              : "border border-transparent bg-transparent",
          )}
        >
          {/* Brand */}
          <button
            onClick={() => handleNavigate("home")}
            className="group flex items-center gap-3"
            aria-label={`Back to top — ${profile.name}`}
          >
<span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl ring-1 ring-white/15 transition-transform duration-500 group-hover:scale-105">
  <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent to-accent-2 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60" />

  <img
    src="/profile.jpg"
    alt="Dipson Lamsal"
    className="relative h-full w-full object-cover"
  />
</span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-sm font-semibold tracking-wide text-white">
                {profile.name}
              </span>
              <span className="text-[11px] tracking-[0.18em] text-mist/70 uppercase">
                {profile.roles[0]}
              </span>
            </span>
          </button>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const isActive = active === item.target;
              return (
                <li key={item.target}>
                  <button
                    onClick={() => handleNavigate(item.target)}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-300",
                      isActive ? "text-white" : "text-mist hover:text-white",
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-full border border-accent/30 bg-accent/10" />
                    )}
                    <span className="relative">{item.label}</span>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-300",
                        isActive ? "w-5 opacity-100" : "w-0 opacity-0",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate("contact")}
              className="hidden rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 text-[13px] font-semibold text-[#041018] shadow-[0_10px_30px_-12px_rgba(34,211,238,0.8)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-14px_rgba(139,92,246,0.9)] md:inline-flex"
            >
              Let&apos;s Connect
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="glass relative grid h-11 w-11 place-items-center rounded-xl lg:hidden"
            >
              <span className="flex h-4 w-5 flex-col justify-between">
                <span
                  className={cn(
                    "h-[2px] w-full rounded-full bg-white transition-all duration-300",
                    open && "translate-y-[7px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "h-[2px] w-full rounded-full bg-white transition-all duration-300",
                    open && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "h-[2px] w-full rounded-full bg-white transition-all duration-300",
                    open && "-translate-y-[7px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>

          {/* Scroll progress hairline */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px mx-auto h-[2px] w-[min(96%,1240px)] overflow-hidden rounded-full"
          >
            <span
              className="block h-full rounded-full bg-gradient-to-r from-accent via-accent-2 to-accent-3 transition-transform duration-150"
              style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
            />
          </span>
        </nav>
      </header>

      {/* Mobile panel */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-[#04050a]/70 backdrop-blur-md transition-opacity duration-500",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "glass-strong absolute inset-x-4 top-24 rounded-3xl p-5 transition-all duration-500",
            open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
          )}
        >
          <ul className="flex flex-col gap-1">
            {nav.map((item, index) => (
              <li key={item.target}>
                <button
                  onClick={() => handleNavigate(item.target)}
                  style={{ transitionDelay: `${open ? index * 45 : 0}ms` }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-base font-medium transition-all duration-500",
                    active === item.target
                      ? "bg-accent/10 text-white"
                      : "text-mist hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                  <span className="font-mono text-xs text-accent/70">
                    0{index + 1}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleNavigate("contact")}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-accent to-accent-2 px-5 py-3.5 text-sm font-semibold text-[#041018]"
          >
            Let&apos;s Connect
          </button>
        </div>
      </div>
    </>
  );
}
