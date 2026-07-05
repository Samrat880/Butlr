import Link from "next/link";

import { GoogleSignInButton } from "~/components/auth/google-sign-in-button";
import { LandingProfileMenu } from "~/components/landing/landing-profile-menu";
import { auth } from "~/server/auth";

export async function LandingAuthActions() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <LandingProfileMenu
            image={session.user.image}
            name={session.user.name}
            email={session.user.email}
          />
        ) : null}
        <Link
          href="/batcave/chat"
          className="butlr-btn-primary whitespace-nowrap px-5 py-2 text-sm"
        >
          Open workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/get-started"
        className="butlr-btn-ghost hidden text-sm sm:inline-flex"
      >
        Log in
      </Link>
      <GoogleSignInButton variant="nav" />
    </div>
  );
}
