import { getAppUrl } from "~/lib/app-url";

/** Auth.js Google sign-in callback (handled by /api/auth/[...nextauth]). */
export function getGoogleOAuthRedirectUri() {
  return `${getAppUrl()}/api/auth/callback/google`;
}

/** Corsair Gmail / Calendar integration OAuth callback. */
export function getCorsairOAuthRedirectUri() {
  return `${getAppUrl()}/api/oauth/callback/google`;
}
