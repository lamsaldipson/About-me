import { useEffect, useState } from "react";
import { profile, stats } from "@/data/portfolio";
import { useInView, usePrefersReducedMotion } from "@/hooks";
import { Reveal, SectionHeading, SectionShell } from "@/components/Primitives";
import { AboutObject3D } from "@/components/Scene3D";

const highlights = [
  "Web Development",
  "Content Creation",
  "3D Experiences",
  "AI Workflows",
  "Digital Media",
];

export default function About() {
  const [stageRef, stageInView] = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: "220px 0px",
    once: false,
  });
  const reduced = usePrefersReducedMotion();
  // Mount the canvas once, then pause its loop while the section is off-screen.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (stageInView) setMounted(true);
  }, [stageInView]);

  return (
    <SectionShell id="about" grid>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* 3D visual */}
        <Reveal dir="left" className="order-1">
          <div
            ref={stageRef}
            className="glass spotlight-card relative mx-auto aspect-square w-[min(84vw,440px)] overflow-hidden rounded-[2rem] p-2"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(circle_at_75%_80%,rgba(139,92,246,0.18),transparent_60%)]"
            />
            <div
              aria-hidden="true"
              className="animate-spin-slower absolute inset-6 rounded-full border border-dashed border-white/10"
            />
            <div className="relative h-full w-full">
              {mounted && <AboutObject3D active={reduced ? true : stageInView} />}
            </div>

            <div className="glass absolute bottom-4 left-4 rounded-xl px-4 py-2.5">
              <p className="font-mono text-[10px] tracking-[0.25em] text-mist/70 uppercase">
                Live render
              </p>
              <p className="font-display text-sm font-semibold text-white">
                Interactive · Real-time
              </p>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-2 flex flex-col gap-8">
          <SectionHeading
            eyebrow="About Me"
            title="Building ideas that feel alive"
            description={profile.about}
            align="left"
          />

          <Reveal dir="up" delay={220}>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item, index) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs tracking-wide text-mist transition-all duration-500 hover:-translate-y-0.5 hover:border-accent/40 hover:text-white"
                  style={{ transitionDelay: `${index * 40}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal dir="up" delay={300}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Location", value: "Nepal · Kathmandu" },
                { label: "Focus", value: "Web · 3D · AI" },
                { label: "Status", value: "Open to work" },
                { label: "Response", value: "Within 24h" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass rounded-2xl px-4 py-4 transition-transform duration-500 hover:-translate-y-1"
                >
                  <p className="font-mono text-[10px] tracking-[0.22em] text-mist/60 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1.5 font-display text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal dir="up" delay={380}>
            <div className="hairline w-full" />
            <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4">
              {stats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-bold text-white">
                    {stat.value}
                    <span className="text-accent">{stat.suffix}</span>
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-mist/60 uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
