"use client";

import { FadeIn } from "~/components/butlr/fade-in";
import { GlassPanel } from "~/components/butlr/glass-panel";

const METRICS = [
  { value: "5+", label: "Hours saved every week", sub: "Less inbox triage" },
  { value: "12", label: "Meetings organized", sub: "Per active user / month" },
  { value: "40", label: "Emails drafted", sub: "With AI assistance" },
  { value: "<2m", label: "Average response time", sub: "From ask to action" },
];

export function MetricsSection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <FadeIn key={m.label} delay={i * 0.08}>
            <GlassPanel className="p-8 text-center">
              <p className="text-4xl font-semibold text-[var(--butlr-blue)]">
                {m.value}
              </p>
              <p className="mt-3 font-medium">{m.label}</p>
              <p className="mt-1 text-sm text-[var(--butlr-muted)]">{m.sub}</p>
            </GlassPanel>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
