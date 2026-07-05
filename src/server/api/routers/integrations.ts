import { generateOAuthUrl } from "corsair/oauth";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getAppUrl } from "~/lib/app-url";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { corsair } from "~/server/corsair";
import {
  disconnectIntegration,
  ensureCorsairCredentials,
  getOAuthRedirectUri,
  getTenantIntegrationStatuses,
  isOAuthPlugin,
  isPluginConnected,
} from "~/server/services/corsair-integrations";
import { getOrCreateProfile } from "~/server/services/usage";

const PLUGIN_IDS = ["gmail", "googlecalendar", "github"] as const;

export const integrationsRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const plugins = await corsair.manage.plugins.list();
    return plugins.filter((plugin) =>
      PLUGIN_IDS.includes(plugin.id as (typeof PLUGIN_IDS)[number]),
    );
  }),

  connectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getOrCreateProfile(ctx.userId);
    return getTenantIntegrationStatuses(profile.tenantId);
  }),

  getConnectUrl: protectedProcedure
    .input(z.object({ pluginId: z.enum(PLUGIN_IDS) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getOrCreateProfile(ctx.userId);

      try {
        const statuses = await getTenantIntegrationStatuses(profile.tenantId);
        const current = statuses[input.pluginId];

        if (isPluginConnected(current)) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `${input.pluginId} is already authenticated. Disconnect first to link a different account.`,
          });
        }

        await ensureCorsairCredentials(profile.tenantId);

        if (input.pluginId === "github") {
          const token = process.env.GITHUB_TOKEN;
          if (!token) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message:
                "GitHub requires a personal access token. Add GITHUB_TOKEN to your server environment for now.",
            });
          }
          const tenant = corsair.withTenant(profile.tenantId);
          await tenant.github.keys.set_api_key(token);
          return {
            url: `${getAppUrl()}/batcave/integrations?connected=true`,
            mode: "github_token" as const,
          };
        }

        if (!isOAuthPlugin(input.pluginId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unsupported integration",
          });
        }

        const result = await generateOAuthUrl(corsair, input.pluginId, {
          tenantId: profile.tenantId,
          redirectUri: getOAuthRedirectUri(),
        });

        return {
          url: result.url,
          state: result.state,
          mode: "oauth" as const,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to start connection flow",
        });
      }
    }),

  disconnect: protectedProcedure
    .input(z.object({ pluginId: z.enum(PLUGIN_IDS) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getOrCreateProfile(ctx.userId);
      const result = await disconnectIntegration(
        profile.tenantId,
        input.pluginId,
      );

      if (!result.ok) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: result.message,
        });
      }

      const status = await getTenantIntegrationStatuses(profile.tenantId);

      return { ...result, status };
    }),
});
