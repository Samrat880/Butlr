export function WhySection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-3xl text-[#f5f5f5] md:text-4xl">
          Why BATCORE
        </h2>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="batcore-glass rounded-xl p-8">
            <p className="font-mono-ui text-[10px] tracking-[0.3em] text-[#c1121f] uppercase">
              Traditional Workflow
            </p>
            <ul className="mt-6 space-y-3 text-[#9ca3af]">
              {[
                "Open Gmail",
                "Open Calendar",
                "Open GitHub",
                "Open Slack",
                "Many tabs. Zero focus.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#c1121f]">×</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="batcore-glass batcore-glow rounded-xl border-[#4aa8ff]/20 p-8">
            <p className="font-mono-ui text-[10px] tracking-[0.3em] text-[#4aa8ff] uppercase">
              BATCORE
            </p>
            <ul className="mt-6 space-y-3 text-[#f5f5f5]">
              {[
                "One conversation",
                "One AI commander",
                "Everything connected",
                "Executive briefings",
                "Total control",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#22c55e]">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
