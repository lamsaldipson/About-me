import { useEffect, useRef } from "react";
import { timeline } from "@/data/portfolio";
import { usePrefersReducedMotion } from "@/hooks";
import { Reveal, SectionHeading, SectionShell } from "@/components/Primitives";
import { cn } from "@/utils/cn";

/**
 * Drives the glowing fill of the timeline spine.
 * The height is written straight to the DOM inside a rAF loop so that
 * scrolling never triggers a React re-render.
 */
function useTimelineProgress() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const container = containerRef.current;
      const fill = fillRef.current;
      if (!container || !fill) return;

      const rect = container.getBoundingClientRect();
      const trigger = window.innerHeight * 0.62;
      const progress = (trigger - rect.top) / Math.max(rect.height, 1);
      const clamped = Math.min(Math.max(progress, 0), 1);
      fill.style.height = `${clamped * 100}%`;
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

  return { containerRef, fillRef };
}

export default function Journey() {
  const { containerRef, fillRef } = useTimelineProgress();
  const reduced = usePrefersReducedMotion();

  return (
    <SectionShell id="journey" grid>
      <SectionHeading
        eyebrow="Timeline"
        title="My Journey"
        description="Small experiments that quietly turned into a craft. Here is how the path unfolded so far."
      />

      <div ref={containerRef} className="relative mt-16 sm:mt-20">
        {/* Spine */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[13px] w-[2px] -translate-x-1/2 overflow-hidden rounded-full bg-white/[0.08] lg:left-1/2"
        >
          <div
            ref={fillRef}
            className={cn(
              "w-full rounded-full bg-gradient-to-b from-accent via-accent-2 to-accent-3 shadow-[0_0_18px_rgba(34,211,238,0.6)]",
              !reduced && "transition-[height] duration-200 ease-out",
            )}
            style={{ height: "0%" }}
          />
        </div>

        <ol className="flex flex-col gap-10 sm:gap-14">
          {timeline.map((entry, index) => {
            const isLeft = index % 2 === 0;

            const card = (
              <Reveal dir={isLeft ? "left" : "right"} delay={80}>
                <div className="group glass spotlight-card relative rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_70px_-40px_rgba(34,211,238,0.9)] sm:p-7">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(420px 200px at var(--x, 50%) var(--y, 0%), rgba(34,211,238,0.12), transparent 70%)",
                    }}
                  />
                  <div className="relative flex items-center gap-3">
                    <span className="font-mono text-xs tracking-[0.25em] text-accent uppercase">
                      {entry.year}
                    </span>
                    <span className="hairline h-px w-10 flex-1" />
                    <span className="text-lg text-white/60 transition-transform duration-500 group-hover:scale-125 group-hover:text-white">
                      {entry.glyph ?? "◆"}
                    </span>
                  </div>
                  <h3 className="relative mt-4 font-display text-xl font-semibold text-white sm:text-2xl">
                    {entry.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-mist sm:text-[15px]">
                    {entry.description}
                  </p>
                </div>
              </Reveal>
            );

            return (
              <li
                key={entry.year}
                className="relative grid grid-cols-1 gap-8 pl-12 lg:grid-cols-2 lg:gap-16 lg:pl-0"
              >
                {/* Node */}
                <span
                  aria-hidden="true"
                  className="absolute top-6 left-[13px] -translate-x-1/2 lg:left-1/2"
                >
                  <span className="relative grid h-7 w-7 place-items-center rounded-full border border-accent/40 bg-[#060912]">
                    <span className="absolute inset-0 rounded-full bg-accent/25 blur-md" />
                    <span className="relative h-2 w-2 rounded-full bg-gradient-to-br from-accent to-accent-2" />
                  </span>
                </span>

                {isLeft ? card : <div className="hidden lg:block" aria-hidden="true" />}
                {!isLeft ? card : <div className="hidden lg:block" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </div>
    </SectionShell>
  );
}
