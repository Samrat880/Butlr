import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { runCaveAssistant } from "~/server/services/cave-assistant";
import {
  assertCanUse,
  getOrCreateProfile,
  recordUsage,
} from "~/server/services/usage";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(8000),
            }),
          )
          .min(1)
          .max(40),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertCanUse(ctx.userId, "prompt");

      const profile = await getOrCreateProfile(ctx.userId);

      try {
        const result = await runCaveAssistant(profile.tenantId, input.messages, {
          name: ctx.session.user.name,
          email: ctx.session.user.email,
        });
        if (!result.guarded) {
          await recordUsage(ctx.userId, "prompt");
        }
        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to run Batcave assistant",
        });
      }
    }),
});
