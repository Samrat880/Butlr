"use client";

import { FadeIn } from "~/components/butlr/fade-in";

const STEPS = [
  {
    title: "Ask naturally",
    body: "Tell Butlr what you need in plain language.",
  },
  {
    title: "Butlr executes",
    body: "Inbox search, drafts, and calendar checks happen in view.",
  },
  {
    title: "You approve",
    body: "Review sends and events before anything goes out.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="butlr-headline-lg">How it works</h2>
          <p className="butlr-subhead mx-auto mt-4 max-w-xl">
            One conversation replaces inbox tabs, calendar views, and draft
            windows.
          </p>
        </FadeIn>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.08} className="text-center">
              <p className="text-sm font-medium text-[var(--butlr-blue)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--butlr-muted)]">
                {step.body}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
