"use client";

import { FadeIn } from "~/components/butlr/fade-in";
import { GlassPanel } from "~/components/butlr/glass-panel";

const QUOTES = [
  {
    name: "Priya Sharma",
    role: "Product Lead",
    quote:
      "I stopped opening Gmail during standups. I just ask Butlr what's urgent.",
  },
  {
    name: "Marcus Chen",
    role: "Founder",
    quote:
      "Scheduling used to take six tabs. Now it's one sentence in chat.",
  },
  {
    name: "Elena Rodriguez",
    role: "Operations",
    quote:
      "The daily briefing alone saves me twenty minutes every morning.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Trusted by focused teams
          </h2>
        </FadeIn>
        <div className="grid gap-6 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <FadeIn key={q.name} delay={i * 0.1}>
              <GlassPanel className="h-full p-8">
                <p className="leading-relaxed text-[var(--butlr-muted)]">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-white/[0.06] pt-4">
                  <p className="font-medium">{q.name}</p>
                  <p className="text-sm text-[var(--butlr-muted)]">{q.role}</p>
                </div>
              </GlassPanel>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
