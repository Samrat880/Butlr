"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

import { FadeIn } from "~/components/butlr/fade-in";
import { GlassPanel } from "~/components/butlr/glass-panel";
import {
  TIER_LIST,
  type BillingInterval,
  type TierId,
} from "~/lib/billing/tiers";
import { cn } from "~/lib/utils";

const TIER_DISPLAY: Record<TierId, string> = {
  free: "Free",
  personal: "Personal",
  business: "Business",
};

export function PricingSection() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <section id="pricing" className="border-t border-white/[0.06] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Plans for every workflow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--butlr-muted)]">
            Start free. Upgrade when Butlr becomes part of your daily routine.
          </p>

          <div className="mt-8 inline-flex rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
            {(["monthly", "yearly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setInterval(value)}
                className={cn(
                  "rounded-xl px-6 py-2 text-xs font-medium uppercase tracking-wide transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.97]",
                  interval === value
                    ? "bg-[var(--butlr-blue)] text-white"
                    : "text-[var(--butlr-muted)] hover:text-[var(--butlr-text)]",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIER_LIST.map((tier, i) => {
            const price =
              interval === "monthly" ? tier.priceMonthly : tier.priceYearly;
            const suffix =
              tier.id === "free"
                ? ""
                : interval === "monthly"
                  ? "/mo"
                  : "/yr";

            return (
              <FadeIn key={tier.id} delay={i * 0.06}>
                <GlassPanel
                  className={cn(
                    "flex h-full flex-col p-0",
                    tier.highlighted && "butlr-glow border-[var(--butlr-blue)]/30",
                  )}
                >
                  <div className="border-b border-white/[0.06] p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold">
                        {TIER_DISPLAY[tier.id]}
                      </h3>
                      {tier.highlighted ? (
                        <span className="rounded-full border border-[var(--butlr-blue)]/30 bg-[var(--butlr-blue)]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--butlr-blue)]">
                          Popular
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--butlr-muted)]">
                      {tier.tagline}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-semibold tracking-tight">
                        ${price}
                      </span>
                      {suffix ? (
                        <span className="mb-2 text-xs text-[var(--butlr-muted)]">
                          {suffix}
                        </span>
                      ) : null}
                    </div>

                    <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--butlr-muted)]">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-2.5">
                          <Check className="mt-0.5 size-4 shrink-0 text-[var(--butlr-emerald)]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/get-started"
                      className={cn(
                        "mt-8 w-full text-center",
                        tier.highlighted
                          ? "butlr-btn-primary"
                          : "butlr-btn-secondary",
                      )}
                    >
                      {tier.id === "free" ? "Start free" : "Start Chatting"}
                    </Link>
                  </div>
                </GlassPanel>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
