import Link from "next/link";

export function ButlrFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[var(--butlr-bg)] px-6 py-12 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:justify-between">
        <div>
          <Link href="/" className="text-base font-semibold tracking-tight">
            Butlr
          </Link>
          <p className="mt-2 max-w-xs text-sm text-[var(--butlr-muted)]">
            AI executive assistant for Gmail and Google Calendar.
          </p>
        </div>
        <div className="flex flex-wrap gap-12 text-sm text-[var(--butlr-muted)]">
          <div className="space-y-2">
            <p className="font-medium text-[var(--butlr-text)]">Product</p>
            <a href="#features" className="block hover:text-[var(--butlr-text)]">
              Features
            </a>
            <a href="#pricing" className="block hover:text-[var(--butlr-text)]">
              Pricing
            </a>
            <a href="#faq" className="block hover:text-[var(--butlr-text)]">
              FAQ
            </a>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-[var(--butlr-text)]">Legal</p>
            <span className="block">Privacy</span>
            <span className="block">Terms</span>
            <span className="block">Contact</span>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-[var(--butlr-muted)]">
        Copyright © {new Date().getFullYear()} Butlr. All rights reserved.
      </p>
    </footer>
  );
}
