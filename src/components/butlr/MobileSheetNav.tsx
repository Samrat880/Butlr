"use client";

import Link from "next/link";
import { useEffect } from "react";

import { cn } from "~/lib/utils";

const MOBILE_NAV_QUERY = "(max-width: 1023px)";

function isMobileNavViewport() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_NAV_QUERY).matches;
}

export type MobileSheetNavItem =
  | { type: "link"; label: string; href: string }
  | { type: "button"; label: string; onClick: () => void };

type MobileSheetNavProps = {
  open: boolean;
  onClose: () => void;
  items: MobileSheetNavItem[];
  title?: string;
};

export function MobileSheetNav({
  open,
  onClose,
  items,
  title = "Menu",
}: MobileSheetNavProps) {
  useEffect(() => {
    if (!open) return;

    if (!isMobileNavViewport()) {
      onClose();
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const media = window.matchMedia(MOBILE_NAV_QUERY);
    const syncScrollLock = () => {
      document.body.style.overflow = media.matches ? "hidden" : "";
      if (!media.matches) onClose();
    };

    syncScrollLock();
    media.addEventListener("change", syncScrollLock);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      media.removeEventListener("change", syncScrollLock);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !isMobileNavViewport()) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "butlr-glass butlr-sheet-nav absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col",
          "motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-300",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <span className="text-sm font-medium text-[var(--butlr-text)]">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="butlr-btn-ghost size-8 p-0 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <nav className="overflow-y-auto px-2 py-2">
          {items.map((item) =>
            item.type === "link" ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="butlr-sheet-nav-item block rounded-xl px-4 py-4 text-base text-[var(--butlr-text)]"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className="butlr-sheet-nav-item block w-full rounded-xl px-4 py-4 text-left text-base text-[var(--butlr-text)]"
              >
                {item.label}
              </button>
            ),
          )}
        </nav>
      </div>
    </div>
  );
}
