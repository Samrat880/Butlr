"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Reading Gmail",
  "Checking Calendar",
  "Reviewing GitHub",
  "Creating Morning Brief",
];

export function TerminalDemo() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const phrase = "Prepare tomorrow.";
    let i = 0;
    const typeTimer = setInterval(() => {
      i += 1;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) clearInterval(typeTimer);
    }, 80);
    return () => clearInterval(typeTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % (STEPS.length + 1));
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="batcore-glass batcore-glow relative overflow-hidden rounded-xl border border-white/[0.1]">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
        <span className="size-2 rounded-full bg-[#c1121f]" />
        <span className="size-2 rounded-full bg-[#facc15]" />
        <span className="size-2 rounded-full bg-[#22c55e]" />
        <span className="ml-2 font-mono-ui text-[10px] tracking-[0.25em] text-[#9ca3af] uppercase">
          Alfred Terminal
        </span>
      </div>
      <div className="batcore-scanline relative space-y-3 p-5 font-mono-ui text-sm">
        <p className="text-[#4aa8ff]">
          <span className="text-[#9ca3af]">commander@batcore</span>
          <span className="text-[#d4af37]"> ~ </span>
          <span className="text-[#f5f5f5]">{typed}</span>
          <span className="animate-blink text-[#4aa8ff]">▌</span>
        </p>
        <div className="space-y-2 border-l border-[#4aa8ff]/30 pl-4">
          {STEPS.map((label, index) => (
            <p
              key={label}
              className={
                index < step
                  ? "text-[#22c55e]"
                  : index === step
                    ? "text-[#4aa8ff] animate-pulse-slow"
                    : "text-[#9ca3af]/40"
              }
            >
              {index < step ? "✓" : index === step ? "›" : "·"} {label}
            </p>
          ))}
        </div>
        {step >= STEPS.length ? (
          <p className="text-[#d4af37]">Morning brief ready.</p>
        ) : null}
      </div>
    </div>
  );
}
