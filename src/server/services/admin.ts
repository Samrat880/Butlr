import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { userProfiles, users } from "~/server/db/schema";

export async function upgradeUserToPersonal(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { ok: false as const, message: `No user found for ${email}` };
  }

  await db
    .insert(userProfiles)
    .values({
      userId: user.id,
      tenantId: user.id,
      tier: "personal",
      billingInterval: "monthly",
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        tier: "personal",
        billingInterval: "monthly",
        updatedAt: new Date(),
      },
    });

  return { ok: true as const, userId: user.id, tier: "personal" as const };
}
