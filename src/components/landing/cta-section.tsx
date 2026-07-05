import Link from "next/link";

import { Button } from "~/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="relative mx-auto mb-8 flex size-20 items-center justify-center">
          <span className="absolute inset-0 animate-radar rounded-full border border-[#4aa8ff]/20" />
          <span className="font-display text-2xl text-[#d4af37]">◆</span>
        </div>
        <h2 className="font-display text-3xl text-[#f5f5f5] md:text-5xl">
          READY TO COMMAND YOUR DIGITAL WORLD?
        </h2>
        <p className="mt-4 text-[#9ca3af]">
          The signal is lit. Enter the Batcave.
        </p>
        <Link href="/get-started" className="mt-10 inline-block">
          <Button
            size="lg"
            className="h-12 bg-[#f5f5f5] px-10 text-[#050608] hover:bg-white"
          >
            ENTER THE BATCAVE
          </Button>
        </Link>
      </div>
    </section>
  );
}
