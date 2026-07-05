import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { TerminalDemo } from "~/components/landing/terminal-demo";
import { auth } from "~/server/auth";

export async function HeroSection() {
  const session = await auth();
  const ctaHref = session?.user ? "/batcave" : "/get-started";

  return (
    <section
      id="product"
      className="relative overflow-hidden px-6 pb-24 pt-16 md:pb-32 md:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 batcore-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 batcore-fog" />
      <div className="pointer-events-none absolute inset-0 batcore-noise opacity-30" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div className="animate-fade-up">
          <Badge className="mb-6 border-[#4aa8ff]/30 bg-[#4aa8ff]/10 font-mono-ui text-[10px] tracking-[0.3em] text-[#4aa8ff] uppercase">
            Batcomputer Online
          </Badge>

          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-[#f5f5f5] md:text-6xl lg:text-7xl">
            YOUR DIGITAL
            <br />
            COMMAND CENTER
            <br />
            <span className="text-[#4aa8ff]">RUNS ON CONVERSATION</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#9ca3af]">
            Manage Gmail, GitHub, Google Calendar, and every productivity tool
            through one intelligent conversation. No tabs. No chaos. Pure command.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href={ctaHref}>
              <Button
                size="lg"
                className="h-12 bg-[#f5f5f5] px-8 text-[#050608] hover:bg-white"
              >
                {session?.user ? "Open Command Center" : "Enter Batcave"}
              </Button>
            </Link>
            <a href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/10 bg-transparent px-8 text-[#f5f5f5] hover:bg-white/5"
              >
                Watch Demo
              </Button>
            </a>
          </div>

          <p className="mt-6 font-mono-ui text-xs text-[#9ca3af]">
            {session?.user
              ? `COMMANDER: ${session.user.email}`
              : "SECURE OAUTH · ENCRYPTED VAULT · ZERO TRUST"}
          </p>
        </div>

        <div className="animate-fade-up relative lg:pl-8" style={{ animationDelay: "0.15s" }}>
          <div className="absolute -inset-4 rounded-2xl bg-[#4aa8ff]/5 blur-3xl" />
          <TerminalDemo />
        </div>
      </div>
    </section>
  );
}
