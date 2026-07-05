const CAPABILITIES = [
  {
    title: "EMAIL",
    items: ["Read", "Write", "Reply", "Archive"],
  },
  {
    title: "CALENDAR",
    items: ["Meetings", "Availability", "Scheduling", "Google Meet"],
  },
  {
    title: "GITHUB",
    items: ["Issues", "Pull Requests", "Reviews", "Repos"],
  },
  {
    title: "WORKFLOWS",
    items: ["Automation", "Memory", "Agents", "Briefings"],
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono-ui text-[10px] tracking-[0.35em] text-[#d4af37] uppercase">
          AI Capabilities
        </p>
        <h2 className="mt-4 font-display text-3xl text-[#f5f5f5] md:text-5xl">
          One conversation. Every action.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => (
            <article
              key={cap.title}
              className="batcore-glass rounded-xl p-6 transition hover:batcore-glow-gold"
            >
              <h3 className="font-mono-ui text-xs tracking-[0.3em] text-[#d4af37]">
                {cap.title}
              </h3>
              <ul className="mt-6 space-y-3">
                {cap.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-[#f5f5f5]"
                  >
                    <span className="text-[#4aa8ff]">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
