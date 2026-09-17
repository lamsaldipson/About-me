import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { profile, socials } from "@/data/portfolio";
import { GlowButton, Reveal, SectionHeading, SectionShell } from "@/components/Primitives";
import { cn } from "@/utils/cn";

type Status = "idle" | "sending" | "sent" | "error";

interface FormState {
  name: string;
  email: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjykvjoa";

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const timer = useRef<number | null>(null);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const nextErrors: Partial<Record<keyof FormState, string>> = {};

  if (form.name.trim().length < 2) {
    nextErrors.name = "Please enter your name.";
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    nextErrors.email = "Please enter a valid email.";
  }

  if (form.message.trim().length < 10) {
    nextErrors.message = "A little more detail, please.";
  }

  if (Object.keys(nextErrors).length > 0) {
    setErrors(nextErrors);
    return;
  }

  setStatus("sending");

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    setStatus("sent");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  } catch (error) {
    console.error("Formspree error:", error);
    setStatus("error");
  }
};

  return (
    <SectionShell id="contact" grid>
      <SectionHeading
        eyebrow="Contact"
        title="Let's Connect"
        description="Got an idea, a project or just want to say hi? My inbox is always open."
      />

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        {/* ---------------- Channels ---------------- */}
        <div className="flex flex-col gap-6">
          <Reveal dir="left">
            <a
              href={`mailto:${profile.email}`}
              className="group glass block rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40"
            >
              <p className="font-mono text-[10px] tracking-[0.28em] text-mist/60 uppercase">
                Email me directly
              </p>
              <p className="mt-3 break-all font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                {profile.email}
              </p>
              <p className="mt-3 text-sm text-mist">{profile.location}</p>
            </a>
          </Reveal>

          <div className="flex flex-col gap-3">
            {socials.map((social, index) => (
              <Reveal key={social.name} dir="left" delay={80 + index * 60}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group glass flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/20"
                  style={{ ["--accent-hover" as string]: social.accent }}
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-lg transition-all duration-500 group-hover:scale-110"
                    style={{ color: social.accent }}
                  >
                    {social.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm font-semibold text-white">
                      {social.name}
                    </span>
                    <span className="block truncate text-xs text-mist">{social.handle}</span>
                  </span>
                  <span className="text-mist transition-all duration-500 group-hover:translate-x-1 group-hover:text-white">
                    ↗
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ---------------- Form ---------------- */}
        <Reveal dir="right" delay={120}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="glass relative flex flex-col gap-5 rounded-3xl p-6 sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(500px_240px_at_100%_0%,rgba(139,92,246,0.14),transparent_70%)]"
            />

            <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="name"
                label="Name"
                placeholder="Your name"
                value={form.name}
                onChange={(value) => update("name", value)}
                error={errors.name}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(value) => update("email", value)}
                error={errors.email}
              />
            </div>

            <Field
              id="message"
              label="Message"
              placeholder="Tell me about your idea..."
              value={form.message}
              onChange={(value) => update("message", value)}
              error={errors.message}
              textarea
            />

            <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <GlowButton type="submit" disabled={status === "sending"} className="px-8 py-3.5 disabled:opacity-70">
                {status === "sending" ? "Sending..." : "Send Message"}
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </GlowButton>

              <p
                aria-live="polite"
                className={cn(
                  "text-sm transition-opacity duration-500",
                  status === "sent" ? "text-emerald-300 opacity-100" : "opacity-0",
                )}
              >
                ✓ Thanks! Your message has been sent.
              </p>
            </div>
             <div>  <p
                aria-live="polite"
                className={cn(
                  "text-sm transition-opacity duration-500",
                  status === "error" ? "text-emerald-300 opacity-100" : "opacity-0",
                )}
              >
                 ✕ Something went wrong. Please try again.
              </p></div>
          </form>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ============================================================
   Field primitive
   ============================================================ */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  textarea?: boolean;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  textarea,
}: FieldProps) {
  const shared = {
    id,
    value,
    placeholder,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
    className:
      "w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-mist/45 outline-none transition-all duration-300 focus:bg-white/[0.06]",
    "aria-invalid": Boolean(error),
  };

  return (
    <div className="relative flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-[10px] tracking-[0.24em] text-mist/70 uppercase">
        {label}
      </label>

      {textarea ? (
        <textarea
          {...shared}
          rows={5}
          className={cn(shared.className, "resize-none")}
          style={{ borderColor: error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.09)" }}
        />
      ) : (
        <input
          {...shared}
          type={type}
          style={{ borderColor: error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.09)" }}
        />
      )}

      {error && <span className="text-[11px] text-rose-300">{error}</span>}
    </div>
  );
}
