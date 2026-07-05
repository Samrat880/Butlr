import { eq } from "drizzle-orm";
import { z } from "zod";

import { TIERS } from "~/lib/billing/tiers";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { userProfiles } from "~/server/db/schema";
import { getOrCreateProfile, getUsageStats } from "~/server/services/usage";

export const billingRouter = createTRPCRouter({
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getUsageStats(ctx.userId);
    return {
      tier: stats.tier,
      usage: stats.usage,
      profile: stats.profile,
    };
  }),

  listTiers: publicProcedure.query(() => TIERS),

  selectPlan: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["personal", "business"]),
        interval: z.enum(["monthly", "yearly"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await getOrCreateProfile(ctx.userId);

      await db
        .update(userProfiles)
        .set({
          tier: input.tier,
          billingInterval: input.interval,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, profile.userId));

      return {
        ok: true,
        message:
          "Plan selected. Stripe billing will be wired in the next step — your tier is active for development.",
      };
    }),
});
