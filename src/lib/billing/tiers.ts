export type TierId = "free" | "personal" | "business";
export type BillingInterval = "monthly" | "yearly";

export type TierDefinition = {
  id: TierId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    callsLifetime?: number;
    promptsLifetime?: number;
    callsPerMonth?: number;
    promptsPerMonth?: number;
  };
  highlighted?: boolean;
};

export const TIERS: Record<TierId, TierDefinition> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Try Butlr once",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "1 daily brief call (lifetime)",
      "2 AI prompts (lifetime)",
      "Gmail + Calendar sync",
      "Butlr workspace access",
    ],
    limits: {
      callsLifetime: 1,
      promptsLifetime: 2,
    },
  },
  personal: {
    id: "personal",
    name: "Personal",
    tagline: "For focused professionals",
    priceMonthly: 12,
    priceYearly: 108,
    features: [
      "Unlimited daily briefs",
      "200 AI prompts / month",
      "Gmail, Calendar, GitHub",
      "Priority email digest",
      "Google Meet links in brief",
    ],
    limits: {
      callsPerMonth: 9999,
      promptsPerMonth: 200,
    },
    highlighted: true,
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "For teams that move fast",
    priceMonthly: 39,
    priceYearly: 348,
    features: [
      "Everything in Personal",
      "Unlimited AI prompts",
      "Slack + GitHub activity",
      "Team workspaces (soon)",
      "Dedicated support",
    ],
    limits: {
      callsPerMonth: 99999,
      promptsPerMonth: 99999,
    },
  },
};

export const TIER_LIST = Object.values(TIERS);
