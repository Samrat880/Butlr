"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "~/lib/utils";

type Command = {
  id: string;
  label: string;
  keywords: string;
  run: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: "new-chat",
        label: "New Chat",
        keywords: "new chat message",
        run: () => router.push("/batcave/chat"),
      },
      {
        id: "briefing",
        label: "Open Briefing",
        keywords: "briefing dashboard daily",
        run: () => router.push("/batcave"),
      },
      {
        id: "calendar",
        label: "Open Calendar",
        keywords: "calendar schedule meetings",
        run: () => router.push("/batcave/chat"),
      },
      {
        id: "integrations",
        label: "Open Integrations",
        keywords: "integrations gmail connect",
        run: () => router.push("/batcave/integrations"),
      },
      {
        id: "billing",
        label: "Open Billing",
        keywords: "billing plan upgrade",
        run: () => router.push("/batcave/billing"),
      },
      {
        id: "sign-out",
        label: "Sign Out",
        keywords: "sign out logout exit",
        run: () => void signOut({ callbackUrl: "/" }),
      },
    ],
    [router],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords.toLowerCase().includes(q),
    );
  }, [commands, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setOpenedViaKeyboard(false);
  }, []);

  const openPalette = useCallback((viaKeyboard: boolean) => {
    setOpenedViaKeyboard(viaKeyboard);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else openPalette(true);
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open, openPalette]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  const instant = openedViaKeyboard;

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close command palette"
        className={cn(
          "absolute inset-0 bg-[var(--butlr-black)]/50",
          instant ? "opacity-100" : "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150",
        )}
        onClick={close}
      />
      <div
        className={cn(
          "butlr-glass absolute left-1/2 top-[12dvh] w-[min(100%-2rem,32rem)] -translate-x-1/2 overflow-hidden rounded-[24px]",
          instant
            ? "opacity-100"
            : "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-150",
        )}
      >
        <div className="border-b border-white/[0.08] p-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands..."
            className="butlr-palette-input w-full px-3 py-2.5 text-sm text-[var(--butlr-text)] placeholder:text-[var(--butlr-muted)]"
            aria-label="Filter commands"
          />
        </div>
        <ul className="max-h-[50dvh] overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-[var(--butlr-muted)]">
              No commands found
            </li>
          ) : (
            filtered.map((cmd) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  className="butlr-palette-item w-full px-4 py-3 text-left text-sm text-[var(--butlr-text)]"
                  onClick={() => {
                    cmd.run();
                    close();
                  }}
                >
                  {cmd.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
