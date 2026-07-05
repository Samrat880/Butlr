import "dotenv/config";
import { github } from "@corsair-dev/github";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { createCorsair } from "corsair";

import { getCorsairOAuthRedirectUri } from "~/lib/google-oauth-callback";
import { getAppUrl } from "~/lib/app-url";
import { conn } from "./db";

const appUrl = getAppUrl();
const googleOAuthRedirectUri = getCorsairOAuthRedirectUri();

export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar(), github()],
  database: conn,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
  connect: {
    baseUrl: `${appUrl}/connect`,
    redirectUri: googleOAuthRedirectUri,
  },
});
