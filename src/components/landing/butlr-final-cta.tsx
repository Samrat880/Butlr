import Link from "next/link";

import { GoogleSignInButton } from "~/components/auth/google-sign-in-button";
import { FadeIn } from "~/components/butlr/fade-in";
import { auth } from "~/server/auth";

export async function ButlrFinalCta() {
  const session = await auth();

  return (
    <section className="px-6 py-28 md:py-36">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <h2 className="butlr-headline-lg">Ready to leave the inbox behind?</h2>
        <p className="butlr-subhead mx-auto mt-4 max-w-lg">
          Connect Google once. Manage email and calendar from a single
          workspace.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          {session?.user ? (
            <Link href="/batcave/chat" className="butlr-btn-primary">
              Open workspace
            </Link>
          ) : (
            <GoogleSignInButton variant="hero" label="Continue with Google" />
          )}
          <a href="#pricing" className="butlr-link text-base">
            View pricing →
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
