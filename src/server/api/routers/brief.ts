import { protectedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { getDailyBrief } from "~/server/services/daily-brief";
import {
  assertCanUse,
  getOrCreateProfile,
  recordUsage,
} from "~/server/services/usage";

export const briefRouter = createTRPCRouter({
  getDaily: protectedProcedure.query(async ({ ctx }) => {
    await assertCanUse(ctx.userId, "call");

    const profile = await getOrCreateProfile(ctx.userId);
    const brief = await getDailyBrief(profile.tenantId, {
      userId: ctx.userId,
      onAiPrompt: async () => {
        await assertCanUse(ctx.userId, "prompt");
        await recordUsage(ctx.userId, "prompt");
      },
    });

    await recordUsage(ctx.userId, "call");
    return brief;
  }),
});
