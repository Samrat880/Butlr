"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { cn } from "~/lib/utils";

type LandingProfileMenuProps = {
  image: string;
  name?: string | null;
  email?: string | null;
};

export function LandingProfileMenu({
  image,
  name,
  email,
}: LandingProfileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full ring-2 ring-transparent transition-[transform,box-shadow] duration-150 hover:ring-white/15 active:scale-[0.97]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="size-8 rounded-full border border-white/10 object-cover"
        />
      </button>

      <div
        className={cn(
          "butlr-profile-menu",
          open && "butlr-profile-menu-open",
        )}
      >
        <div className="border-b border-white/[0.08] px-3 py-2.5">
          {name ? (
            <p className="truncate text-sm font-medium text-[var(--butlr-text)]">
              {name}
            </p>
          ) : null}
          {email ? (
            <p className="truncate text-xs text-[var(--butlr-muted)]">
              {email}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--butlr-muted)] transition-colors duration-150 hover:bg-white/[0.06] hover:text-[var(--butlr-text)] active:scale-[0.98]"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}
