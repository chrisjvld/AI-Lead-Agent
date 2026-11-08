"use client";

import { motion } from "motion/react";

import type { LeadRecord } from "@/lib/types";

type ScorePillProps = {
  score: number | null;
  tier: LeadRecord["tier"];
  size?: "default" | "large";
};

export const tierTone: Record<NonNullable<LeadRecord["tier"]>, string> = {
  Hot: "text-success bg-[color-mix(in_srgb,var(--success)_12%,transparent)]",
  Warm: "text-warning bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]",
  Cold: "text-fg-2 bg-fill-2",
};

export const tierDot: Record<NonNullable<LeadRecord["tier"]>, string> = {
  Hot: "bg-success",
  Warm: "bg-warning",
  Cold: "bg-fg-3",
};

/** Score + fit tier in one soft-tinted pill. Arrives with a small spring. */
export function ScorePill({ score, tier, size = "default" }: ScorePillProps) {
  if (score === null || tier === null) {
    return (
      <span className="tabular inline-block w-12 text-center text-fg-3" aria-label="No score yet">
        –
      </span>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`tabular inline-flex items-center gap-1.5 rounded-full font-medium ${tierTone[tier]} ${
        size === "large" ? "h-7 px-3 text-[0.875rem]" : "h-6 px-2.5 text-[0.8125rem]"
      }`}
      aria-label={`Score ${score}, ${tier} fit`}
    >
      <span className="font-semibold">{score}</span>
      <span className="opacity-80">{tier}</span>
    </motion.span>
  );
}
