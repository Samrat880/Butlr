import { and, count, eq, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { TIERS, type TierId } from "~/lib/billing/tiers";
import { db } from "~/server/db";
import { usageRecords, userProfiles } from "~/server/db/schema";

export type UsageType = "call" | "prompt";

export async function getOrCreateProfile(userId: string) {
  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(userProfiles)
    .values({
      userId,
      tenantId: userId,
      tier: "free",
    })
    .returning();

  return created!;
}

export async function getUsageStats(userId: string) {
  const profile = await getOrCreateProfile(userId);
  const tier = TIERS[profile.tier as TierId] ?? TIERS.free;

  const [lifetimeCalls] = await db
    .select({ value: count() })
    .from(usageRecords)
    .where(
      and(eq(usageRecords.userId, userId), eq(usageRecords.type, "call")),
    );

  const [lifetimePrompts] = await db
    .select({ value: count() })
    .from(usageRecords)
    .where(
      and(eq(usageRecords.userId, userId), eq(usageRecords.type, "prompt")),
    );

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [monthlyCalls] = await db
    .select({ value: count() })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.userId, userId),
        eq(usageRecords.type, "call"),
        gte(usageRecords.createdAt, monthStart),
      ),
    );

  const [monthlyPrompts] = await db
    .select({ value: count() })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.userId, userId),
        eq(usageRecords.type, "prompt"),
        gte(usageRecords.createdAt, monthStart),
      ),
    );

  return {
    profile,
    tier,
    usage: {
      callsLifetime: lifetimeCalls?.value ?? 0,
      promptsLifetime: lifetimePrompts?.value ?? 0,
      callsThisMonth: monthlyCalls?.value ?? 0,
      promptsThisMonth: monthlyPrompts?.value ?? 0,
    },
  };
}

export async function assertCanUse(userId: string, type: UsageType) {
  const stats = await getUsageStats(userId);
  const { tier, usage } = stats;

  if (tier.id === "free") {
    if (type === "call" && tier.limits.callsLifetime !== undefined) {
      if (usage.callsLifetime >= tier.limits.callsLifetime) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Free tier includes 1 daily brief call for life. Upgrade to Personal or Business for unlimited access.",
        });
      }
    }
    if (type === "prompt" && tier.limits.promptsLifetime !== undefined) {
      if (usage.promptsLifetime >= tier.limits.promptsLifetime) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Free tier includes 2 AI prompts for life. Upgrade to continue.",
        });
      }
    }
    return stats;
  }

  if (type === "call" && tier.limits.callsPerMonth !== undefined) {
    if (usage.callsThisMonth >= tier.limits.callsPerMonth) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Monthly call limit reached. Upgrade your plan.",
      });
    }
  }

  if (type === "prompt" && tier.limits.promptsPerMonth !== undefined) {
    if (usage.promptsThisMonth >= tier.limits.promptsPerMonth) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Monthly AI prompt limit reached. Upgrade your plan.",
      });
    }
  }

  return stats;
}

export async function recordUsage(userId: string, type: UsageType) {
  await db.insert(usageRecords).values({ userId, type });
}
