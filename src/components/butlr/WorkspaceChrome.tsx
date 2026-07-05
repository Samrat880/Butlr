"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useMemo, useState } from "react";
import { Menu } from "lucide-react";

import { CommandPalette } from "~/components/butlr/CommandPalette";
import {
  MobileSheetNav,
  type MobileSheetNavItem,
} from "~/components/butlr/MobileSheetNav";
import { WORKSPACE_NAV } from "~/lib/workspace-nav";

export function WorkspaceChrome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const sheetItems = useMemo<MobileSheetNavItem[]>(
    () => [
      ...WORKSPACE_NAV.map((item) => ({
        type: "link" as const,
        label: item.label,
        href: item.href,
      })),
      {
        type: "button" as const,
        label: "Sign Out",
        onClick: () => void signOut({ callbackUrl: "/" }),
      },
    ],
    [],
  );

  const currentLabel =
    WORKSPACE_NAV.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/batcave" && pathname.startsWith(item.href)),
    )?.label ?? "Workspace";

  return (
    <>
      <CommandPalette />
      <header className="butlr-glass-nav flex h-12 items-center justify-between px-4 lg:hidden">
        <Link href="/batcave/chat" className="font-semibold tracking-tight">
          Butlr
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--butlr-muted)]">{currentLabel}</span>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="butlr-btn-ghost inline-flex size-9 items-center justify-center p-0"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      <MobileSheetNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={sheetItems}
        title="Workspace"
      />
    </>
  );
}
