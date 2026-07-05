"use client";

export function ButlrBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--butlr-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(41,151,255,0.14),transparent_55%)]" />
      <div className="butlr-particles absolute inset-0 opacity-30" />
    </div>
  );
}
