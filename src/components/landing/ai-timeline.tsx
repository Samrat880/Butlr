"use client";

import { FadeIn } from "~/components/butlr/fade-in";

const EVENTS = [
  { time: "09:01", label: "Found email" },
  { time: "09:02", label: "Generated response" },
  { time: "09:02", label: "User approved" },
  { time: "09:03", label: "Email sent" },
  { time: "09:04", label: "Meeting scheduled" },
];

export function AiTimelineSection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Execution you can see
          </h2>
          <p className="mt-4 text-[var(--butlr-muted)]">
            Butlr shows its work. Never a black box.
          </p>
        </FadeIn>

        <div className="relative space-y-0">
          {EVENTS.map((event, i) => (
            <FadeIn key={event.label} delay={i * 0.08}>
              <div className="relative flex gap-6 pb-10 last:pb-0">
                {i < EVENTS.length - 1 ? (
                  <span className="absolute left-[52px] top-10 h-full w-px bg-white/[0.08]" />
                ) : null}
                <span className="w-12 shrink-0 text-sm tabular-nums text-[var(--butlr-muted)]">
                  {event.time}
                </span>
                <div className="butlr-glass flex-1 px-5 py-4">
                  <p className="font-medium">{event.label}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
