"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { FadeIn } from "~/components/butlr/fade-in";
import { GlassPanel } from "~/components/butlr/glass-panel";
import { cn } from "~/lib/utils";

const FAQS = [
  {
    q: "Is Butlr a Gmail replacement?",
    a: "No. Butlr is an AI layer on top of Gmail and Google Calendar. You chat; Butlr executes in your existing accounts.",
  },
  {
    q: "What can I ask Butlr to do?",
    a: "Search inbox, draft and send emails, schedule meetings with Google Meet, summarize threads, set reminders, and manage your calendar through natural language.",
  },
  {
    q: "Is my data secure?",
    a: "Butlr uses OAuth to connect your accounts. We never store your Google password. Tokens are encrypted at rest.",
  },
  {
    q: "Does Butlr work on mobile?",
    a: "The workspace is responsive. Chat is full-screen on mobile with context panels as bottom sheets.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
        </FadeIn>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <FadeIn key={item.q} delay={i * 0.05}>
              <GlassPanel className="overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-5 text-left active:scale-[0.995]"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-[var(--butlr-muted)] transition-transform duration-200 ease-out",
                      open === i && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className="butlr-faq-panel"
                  data-open={open === i ? "true" : "false"}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-white/[0.06] px-6 pb-5 pt-4 text-sm leading-relaxed text-[var(--butlr-muted)]">
                      {item.a}
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
