"use client";

import {
  Bell,
  Calendar,
  Keyboard,
  Mail,
  Search,
  Sparkles,
  Sun,
  Target,
  Zap,
} from "lucide-react";

import { FadeIn } from "~/components/butlr/fade-in";
import { cn } from "~/lib/utils";

const HIGHLIGHTS = [
  {
    icon: Mail,
    title: "Smart Inbox",
    desc: "Priority threads surfaced instantly. Urgent items flagged before you open Gmail.",
    className: "md:col-span-2",
  },
  {
    icon: Sparkles,
    title: "AI Drafting",
    desc: "Professional replies in your voice, ready to send after one tap.",
    className: "md:col-span-1",
  },
  {
    icon: Calendar,
    title: "Meeting Scheduling",
    desc: "Book with Google Meet links in a single ask.",
    className: "md:col-span-1",
  },
  {
    icon: Sun,
    title: "Daily Briefing",
    desc: "A morning summary of meetings, threads, and follow-ups.",
    className: "md:col-span-1",
  },
];

const GRID = [
  { icon: Search, title: "Email Search", desc: "Natural language lookup." },
  { icon: Target, title: "Priority Detection", desc: "Urgent threads first." },
  { icon: Bell, title: "Follow-ups", desc: "Never lose a thread." },
  { icon: Keyboard, title: "Command palette", desc: "⌘K for power users." },
  { icon: Zap, title: "Natural Language", desc: "Just say what you need." },
];

export function ButlrFeaturesSection() {
  return (
    <section id="features" className="bg-[var(--butlr-surface)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="butlr-headline-lg">Built for how you work</h2>
          <p className="butlr-subhead mx-auto mt-4 max-w-xl">
            Gmail and Calendar run in the background. Chat is the interface.
          </p>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item, i) => (
            <FadeIn
              key={item.title}
              delay={i * 0.06}
              className={cn(
                "rounded-[28px] border border-white/[0.08] bg-black/40 p-8",
                item.className,
              )}
            >
              <item.icon className="size-8 text-[var(--butlr-blue)]" />
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--butlr-muted)]">
                {item.desc}
              </p>
            </FadeIn>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GRID.map((item, i) => (
            <FadeIn
              key={item.title}
              delay={0.1 + i * 0.04}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <item.icon className="size-5 text-[var(--butlr-muted)]" />
              <p className="mt-4 text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-[var(--butlr-muted)]">
                {item.desc}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
