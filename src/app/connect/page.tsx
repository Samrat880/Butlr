import Link from "next/link";
import { resolveConnectLink } from "corsair";

import { GlassPanel } from "~/components/butlr/glass-panel";
import { ButlrBackground } from "~/components/butlr/background";
import { corsair } from "~/server/corsair";

type ConnectPageProps = {
  searchParams: Promise<{ state?: string }>;
};

export default async function ConnectPage({ searchParams }: ConnectPageProps) {
  const { state } = await searchParams;

  if (!state) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-6">
        <ButlrBackground />
        <GlassPanel className="relative z-10 max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold">Invalid connect link</h1>
          <p className="mt-3 text-[var(--butlr-muted)]">
            This page needs a valid state parameter from Corsair.
          </p>
          <Link
            href="/batcave/integrations"
            className="mt-6 inline-block text-sm text-[var(--butlr-blue)] hover:underline"
          >
            Back to integrations
          </Link>
        </GlassPanel>
      </main>
    );
  }

  const { providerName, oauthUrl } = await resolveConnectLink(corsair, state);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <ButlrBackground />
      <GlassPanel className="relative z-10 max-w-lg p-8">
        <p className="text-sm font-medium text-[var(--butlr-blue)]">
          Connect integration
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Connect {providerName}</h1>
        <p className="mt-3 text-[var(--butlr-muted)]">
          Authorize access so Butlr can manage your email and calendar.
        </p>
        <a href={oauthUrl} className="butlr-btn-primary mt-8 block text-center">
          Continue to {providerName}
        </a>
        <Link
          href="/batcave/integrations"
          className="mt-4 block text-center text-sm text-[var(--butlr-muted)] hover:text-[var(--butlr-text)]"
        >
          Cancel
        </Link>
      </GlassPanel>
    </main>
  );
}
