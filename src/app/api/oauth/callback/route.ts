import { NextResponse } from "next/server";

import { getCorsairOAuthRedirectUri } from "~/lib/google-oauth-callback";

/** Legacy callback path — forward to the Corsair Google OAuth callback. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = new URL(getCorsairOAuthRedirectUri());

  url.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  return NextResponse.redirect(target);
}
