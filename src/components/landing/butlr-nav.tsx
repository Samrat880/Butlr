"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import {
  MobileSheetNav,
  type MobileSheetNavItem,
} from "~/components/butlr/MobileSheetNav";
import { LANDING_MOBILE_NAV } from "~/lib/workspace-nav";
import { cn } from "~/lib/utils";

type ButlrNavProps = {
  authActions: ReactNode;
};

export function ButlrNav({ authActions }: ButlrNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sheetItems = useMemo<MobileSheetNavItem[]>(
    () =>
      LANDING_MOBILE_NAV.map((item) => ({
        type: "link" as const,
        label: item.label,
        href: item.href,
      })),
    [],
  );

  useEffect(() => {
    const sentinel = document.getElementById("nav-scroll-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setScrolled(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (media.matches) setMenuOpen(false);
    };

    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  const openMobileMenu = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setMenuOpen(true);
    }
  };

  return (
    <>
      <div aria-hidden className="h-16" />
      <header
        className={cn(
          "butlr-glass-nav-shell",
          scrolled && "butlr-glass-nav-shell-scrolled",
        )}
      >
        <div
          className={cn(
            "butlr-glass-nav-bar",
            scrolled
              ? "butlr-glass-nav-bar-floating"
              : "butlr-glass-nav-bar-top",
          )}
        >
          <Link
            href="/"
            className="shrink-0 text-base font-semibold tracking-tight text-[var(--butlr-text)] lg:text-lg"
          >
            Butlr
          </Link>

          <nav
            className={cn(
              "hidden min-w-0 flex-1 items-center justify-center gap-6 text-sm text-[var(--butlr-muted)] lg:flex xl:gap-8",
            )}
          >
            {LANDING_MOBILE_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors duration-200 hover:text-[var(--butlr-text)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2">
            {authActions}
            <div className="lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={openMobileMenu}
                className="butlr-btn-ghost inline-flex size-9 items-center justify-center p-0"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileSheetNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={sheetItems}
        title="Menu"
      />
    </>
  );
}
