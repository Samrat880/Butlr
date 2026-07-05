"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import {
  TIER_LIST,
  type BillingInterval,
  type TierId,
} from "~/lib/billing/tiers";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

const TIER_DISPLAY: Record<TierId, string> = {
  free: "Free",
  personal: "Personal",
  business: "Business",
};

export function BatcaveBilling() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const usage = api.billing.getUsage.useQuery();
  const selectPlan = api.billing.selectPlan.useMutation({
    onSuccess: () => usage.refetch(),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Plans</h1>
        <p className="mt-2 text-[var(--butlr-muted)]">
          Upgrade for more AI prompts and daily briefs.
        </p>
      </header>

      {usage.data ? (
        <div className="butlr-glass mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-sm">
          <span className="font-medium">
            Current plan:{" "}
            {TIER_DISPLAY[usage.data.tier.id] ?? usage.data.tier.name}
          </span>
          <span className="text-[var(--butlr-muted)]">
            {usage.data.tier.id === "free"
              ? `${usage.data.usage.callsLifetime}/1 briefs, ${usage.data.usage.promptsLifetime}/2 prompts used`
              : `Billed ${usage.data.profile.billingInterval ?? "monthly"}`}
          </span>
        </div>
      ) : null}

      <div className="mb-8 inline-flex rounded-full border border-white/[0.1] bg-white/[0.03] p-1">
        {(["monthly", "yearly"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setInterval(value)}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-medium capitalize transition-colors duration-150 active:scale-[0.97]",
              interval === value
                ? "bg-[var(--butlr-blue)] text-white"
                : "text-[var(--butlr-muted)] hover:text-[var(--butlr-text)]",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {TIER_LIST.map((tier) => {
          const price =
            interval === "monthly" ? tier.priceMonthly : tier.priceYearly;
          const isCurrent = usage.data?.tier.id === tier.id;
          const displayName = TIER_DISPLAY[tier.id];

          return (
            <div
              key={tier.id}
              className={cn(
                "butlr-glass flex flex-col",
                tier.highlighted &&
                  "butlr-glow border-[var(--butlr-blue)]/30",
              )}
            >
              <div className="border-b border-white/[0.08] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{displayName}</h2>
                  {tier.highlighted ? (
                    <span className="rounded-full border border-[var(--butlr-blue)]/30 bg-[var(--butlr-blue)]/10 px-2.5 py-0.5 text-[10px] font-medium text-[var(--butlr-blue)]">
                      Popular
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--butlr-muted)]">
                  {tier.tagline}
                </p>
              </div>
              <div className="flex-1 p-6">
                <p className="text-4xl font-semibold tracking-tight">
                  ${price}
                  {tier.id !== "free" ? (
                    <span className="text-sm font-normal text-[var(--butlr-muted)]">
                      {interval === "monthly" ? "/mo" : "/yr"}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-[var(--butlr-muted)]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-[var(--butlr-blue)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/[0.08] p-6">
                {tier.id === "free" ? (
                  <button
                    type="button"
                    className="butlr-btn-secondary w-full text-sm opacity-60"
                    disabled
                  >
                    {isCurrent ? "Current plan" : "Free"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="butlr-btn-primary w-full text-sm disabled:opacity-50"
                    disabled={selectPlan.isPending || isCurrent}
                    onClick={() => {
                      if (tier.id === "personal" || tier.id === "business") {
                        selectPlan.mutate({ tier: tier.id, interval });
                      }
                    }}
                  >
                    {isCurrent
                      ? "Current plan"
                      : `Upgrade to ${displayName}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectPlan.data ? (
        <p className="mt-6 text-sm text-[var(--butlr-emerald)]">
          {selectPlan.data.message}
        </p>
      ) : null}
    </div>
  );
}
