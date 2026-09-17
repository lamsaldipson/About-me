import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { projects } from "@/data/portfolio";
import type { Project } from "@/types";
import { usePrefersReducedMotion } from "@/hooks";
import { Reveal, SectionHeading, SectionShell } from "@/components/Primitives";

/**
 * Card with a subtle 3D tilt driven by the pointer.
 * Transform + glare position are written directly to the DOM (no state)
 * so the effect stays at 60fps.
 */
function TiltCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const frame = useRef<number | null>(null);
  const target = useRef({ rx: 0, ry: 0, x: 50, y: 50 });

  const apply = useCallback(() => {
    frame.current = null;
    const node = ref.current;
    if (!node) return;
    const { rx, ry, x, y } = target.current;
    node.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0, -6px, 0)`;
    node.style.setProperty("--x", `${x}%`);
    node.style.setProperty("--y", `${y}%`);
  }, []);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    target.current = {
      rx: -(py - 0.5) * 14,
      ry: (px - 0.5) * 16,
      x: px * 100,
      y: py * 100,
    };
    if (frame.current === null) frame.current = requestAnimationFrame(apply);
  };

  const onPointerLeave = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    target.current = { rx: 0, ry: 0, x: 50, y: 50 };
    const node = ref.current;
    if (node) {
      node.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0)";
      node.style.setProperty("--x", "50%");
      node.style.setProperty("--y", "50%");
    }
  };

  const [from, to] = project.gradient ?? ["#22d3ee", "#8b5cf6"];

  return (
    <Reveal dir="scale" delay={index * 90} className="h-full">
      <article
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ transformStyle: "preserve-3d", transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)" }}
        className="group glass spotlight-card relative flex h-full flex-col overflow-hidden rounded-3xl"
      >
        {/* Pointer-following glare */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(360px 260px at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.14), transparent 65%)",
          }}
        />

        {/* Generated artwork */}
        <div
          className="relative h-44 w-full overflow-hidden sm:h-48"
          style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.25) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.35),transparent_55%)] mix-blend-overlay"
          />
          <span className="absolute inset-0 grid place-items-center text-6xl text-white/85 transition-transform duration-700 group-hover:scale-110">
            {project.glyph ?? "◈"}
          </span>
          <span className="glass absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] tracking-[0.2em] text-white uppercase">
            {project.tag ?? "Project"}
          </span>
          <span className="absolute right-3 bottom-3 font-mono text-[11px] text-white/70">
            0{index + 1}
          </span>
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-accent">
            {project.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{project.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] tracking-wide text-mist transition-colors duration-300 group-hover:border-accent/30 group-hover:text-white/90"
              >
                {tech}
              </span>
            ))}
          </div>

          <a
            href={project.link}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition-all duration-500 hover:border-accent/40 hover:bg-accent/10"
          >
            View Project
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export default function Projects() {
  return (
    <SectionShell id="projects" grid>
      <SectionHeading
        eyebrow="Selected Work"
        title="Featured Projects"
        description="Things I designed, built and shipped — each one an experiment that taught me something new."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <TiltCard key={project.title} project={project} index={index} />
        ))}
      </div>
    </SectionShell>
  );
}
