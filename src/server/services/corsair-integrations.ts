import { eq, and } from "drizzle-orm";
import { setupCorsair } from "corsair/setup";

import { env } from "~/env";
import { getCorsairOAuthRedirectUri } from "~/lib/google-oauth-callback";
import { db } from "~/server/db";
import {
  corsairAccounts,
  corsairEntities,
  corsairEvents,
  corsairIntegrations,
} from "~/server/db/schema";
import { corsair } from "~/server/corsair";

const OAUTH_PLUGINS = ["gmail", "googlecalendar"] as const;
export type IntegrationPluginId = "gmail" | "googlecalendar" | "github";

export type PluginConnectionState =
  | "connected"
  | "missing_credentials"
  | "not_connected";

export type IntegrationStatusView = {
  pluginId: IntegrationPluginId;
  rawState: PluginConnectionState;
  isAuthenticated: boolean;
  connectionEstablished: boolean;
  statusLabel: string;
  statusDetail: string;
  canConnect: boolean;
  canDisconnect: boolean;
};

async function verifyPluginAuthentication(
  tenantId: string,
  pluginId: IntegrationPluginId,
): Promise<boolean> {
  try {
    const tenant = corsair.withTenant(tenantId);

    if (pluginId === "gmail") {
      const accessToken = await tenant.gmail.keys.get_access_token();
      const refreshToken = await tenant.gmail.keys.get_refresh_token();
      return Boolean(accessToken && refreshToken);
    }

    if (pluginId === "googlecalendar") {
      const accessToken = await tenant.googlecalendar.keys.get_access_token();
      const refreshToken = await tenant.googlecalendar.keys.get_refresh_token();
      return Boolean(accessToken && refreshToken);
    }

    const apiKey = await tenant.github.keys.get_api_key();
    return Boolean(apiKey);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Corsair throws until setupCorsair creates the plugin shell.
    if (message.includes("not found")) {
      return false;
    }
    throw error;
  }
}

function mapIntegrationStatus(
  pluginId: IntegrationPluginId,
  rawState: PluginConnectionState | undefined,
  isAuthenticated: boolean,
): IntegrationStatusView {
  const state = rawState ?? "not_connected";

  if (isAuthenticated) {
    return {
      pluginId,
      rawState: "connected",
      isAuthenticated: true,
      connectionEstablished: true,
      statusLabel: "Authenticated",
      statusDetail: "Connection established and tokens are active.",
      canConnect: false,
      canDisconnect: true,
    };
  }

  if (state === "missing_credentials") {
    return {
      pluginId,
      rawState: state,
      isAuthenticated: false,
      connectionEstablished: true,
      statusLabel: "Not authenticated",
      statusDetail:
        "Account shell exists but OAuth was not completed. Click Connect to authenticate.",
      canConnect: true,
      canDisconnect: true,
    };
  }

  return {
    pluginId,
    rawState: "not_connected",
    isAuthenticated: false,
    connectionEstablished: false,
    statusLabel: "Not connected",
    statusDetail: "No integration linked for your account yet.",
    canConnect: true,
    canDisconnect: false,
  };
}

function parsePluginConnectionState(
  value: unknown,
): PluginConnectionState | undefined {
  if (
    value === "connected" ||
    value === "missing_credentials" ||
    value === "not_connected"
  ) {
    return value;
  }
  return undefined;
}

export async function getTenantIntegrationStatuses(tenantId: string) {
  // Ensure Corsair plugin shells exist before reading keys / connection status.
  await ensureCorsairCredentials(tenantId);

  const raw = await getTenantConnectionStatus(tenantId);
  const plugins: IntegrationPluginId[] = ["gmail", "googlecalendar", "github"];

  const entries = await Promise.all(
    plugins.map(async (pluginId) => {
      const rawState = parsePluginConnectionState(raw[pluginId]);
      const isAuthenticated = await verifyPluginAuthentication(
        tenantId,
        pluginId,
      );
      return [
        pluginId,
        mapIntegrationStatus(pluginId, rawState, isAuthenticated),
      ] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<
    IntegrationPluginId,
    IntegrationStatusView
  >;
}

async function ensureIntegrationOAuthCredentials() {
  const redirectUri = getCorsairOAuthRedirectUri();

  await corsair.keys.gmail.set_client_id(env.AUTH_GOOGLE_ID);
  await corsair.keys.gmail.set_client_secret(env.AUTH_GOOGLE_SECRET);
  await corsair.keys.gmail.set_redirect_url(redirectUri);
  await corsair.keys.googlecalendar.set_client_id(env.AUTH_GOOGLE_ID);
  await corsair.keys.googlecalendar.set_client_secret(env.AUTH_GOOGLE_SECRET);
  await corsair.keys.googlecalendar.set_redirect_url(redirectUri);
}

export async function ensureCorsairCredentials(tenantId: string) {
  // Corsair requires plugin rows in corsair_integrations before keys.* can be set.
  await setupCorsair(corsair, { tenantId });
  await ensureIntegrationOAuthCredentials();
}

export async function getTenantConnectionStatus(tenantId: string) {
  return corsair.manage.connectionStatus.get({ tenantId });
}

export function isPluginConnected(
  status: IntegrationStatusView | undefined,
): boolean {
  return status?.isAuthenticated === true;
}

async function clearPluginCredentials(
  tenantId: string,
  pluginId: IntegrationPluginId,
) {
  const tenant = corsair.withTenant(tenantId);

  if (pluginId === "gmail") {
    await tenant.gmail.keys.set_access_token(null);
    await tenant.gmail.keys.set_refresh_token(null);
  } else if (pluginId === "googlecalendar") {
    await tenant.googlecalendar.keys.set_access_token(null);
    await tenant.googlecalendar.keys.set_refresh_token(null);
  } else if (pluginId === "github") {
    await tenant.github.keys.set_api_key(null);
  }
}

async function purgeAccountData(tenantId: string, pluginId: IntegrationPluginId) {
  const integration = await db.query.corsairIntegrations.findFirst({
    where: eq(corsairIntegrations.name, pluginId),
  });

  if (!integration) return;

  const account = await db.query.corsairAccounts.findFirst({
    where: and(
      eq(corsairAccounts.tenantId, tenantId),
      eq(corsairAccounts.integrationId, integration.id),
    ),
  });

  if (!account) return;

  await db
    .delete(corsairEvents)
    .where(eq(corsairEvents.accountId, account.id));

  await db
    .delete(corsairEntities)
    .where(eq(corsairEntities.accountId, account.id));
}

export async function disconnectIntegration(
  tenantId: string,
  pluginId: IntegrationPluginId,
) {
  const statuses = await getTenantIntegrationStatuses(tenantId);
  const current = statuses[pluginId];

  if (!current.canDisconnect) {
    return {
      ok: true as const,
      alreadyDisconnected: true as const,
      message: `${pluginId} is not connected`,
    };
  }

  await clearPluginCredentials(tenantId, pluginId);
  await purgeAccountData(tenantId, pluginId);

  return { ok: true as const, message: `${pluginId} disconnected` };
}

export function getOAuthRedirectUri() {
  return getCorsairOAuthRedirectUri();
}

export function isOAuthPlugin(
  pluginId: IntegrationPluginId,
): pluginId is (typeof OAUTH_PLUGINS)[number] {
  return OAUTH_PLUGINS.includes(pluginId as (typeof OAUTH_PLUGINS)[number]);
}
