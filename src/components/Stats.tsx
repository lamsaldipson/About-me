import { stats } from "@/data/portfolio";
import { useCountUp, useInView } from "@/hooks";
import { Reveal, SectionShell } from "@/components/Primitives";

/** Single animated counter — counts up the first time it enters the viewport. */
function Counter({ value, suffix, prefix, label, description }: (typeof stats)[number]) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const current = useCountUp(value, inView, 1800);

  return (
    <div ref={ref} className="group relative flex flex-col items-center px-4 py-8 text-center">
      <p className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
        <span className="text-gradient">
          {prefix}
          {Math.round(current)}
          {suffix}
        </span>
      </p>
      <p className="mt-3 font-display text-sm font-semibold tracking-[0.2em] text-white/90 uppercase">
        {label}
      </p>
      {description && <p className="mt-1 text-xs tracking-wide text-mist/70">{description}</p>}

      <span
        aria-hidden="true"
        className="absolute inset-x-6 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-accent/60 to-transparent transition-transform duration-700 group-hover:scale-x-100"
      />
    </div>
  );
}

export default function Stats() {
  return (
    <SectionShell id="stats">
      <Reveal dir="scale">
        <div className="glass relative overflow-hidden rounded-[2rem] px-2 py-4 sm:px-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(circle_at_85%_90%,rgba(139,92,246,0.14),transparent_60%)]"
          />
          <div
            aria-hidden="true"
            className="grid-bg pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"
          />
          <div className="relative grid grid-cols-2 divide-y divide-white/[0.07] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={index % 2 === 1 ? "lg:border-white/[0.07]" : ""}
              >
                <Counter {...stat} />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
