import Link from "next/link";

import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";

export async function LandingNav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050608]/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex size-9 items-center justify-center rounded-lg border border-[#4aa8ff]/30 bg-[#161b22]">
            <span className="font-display text-sm font-bold tracking-widest text-[#d4af37]">
              B
            </span>
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[#22c55e] animate-pulse-slow" />
          </span>
          <span className="font-display text-lg font-semibold tracking-[0.2em] text-[#f5f5f5]">
            BATCORE
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs tracking-[0.15em] text-[#9ca3af] uppercase md:flex">
          <a href="#integrations" className="transition hover:text-[#4aa8ff]">
            Integrations
          </a>
          <a href="#capabilities" className="transition hover:text-[#4aa8ff]">
            Capabilities
          </a>
          <a href="#demo" className="transition hover:text-[#4aa8ff]">
            Demo
          </a>
          <a href="#pricing" className="transition hover:text-[#4aa8ff]">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/batcave">
              <Button className="h-9 border border-[#4aa8ff]/40 bg-[#4aa8ff]/10 px-5 text-[#4aa8ff] hover:bg-[#4aa8ff]/20">
                Enter Batcave
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/get-started">
                <Button
                  variant="ghost"
                  className="text-[#9ca3af] hover:bg-white/5 hover:text-[#f5f5f5]"
                >
                  Login
                </Button>
              </Link>
              <Link href="/get-started">
                <Button className="h-9 bg-[#f5f5f5] px-5 text-[#050608] hover:bg-white">
                  Enter Batcave
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
