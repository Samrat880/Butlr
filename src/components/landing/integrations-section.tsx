const INTEGRATIONS = [
  { name: "Gmail", status: "ONLINE" },
  { name: "GitHub", status: "CONNECTED" },
  { name: "Calendar", status: "SYNCING" },
  { name: "Slack", status: "OFFLINE" },
  { name: "Notion", status: "OFFLINE" },
  { name: "Linear", status: "OFFLINE" },
];

function statusColor(status: string) {
  if (status === "ONLINE" || status === "CONNECTED")
    return "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10";
  if (status === "SYNCING")
    return "text-[#4aa8ff] border-[#4aa8ff]/30 bg-[#4aa8ff]/10";
  return "text-[#9ca3af] border-white/10 bg-white/5";
}

export function IntegrationsSection() {
  return (
    <section id="integrations" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono-ui text-[10px] tracking-[0.35em] text-[#4aa8ff] uppercase">
          Systems Link
        </p>
        <h2 className="mt-4 font-display text-3xl text-[#f5f5f5] md:text-5xl">
          Batcomputer Modules
        </h2>
        <p className="mt-4 max-w-2xl text-[#9ca3af]">
          Every integration is a module in your command center. Connect once.
          Command forever.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="batcore-glass group rounded-xl p-5 transition duration-500 hover:border-[#4aa8ff]/30 hover:batcore-glow"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-[#f5f5f5]">
                  {item.name}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono-ui text-[9px] tracking-wider ${statusColor(item.status)}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-4 h-px bg-gradient-to-r from-[#4aa8ff]/40 to-transparent" />
              <p className="mt-3 font-mono-ui text-xs text-[#9ca3af]">
                Module ready for Alfred routing
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
