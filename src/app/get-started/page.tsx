import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Mail, Shield } from "lucide-react";

import { GoogleSignInButton } from "~/components/auth/google-sign-in-button";
import { ButlrBackground } from "~/components/butlr/background";
import { GlassPanel } from "~/components/butlr/glass-panel";
import { auth } from "~/server/auth";

type GetStartedPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function GetStartedPage({
  searchParams,
}: GetStartedPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl ?? "/batcave/chat";

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <ButlrBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--butlr-blue)]/25 to-[var(--butlr-purple)]/15 text-sm font-semibold text-[var(--butlr-blue)] ring-1 ring-white/10">
              B
            </span>
            <span className="text-lg font-semibold">Butlr</span>
          </Link>

          <h1 className="mt-10 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Sign in with Google to open your workspace
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-[var(--butlr-muted)]">
            One click connects Gmail and Google Calendar. Butlr stays inside
            your accounts with OAuth. We never see your password.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                icon: Mail,
                title: "Gmail in chat",
                body: "Search, draft, and send from natural language.",
              },
              {
                icon: Calendar,
                title: "Calendar + Meet",
                body: "Schedule, reschedule, and add Meet links in one ask.",
              },
              {
                icon: Shield,
                title: "Encrypted tokens",
                body: "Credentials stored securely. Disconnect anytime.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08]">
                  <item.icon className="size-4 text-[var(--butlr-blue)]" />
                </span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-[var(--butlr-muted)]">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <GlassPanel className="mx-auto w-full max-w-md p-8 md:p-10">
          <p className="text-sm font-medium text-[var(--butlr-blue)]">
            Google account required
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Continue to Butlr
          </h2>
          <p className="mt-2 text-sm text-[var(--butlr-muted)]">
            Use the Google account that owns the inbox and calendar you want
            Butlr to manage.
          </p>

          <div className="mt-8">
            <GoogleSignInButton variant="full" callbackUrl={redirectTo} />
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-[var(--butlr-muted)]">
            By continuing you agree to our terms and privacy policy.
          </p>

          <Link
            href="/"
            className="mt-6 block text-center text-sm text-[var(--butlr-blue)] transition-opacity hover:opacity-80"
          >
            Back to home
          </Link>
        </GlassPanel>
      </div>
    </div>
  );
}
