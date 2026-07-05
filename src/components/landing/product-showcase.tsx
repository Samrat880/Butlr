"use client";

import { FadeIn } from "~/components/butlr/fade-in";

export function ProductShowcaseSection() {
  return (
    <section id="showcase" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="butlr-headline-lg">One workspace. Every action.</h2>
          <p className="butlr-subhead mx-auto mt-4 max-w-xl">
            Conversation on the left. Context on the right. No Gmail clone.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="butlr-showcase-frame">
            <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3">
              <span className="size-2.5 rounded-full bg-[var(--butlr-rose)]/80" />
              <span className="size-2.5 rounded-full bg-[var(--butlr-amber)]/80" />
              <span className="size-2.5 rounded-full bg-[var(--butlr-emerald)]/80" />
              <span className="ml-3 text-xs text-[var(--butlr-muted)]">
                butlr.app
              </span>
            </div>
            <div className="grid min-h-[420px] lg:grid-cols-[1fr_340px]">
              <div className="border-r border-white/[0.06] p-6 md:p-8">
                <p className="text-xs text-[var(--butlr-muted)]">You</p>
                <p className="mt-2 max-w-lg rounded-2xl rounded-tr-md bg-[var(--butlr-blue)] px-4 py-3 text-sm text-white">
                  Summarize my unread emails and find a slot for a 30-min sync
                  with Sarah this week.
                </p>
                <p className="mt-6 text-xs text-[var(--butlr-muted)]">Butlr</p>
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-[var(--butlr-muted)]">
                    I found 8 unread threads. 2 need replies today. Here&apos;s
                    your summary and three open slots with Sarah.
                  </p>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-4 text-sm">
                    <p className="font-medium">Inbox Summary</p>
                    <ul className="mt-2 space-y-1 text-[var(--butlr-muted)]">
                      <li>Invoice from Acme, due Friday</li>
                      <li>Sarah asked to reschedule sync</li>
                      <li>Team standup notes attached</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-black/30 p-6 md:p-8">
                <p className="text-xs font-medium text-[var(--butlr-muted)]">
                  Calendar Preview
                </p>
                <div className="mt-4 space-y-3">
                  {["Wed 2:00 PM", "Thu 11:00 AM", "Fri 4:30 PM"].map((slot) => (
                    <div
                      key={slot}
                      className="rounded-xl border border-[var(--butlr-blue)]/20 bg-[var(--butlr-blue)]/10 px-3 py-2.5 text-sm"
                    >
                      {slot} · Available
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
