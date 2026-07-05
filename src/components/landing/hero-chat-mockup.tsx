"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const STEPS = [
  "Searching contacts",
  "Checking availability",
  "Creating calendar event",
  "Drafting email",
  "Sending confirmation",
];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function HeroChatMockup() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "thinking" | "steps" | "done">(
    "idle",
  );
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("thinking"), 1200);
    const t2 = setTimeout(() => setPhase("steps"), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase !== "steps") return;
    if (visibleSteps >= STEPS.length) {
      const t = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleSteps((n) => n + 1), 700);
    return () => clearTimeout(t);
  }, [phase, visibleSteps]);

  return (
    <div className="relative overflow-hidden bg-[var(--butlr-surface)] p-6 md:p-10">
      <div className="mb-4 flex items-center gap-2 border-b border-white/[0.06] pb-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-[var(--butlr-blue)]/15">
          <Sparkles className="size-4 text-[var(--butlr-blue)]" />
        </div>
        <span className="text-sm font-medium">Butlr</span>
        <span className="ml-auto text-xs text-[var(--butlr-muted)]">Live</span>
      </div>

      <div className="space-y-4">
        <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-[var(--butlr-blue)] px-4 py-3 text-sm text-white">
          Schedule a meeting with Alex next Thursday at 10 AM and send a
          confirmation email.
        </div>

        <AnimatePresence mode="wait">
          {phase === "thinking" ? (
            <motion.div
              key="thinking"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="flex items-center gap-2 text-sm text-[var(--butlr-muted)]"
            >
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-[var(--butlr-blue)]"
                    animate={
                      reduceMotion
                        ? { opacity: 1 }
                        : { opacity: [0.3, 1, 0.3] }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }
                    }
                  />
                ))}
              </span>
              Butlr is working...
            </motion.div>
          ) : null}

          {phase === "steps" || phase === "done" ? (
            <motion.div
              key="steps"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, transform: "translateY(8px)" }
              }
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="space-y-2 rounded-2xl border border-white/[0.08] bg-black/30 p-4"
            >
              {STEPS.slice(0, visibleSteps).map((step, i) => (
                <motion.div
                  key={step}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, transform: "translateX(-8px)" }
                  }
                  animate={{ opacity: 1, transform: "translateX(0px)" }}
                  transition={{ duration: 0.2, delay: i * 0.05, ease: EASE_OUT }}
                  className="flex items-center gap-2 text-sm text-[var(--butlr-muted)]"
                >
                  <Check className="size-4 text-[var(--butlr-emerald)]" />
                  {step}
                </motion.div>
              ))}
            </motion.div>
          ) : null}

          {phase === "done" ? (
            <motion.div
              key="done"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, transform: "scale(0.97)" }
              }
              animate={{ opacity: 1, transform: "scale(1)" }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="rounded-2xl border border-[var(--butlr-emerald)]/25 bg-[var(--butlr-emerald)]/10 p-4"
            >
              <p className="text-sm font-medium text-[var(--butlr-emerald)]">
                Meeting scheduled successfully
              </p>
              <p className="mt-1 text-xs text-[var(--butlr-muted)]">
                Thu 10:00 AM · Confirmation sent to Alex
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
