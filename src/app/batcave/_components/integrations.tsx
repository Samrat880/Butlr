"use client";

import { useEffect, useState } from "react";
import { Calendar, GitBranch, Mail } from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

const PLUGIN_META: Record<
  string,
  { label: string; description: string; icon: typeof Mail }
> = {
  gmail: {
    label: "Gmail",
    description: "Sync inbox threads and surface priority messages.",
    icon: Mail,
  },
  googlecalendar: {
    label: "Google Calendar",
    description: "Pull today's meetings and Google Meet links.",
    icon: Calendar,
  },
  github: {
    label: "GitHub",
    description: "Track repository activity from your workday.",
    icon: GitBranch,
  },
};

function statusBadge(status: {
  isAuthenticated: boolean;
  connectionEstablished: boolean;
  statusLabel: string;
}) {
  const base =
    "rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize";
  if (status.isAuthenticated) {
    return (
      <span
        className={cn(
          base,
          "border-[var(--butlr-emerald)]/25 bg-[var(--butlr-emerald)]/10 text-[var(--butlr-emerald)]",
        )}
      >
        {status.statusLabel}
      </span>
    );
  }
  if (status.connectionEstablished) {
    return (
      <span
        className={cn(
          base,
          "border-[var(--butlr-amber)]/25 bg-[var(--butlr-amber)]/10 text-[var(--butlr-amber)]",
        )}
      >
        {status.statusLabel}
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        "border-white/[0.1] bg-white/[0.04] text-[var(--butlr-muted)]",
      )}
    >
      {status.statusLabel}
    </span>
  );
}

export function BatcaveIntegrations() {
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const utils = api.useUtils();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      setBanner({
        type: "success",
        message: "Integration authenticated and linked to Butlr.",
      });
      void utils.integrations.connectionStatus.invalidate();
    }
    const error = params.get("error");
    if (error) {
      setBanner({ type: "error", message: decodeURIComponent(error) });
    }
  }, [utils.integrations.connectionStatus]);

  const status = api.integrations.connectionStatus.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const connect = api.integrations.getConnectUrl.useMutation({
    onSuccess: (data) => {
      window.location.assign(data.url);
    },
    onError: (error) => {
      setBanner({ type: "error", message: error.message });
    },
  });

  const disconnect = api.integrations.disconnect.useMutation({
    onSuccess: async (data) => {
      setBanner({ type: "success", message: data.message });
      await utils.integrations.connectionStatus.invalidate();
      await utils.integrations.connectionStatus.refetch();
    },
    onError: (error) => {
      setBanner({ type: "error", message: error.message });
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-2 text-[var(--butlr-muted)]">
          Connect Gmail and Calendar so Butlr can work on your behalf.
        </p>
      </header>

      {banner ? (
        <div
          className={cn(
            "mb-6 rounded-2xl border px-4 py-3 text-sm",
            banner.type === "success"
              ? "border-[var(--butlr-emerald)]/25 bg-[var(--butlr-emerald)]/10"
              : "border-[var(--butlr-rose)]/25 bg-[var(--butlr-rose)]/10",
          )}
        >
          {banner.message}
        </div>
      ) : null}

      <div className="grid gap-4">
        {status.isLoading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="butlr-glass flex items-center gap-4 p-5">
                <div className="size-12 animate-pulse rounded-2xl bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-white/[0.06]" />
                  <div className="h-3 w-64 animate-pulse rounded-full bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </>
        ) : status.isError ? (
          <div className="butlr-glass flex flex-col gap-3 p-5">
            <p className="text-sm text-[var(--butlr-rose)]">
              Couldn't load integrations
              {status.error.message ? `: ${status.error.message}` : "."}
            </p>
            <button
              type="button"
              className="butlr-btn-primary w-fit text-sm"
              onClick={() => void status.refetch()}
            >
              Try again
            </button>
          </div>
        ) : (
          Object.entries(status.data ?? {}).map(([pluginId, integration]) => {
            const meta = PLUGIN_META[pluginId] ?? {
              label: pluginId,
              description: "Integration",
              icon: Mail,
            };
            const isBusy =
              (connect.isPending && connect.variables?.pluginId === pluginId) ||
              (disconnect.isPending &&
                disconnect.variables?.pluginId === pluginId);

            return (
              <div
                key={pluginId}
                className="butlr-glass flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04]">
                    <meta.icon className="size-5 text-[var(--butlr-blue)]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{meta.label}</h2>
                      {statusBadge(integration)}
                    </div>
                    <p className="mt-1 text-sm text-[var(--butlr-muted)]">
                      {meta.description}
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--butlr-muted)]">
                      {integration.statusDetail}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {integration.canDisconnect ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      className="rounded-full border border-[var(--butlr-rose)]/30 px-5 py-2 text-sm font-medium text-[var(--butlr-rose)] transition-[background-color,transform] duration-150 hover:bg-[var(--butlr-rose)]/10 active:scale-[0.97] disabled:opacity-50"
                      onClick={() =>
                        disconnect.mutate({
                          pluginId: pluginId as
                            | "gmail"
                            | "googlecalendar"
                            | "github",
                        })
                      }
                    >
                      {disconnect.isPending &&
                      disconnect.variables?.pluginId === pluginId
                        ? "Disconnecting..."
                        : "Disconnect"}
                    </button>
                  ) : null}
                  {integration.canConnect ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      className="butlr-btn-primary text-sm disabled:opacity-50"
                      onClick={() =>
                        connect.mutate({
                          pluginId: pluginId as
                            | "gmail"
                            | "googlecalendar"
                            | "github",
                        })
                      }
                    >
                      {connect.isPending &&
                      connect.variables?.pluginId === pluginId
                        ? "Authenticating..."
                        : "Connect"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
