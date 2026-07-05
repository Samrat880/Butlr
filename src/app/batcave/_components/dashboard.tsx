"use client";

import Link from "next/link";
import { ArrowUpRight, Video } from "lucide-react";

import { api } from "~/trpc/react";

function formatEventTime(start?: { dateTime?: string; date?: string }) {
  const value = start?.dateTime ?? start?.date;
  if (!value) return "All day";
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BatcaveDashboard() {
  const usage = api.billing.getUsage.useQuery();
  const brief = api.brief.getDaily.useQuery(undefined, {
    retry: false,
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Morning Brief
          </h1>
          <p className="mt-2 text-[var(--butlr-muted)]">
            Calendar, inbox, and activity in one view.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/batcave/chat" className="butlr-btn-secondary text-sm">
            Open Chat
          </Link>
          <button
            type="button"
            className="butlr-btn-primary text-sm disabled:opacity-50"
            onClick={() => brief.refetch()}
            disabled={brief.isFetching}
          >
            {brief.isFetching ? "Refreshing..." : "Refresh Brief"}
          </button>
        </div>
      </header>

      {usage.data ? (
        <div className="butlr-glass flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-sm">
          <span className="font-medium">{usage.data.tier.name} plan</span>
          <span className="text-[var(--butlr-muted)]">
            {usage.data.tier.id === "free"
              ? `${usage.data.usage.callsLifetime}/${usage.data.tier.limits.callsLifetime ?? 1} briefs, ${usage.data.usage.promptsLifetime}/${usage.data.tier.limits.promptsLifetime ?? 2} prompts used`
              : `This month: ${usage.data.usage.callsThisMonth} briefs, ${usage.data.usage.promptsThisMonth} prompts`}
          </span>
        </div>
      ) : null}

      {brief.isLoading ? (
        <div className="butlr-glass space-y-4 p-8">
          <div className="h-4 w-32 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
      ) : brief.error ? (
        <div className="rounded-2xl border border-[var(--butlr-rose)]/25 bg-[var(--butlr-rose)]/10 p-6">
          <p className="font-medium">{brief.error.message}</p>
          <Link
            href="/batcave/integrations"
            className="butlr-link mt-3 inline-block text-sm"
          >
            Open integrations →
          </Link>
        </div>
      ) : brief.data ? (
        <>
          <section className="butlr-glass p-6 md:p-8">
            <p className="text-sm text-[var(--butlr-muted)]">
              {brief.data.date}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Today&apos;s summary
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--butlr-muted)]">
              {brief.data.summary}
            </p>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Schedule",
                empty: "No events today.",
                items: brief.data.calendar.map((event) => (
                  <div
                    key={event.id ?? event.summary}
                    className="rounded-2xl border border-white/[0.08] bg-black/25 p-4"
                  >
                    <p className="text-xs font-medium text-[var(--butlr-blue)]">
                      {formatEventTime(event.start)}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {event.summary ?? "Untitled event"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.hangoutLink ? (
                        <a
                          href={event.hangoutLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--butlr-emerald)]/25 bg-[var(--butlr-emerald)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--butlr-emerald)] transition-colors duration-150 hover:bg-[var(--butlr-emerald)]/20"
                        >
                          <Video className="size-3" />
                          Join Meet
                        </a>
                      ) : null}
                      {event.htmlLink ? (
                        <a
                          href={event.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] px-2.5 py-1 text-[11px] text-[var(--butlr-muted)] transition-colors duration-150 hover:text-[var(--butlr-text)]"
                        >
                          Calendar
                          <ArrowUpRight className="size-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                )),
              },
              {
                title: "Inbox",
                empty: "No synced threads.",
                items: brief.data.emails.map((email) => (
                  <div
                    key={email.id}
                    className="rounded-2xl border border-white/[0.08] bg-black/25 p-4 text-sm text-[var(--butlr-muted)]"
                  >
                    {email.snippet ?? "No preview"}
                  </div>
                )),
              },
              {
                title: "GitHub",
                empty: "Connect GitHub to see activity.",
                items: (brief.data.github?.repositories ?? []).map((repo) => (
                  <a
                    key={repo.fullName ?? repo.name}
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-white/[0.08] bg-black/25 p-4 transition-colors duration-150 hover:border-[var(--butlr-blue)]/30"
                  >
                    <p className="text-sm font-medium">
                      {repo.fullName ?? repo.name}
                    </p>
                  </a>
                )),
              },
            ].map((section) => (
              <section key={section.title} className="butlr-glass p-5">
                <h3 className="text-sm font-medium text-[var(--butlr-muted)]">
                  {section.title}
                </h3>
                <div className="mt-4 space-y-3">
                  {section.items.length === 0 ? (
                    <p className="text-sm text-[var(--butlr-muted)]">
                      {section.empty}
                    </p>
                  ) : (
                    section.items
                  )}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
