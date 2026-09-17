import { useMemo, useState } from "react";
import { skills } from "@/data/portfolio";
import { useInView, useProgress } from "@/hooks";
import { Reveal, SectionHeading, SectionShell } from "@/components/Primitives";
import { cn } from "@/utils/cn";

const SIZE = 420;
const CENTER = SIZE / 2;
const MAX_RADIUS = 128;
const LABEL_OFFSET = 26;
const RINGS = [0.25, 0.5, 0.75, 1];

/** Angle of spoke `index` out of `count`, starting at 12 o'clock. */
const angleFor = (index: number, count: number) => (Math.PI * 2 * index) / count - Math.PI / 2;

const toPoint = (index: number, count: number, radius: number): [number, number] => [
  CENTER + Math.cos(angleFor(index, count)) * radius,
  CENTER + Math.sin(angleFor(index, count)) * radius,
];

const toPolygon = (count: number, radius: number) =>
  Array.from({ length: count }, (_, i) => toPoint(i, count, radius).join(",")).join(" ");

/**
 * SVG "3D-style" capability radar.
 * The polygon grows from the centre when the section scrolls into view,
 * and hovering a skill in the list highlights its vertex.
 */
export default function CapabilityRadar() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const progress = useProgress(inView, 1500);
  const [hovered, setHovered] = useState<number | null>(null);

  const count = skills.length;

  const gridRings = useMemo(() => RINGS.map((ratio) => toPolygon(count, MAX_RADIUS * ratio)), [count]);
  const spokes = useMemo(
    () => Array.from({ length: count }, (_, i) => toPoint(i, count, MAX_RADIUS)),
    [count],
  );

  const dataPoints = useMemo(
    () =>
      skills.map((skill, index) => ({
        ...skill,
        point: toPoint(index, count, MAX_RADIUS * (skill.value / 100) * progress),
        label: toPoint(index, count, MAX_RADIUS + LABEL_OFFSET),
        angle: angleFor(index, count),
      })),
    [count, progress],
  );

  const dataPolygon = dataPoints.map((item) => item.point.join(",")).join(" ");
  const active = hovered !== null ? skills[hovered] : null;

  return (
    <SectionShell id="capabilities" grid>
      <SectionHeading
        eyebrow="Capabilities"
        title="My Capabilities"
        description="A live snapshot of the tools and instincts I reach for most. Every value is editable from one place."
      />

      <div ref={ref} className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* ---------------- Radar ---------------- */}
        <Reveal dir="scale" className="relative mx-auto w-full max-w-[560px]">
          <div className="spotlight-card glass relative rounded-[2rem] p-4 sm:p-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.14),transparent_65%)]"
            />
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="relative w-full"
              role="img"
              aria-label="Radar chart of capabilities"
            >
              <defs>
                <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity="0.12" />
                </radialGradient>
                <linearGradient id="radar-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="55%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="radar-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
                <filter id="radar-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Concentric rings */}
              {gridRings.map((ring, index) => (
                <polygon
                  key={ring}
                  points={ring}
                  fill="none"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth={index === RINGS.length - 1 ? 1.2 : 0.7}
                />
              ))}

              {/* Spokes */}
              {spokes.map(([x, y], index) => (
                <line
                  key={index}
                  x1={CENTER}
                  y1={CENTER}
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={0.6}
                />
              ))}

              {/* Rotating radar sweep — parent translates to the centre,
                  child rotates around its own origin so the wedge pivots. */}
              <g transform={`translate(${CENTER}, ${CENTER})`}>
                <g className="animate-spin-slow" style={{ transformOrigin: "0px 0px" }}>
                  <path
                    d={`M 0 0 L ${MAX_RADIUS} 0 A ${MAX_RADIUS} ${MAX_RADIUS} 0 0 0 ${
                      Math.cos(-0.75) * MAX_RADIUS
                    } ${Math.sin(-0.75) * MAX_RADIUS} Z`}
                    fill="url(#radar-sweep)"
                  />
                </g>
              </g>

              {/* Data area */}
              <polygon
                points={dataPolygon}
                fill="url(#radar-fill)"
                stroke="url(#radar-stroke)"
                strokeWidth={2.6}
                strokeLinejoin="round"
                filter="url(#radar-glow)"
              />

              {/* Vertices */}
              {dataPoints.map((item, index) => (
                <g key={item.name}>
                  <circle
                    cx={item.point[0]}
                    cy={item.point[1]}
                    r={hovered === index ? 5.6 : 3.4}
                    fill={hovered === index ? "#ffffff" : "#22d3ee"}
                    className="transition-all duration-300"
                  />
                  {hovered === index && (
                    <circle
                      cx={item.point[0]}
                      cy={item.point[1]}
                      r={10.5}
                      fill="none"
                      stroke="#22d3ee"
                      strokeOpacity={0.55}
                      strokeWidth={1}
                    />
                  )}
                </g>
              ))}

              {/* Labels — wrap onto a second line near the horizontal axis
                  so long names never spill outside the viewBox. */}
              {dataPoints.map((item, index) => {
                const cos = Math.cos(item.angle);
                const anchor = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
                const words = item.name.split(" ");
                const stacked = words.length > 1 && Math.abs(cos) > 0.45;

                return (
                  <text
                    key={item.name}
                    x={item.label[0]}
                    y={item.label[1]}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className={cn(
                      "font-sans transition-all duration-300",
                      hovered === index ? "fill-white" : "fill-[#9aa6c4]",
                    )}
                    style={{ fontSize: 11, letterSpacing: 0.2 }}
                  >
                    {stacked ? (
                      words.map((word, wordIndex) => (
                        <tspan
                          key={word}
                          x={item.label[0]}
                          dy={wordIndex === 0 ? -6 : 12}
                        >
                          {word}
                        </tspan>
                      ))
                    ) : (
                      <tspan x={item.label[0]}>{item.name}</tspan>
                    )}
                  </text>
                );
              })}

              {/* Centre readout */}
              <circle cx={CENTER} cy={CENTER} r={38} fill="rgba(4,6,14,0.9)" stroke="rgba(255,255,255,0.09)" />
              <text
                x={CENTER}
                y={CENTER - 4}
                textAnchor="middle"
                className="font-display fill-white"
                style={{ fontSize: 19, fontWeight: 700 }}
              >
                {active ? `${Math.round(active.value * progress)}%` : `${Math.round(progress * 100)}%`}
              </text>
              <text
                x={CENTER}
                y={CENTER + 12}
                textAnchor="middle"
                className="fill-[#9aa6c4] font-sans"
                style={{ fontSize: 8.6, letterSpacing: 1 }}
              >
                {(active?.name ?? "AVERAGE").toUpperCase().slice(0, 14)}
              </text>
            </svg>
          </div>
        </Reveal>

        {/* ---------------- Skill bars ---------------- */}
        <div className="flex flex-col gap-3">
          {skills.map((skill, index) => (
            <Reveal key={skill.name} dir="right" delay={index * 60}>
              <div
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                className={cn(
                  "glass group rounded-2xl px-4 py-3.5 transition-all duration-500 hover:-translate-y-0.5",
                  hovered === index && "border-accent/40 shadow-[0_14px_44px_-24px_rgba(34,211,238,0.9)]",
                )}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-display text-sm font-semibold text-white sm:text-[15px]">
                      {skill.name}
                    </p>
                    {skill.note && (
                      <p className="mt-0.5 text-[11px] tracking-wide text-mist/70">{skill.note}</p>
                    )}
                  </div>
                  <span className="font-mono text-sm text-accent">
                    {Math.round(skill.value * progress)}%
                  </span>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent via-[#7dd3fc] to-accent-2 transition-[width] duration-300 ease-out"
                    style={{ width: `${skill.value * progress}%` }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
