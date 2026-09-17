import { services } from "@/data/portfolio";
import { Reveal, SectionHeading, SectionShell } from "@/components/Primitives";

export default function Services() {
  return (
    <SectionShell id="services" grid>
      <SectionHeading
        eyebrow="What I Do"
        title="Services"
        description="A small set of things I do properly — from interfaces that move to stories that land."
      />

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Reveal key={service.title} dir="up" delay={index * 80} className="h-full">
            <article className="group glass spotlight-card relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-[0_30px_80px_-50px_rgba(139,92,246,0.95)]">
              {/* Hover wash */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(400px 240px at 20% 0%, rgba(34,211,238,0.14), transparent 70%)",
                }}
              />

              <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] text-2xl text-accent transition-all duration-500 group-hover:scale-110 group-hover:border-accent/40 group-hover:text-white">
                {service.icon}
              </span>

              <h3 className="relative mt-6 font-display text-lg font-semibold text-white sm:text-xl">
                {service.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-mist">{service.description}</p>

              {service.bullets && (
                <ul className="relative mt-5 flex flex-col gap-2">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2.5 text-[13px] text-white/70">
                      <span className="h-1 w-1 rounded-full bg-gradient-to-r from-accent to-accent-2" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              <span className="hairline relative mt-6 w-full opacity-40 transition-opacity duration-500 group-hover:opacity-100" />
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
