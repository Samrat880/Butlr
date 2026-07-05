import { TerminalDemo } from "~/components/landing/terminal-demo";

export function DemoSection() {
  return (
    <section id="demo" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono-ui text-[10px] tracking-[0.35em] text-[#4aa8ff] uppercase">
          Live Demo
        </p>
        <h2 className="mt-4 font-display text-3xl text-[#f5f5f5] md:text-5xl">
          Command console preview
        </h2>
        <p className="mt-4 max-w-2xl text-[#9ca3af]">
          Type a command. Alfred reads your systems, synthesizes intel, and
          returns a morning brief with tasks, meetings, and action items.
        </p>
        <div className="mt-12 max-w-2xl">
          <TerminalDemo />
        </div>
      </div>
    </section>
  );
}
