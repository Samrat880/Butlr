"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { Badge } from "~/components/ui/badge";
import { WORKSPACE_NAV } from "~/lib/workspace-nav";
import { cn } from "~/lib/utils";

type WorkspaceSidebarProps = {
  tierName: string;
  userEmail: string | null | undefined;
};

export function WorkspaceSidebar({
  tierName,
  userEmail,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/batcave") return pathname === "/batcave";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="butlr-glass flex h-[calc(100vh-2rem)] flex-col p-5">
      <Link href="/batcave/chat" className="text-lg font-semibold tracking-tight">
        Butlr
      </Link>

      <Link
        href="/batcave/chat"
        className="butlr-btn-primary mt-6 block text-center text-sm"
      >
        New Chat
      </Link>

      <div className="mt-8">
        <p className="text-xs font-medium text-[var(--butlr-muted)]">Workspace</p>
        <nav className="mt-3 space-y-1">
          {WORKSPACE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "butlr-sidebar-link flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--butlr-muted)]",
                isActive(item.href) && "butlr-sidebar-link-active font-medium",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/[0.08] pt-4">
        <Badge className="mb-3 border-white/[0.12] bg-[var(--butlr-blue)]/15 text-[var(--butlr-blue)]">
          {tierName}
        </Badge>
        <p className="truncate text-xs text-[var(--butlr-muted)]">{userEmail}</p>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="butlr-btn-ghost mt-3 w-full py-2 text-xs"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
