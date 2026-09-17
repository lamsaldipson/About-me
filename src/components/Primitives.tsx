import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { useInView } from "@/hooks";

/* ============================================================
   Scroll reveal wrapper
   ============================================================ */

export type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "rotate";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Direction the element travels from before settling */
  dir?: RevealDirection;
  /** Stagger delay in milliseconds */
  delay?: number;
  style?: CSSProperties;
}

export function Reveal({ children, className, dir = "up", delay = 0, style }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      data-dir={dir}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={cn("reveal", inView && "is-visible", className)}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Consistent section heading
   ============================================================ */

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Reveal dir="up">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-accent/90">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          {eyebrow}
        </span>
      </Reveal>

      <Reveal dir="up" delay={80}>
        <h2 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          <span className="text-gradient">{title}</span>
        </h2>
      </Reveal>

      {description && (
        <Reveal dir="up" delay={160}>
          <p
            className={cn(
              "max-w-2xl text-base leading-relaxed text-mist sm:text-lg",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ============================================================
   Buttons
   ============================================================ */

type ButtonVariant = "primary" | "ghost";

interface GlowButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  external?: boolean;
}

export function GlowButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
  external,
}: GlowButtonProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-500 active:scale-[0.97]";

  const styles: Record<ButtonVariant, string> = {
    primary:
      "text-[#041018] bg-gradient-to-r from-accent via-[#7dd3fc] to-accent-2 shadow-[0_10px_40px_-12px_rgba(34,211,238,0.8)] hover:shadow-[0_16px_60px_-14px_rgba(139,92,246,0.9)] hover:-translate-y-0.5",
    ghost:
      "glass text-white/90 hover:text-white hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-[0_14px_50px_-18px_rgba(34,211,238,0.6)]",
  };

  const inner = (
    <>
      {/* Sheen that sweeps across on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  const classes = cn(base, styles[variant], className);

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

/* ============================================================
   Section shell (consistent spacing + optional grid backdrop)
   ============================================================ */

interface SectionShellProps {
  id: string;
  children: ReactNode;
  className?: string;
  grid?: boolean;
}

export function SectionShell({ id, children, className, grid }: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:py-40", className)}
    >
      {grid && (
        <div
          aria-hidden="true"
          className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]"
        />
      )}
      {children}
    </section>
  );
}
