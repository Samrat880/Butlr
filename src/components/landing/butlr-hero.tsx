import Link from "next/link";

import { GoogleSignInButton } from "~/components/auth/google-sign-in-button";
import { FadeIn } from "~/components/butlr/fade-in";
import { HeroChatMockup } from "~/components/landing/hero-chat-mockup";
import { auth } from "~/server/auth";

export async function ButlrHero() {
  const session = await auth();

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-20 pt-24 text-center md:pb-28 md:pt-32">
      <FadeIn className="mx-auto max-w-4xl">
        <h1 className="butlr-headline-xl text-[var(--butlr-text)]">
          Email and calendar.
          <br />
          One conversation.
        </h1>

        <p className="butlr-subhead mx-auto mt-5 max-w-xl">
          Sign in with Google, connect your inbox, and let Butlr draft, schedule,
          and summarize without switching tabs.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          {session?.user ? (
            <Link href="/batcave/chat" className="butlr-btn-primary">
              Open workspace
            </Link>
          ) : (
            <GoogleSignInButton variant="hero" />
          )}
          <a href="#showcase" className="butlr-link text-base">
            See how it works →
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={0.12} className="relative mx-auto mt-14 w-full max-w-5xl md:mt-20">
        <div className="butlr-showcase-frame">
          <HeroChatMockup />
        </div>
      </FadeIn>
    </section>
  );
}
