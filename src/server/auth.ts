import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  userProfiles,
  users,
  verificationTokens,
} from "~/server/db/schema";

import { authConfig } from "./auth.config";

import { getAppUrl } from "~/lib/app-url";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  useSecureCookies: getAppUrl().startsWith("https://"),
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db
        .insert(userProfiles)
        .values({
          userId: user.id,
          tenantId: user.id,
          tier: "free",
        })
        .onConflictDoNothing();
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
