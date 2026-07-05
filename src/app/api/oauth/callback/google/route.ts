import { NextResponse } from "next/server";
import { processOAuthCallback } from "corsair/oauth";

import { getCorsairOAuthRedirectUri } from "~/lib/google-oauth-callback";
import { getAppUrl } from "~/lib/app-url";
import { corsair } from "~/server/corsair";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/batcave/integrations?error=missing_oauth_params",
        getAppUrl(),
      ),
    );
  }

  try {
    await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: getCorsairOAuthRedirectUri(),
    });
    return NextResponse.redirect(
      new URL("/batcave/integrations?connected=true", getAppUrl()),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "oauth_callback_failed";
    return NextResponse.redirect(
      new URL(
        `/batcave/integrations?error=${encodeURIComponent(message)}`,
        getAppUrl(),
      ),
    );
  }
}
