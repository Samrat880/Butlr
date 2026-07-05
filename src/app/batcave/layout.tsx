import { redirect } from "next/navigation";

import { WorkspaceChrome } from "~/components/butlr/WorkspaceChrome";
import { WorkspaceSidebar } from "~/components/butlr/WorkspaceSidebar";
import { ButlrBackground } from "~/components/butlr/background";
import { auth } from "~/server/auth";
import { getOrCreateProfile } from "~/server/services/usage";
import { TIERS } from "~/lib/billing/tiers";
import { cn } from "~/lib/utils";

export default async function BatcaveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/get-started");

  const profile = await getOrCreateProfile(session.user.id);
  const tier = TIERS[profile.tier as keyof typeof TIERS] ?? TIERS.free;

  return (
    <div className="relative flex min-h-screen">
      <ButlrBackground />

      <aside className="relative z-20 m-4 hidden w-[18%] min-w-[220px] max-w-[280px] shrink-0 flex-col lg:flex">
        <WorkspaceSidebar
          tierName={tier.name}
          userEmail={session.user.email}
        />
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <WorkspaceChrome />
        <main className={cn("flex-1 overflow-auto")}>{children}</main>
      </div>
    </div>
  );
}
