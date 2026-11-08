"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { LeadsProvider } from "@/hooks/useLeads";

/** House spring: critically damped, no overshoot. */
export const spring = { type: "spring", bounce: 0, duration: 0.35 } as const;
/** Reserved for momentum gestures (drag release / flick). */
export const momentumSpring = { type: "spring", bounce: 0.18, duration: 0.4 } as const;

export function Providers({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user": transform animations become instant under
    // prefers-reduced-motion; opacity cross-fades remain.
    <MotionConfig reducedMotion="user" transition={spring}>
      <LeadsProvider>{children}</LeadsProvider>
    </MotionConfig>
  );
}
