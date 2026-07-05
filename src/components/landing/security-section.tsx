const ITEMS = [
  "OAuth 2.0",
  "End-to-end encryption",
  "Zero trust architecture",
  "Private memory vault",
  "Role-based access",
  "Tenant isolation",
];

export function SecuritySection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="batcore-glass relative overflow-hidden rounded-2xl p-10 md:p-16">
          <div className="pointer-events-none absolute right-0 top-0 size-64 rounded-full bg-[#c1121f]/10 blur-3xl" />
          <p className="font-mono-ui text-[10px] tracking-[0.35em] text-[#c1121f] uppercase">
            Security Vault
          </p>
          <h2 className="mt-4 font-display text-3xl text-[#f5f5f5] md:text-4xl">
            Military-grade protection
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/30 px-4 py-3"
              >
                <span className="size-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-sm text-[#f5f5f5]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
