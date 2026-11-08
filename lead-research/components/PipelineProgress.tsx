"use client";

import { AnimatePresence, motion } from "motion/react";

import { activeStep, pipelineSteps, stepIndex } from "@/lib/format";
import type { LeadRecord } from "@/lib/types";

type PipelineProgressProps = {
  status: LeadRecord["status"];
  /** "row" = compact for the table, "detail" = labelled steps for the drawer. */
  variant?: "row" | "detail";
};

/**
 * The live "AI is working" indicator: four segments for
 * research → enrich → score → draft. Finished segments fill, the running one
 * carries a quiet sweep, upcoming ones stay as faint tracks. The caption
 * cross-fades as the stage changes.
 */
export function PipelineProgress({ status, variant = "row" }: PipelineProgressProps) {
  const current = stepIndex(status);
  const step = activeStep(status);
  const caption = status === "queued" ? "Queued" : step ? `${step.active}…` : "Complete";

  if (variant === "detail") {
    return (
      <ol className="grid grid-cols-4 gap-2" aria-label="Research progress">
        {pipelineSteps.map((item, index) => {
          const state = index < current ? "done" : index === current ? "active" : "todo";
          return (
            <li key={item.id} className="min-w-0" aria-current={state === "active" ? "step" : undefined}>
              <Segment state={state} />
              <p
                className={`mt-2 truncate text-xs ${
                  state === "todo" ? "text-fg-3" : state === "active" ? "font-medium text-accent" : "text-fg-2"
                }`}
              >
                {item.label}
              </p>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="flex w-[11.5rem] flex-col gap-1.5" role="status" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {pipelineSteps.map((item, index) => (
          <Segment
            key={item.id}
            state={index < current ? "done" : index === current ? "active" : "todo"}
          />
        ))}
      </div>
      <div className="relative h-4 overflow-hidden text-xs">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={caption}
            className={`absolute inset-0 truncate ${status === "queued" ? "text-fg-3" : "text-fg-2"}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {caption}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Segment({ state }: { state: "done" | "active" | "todo" }) {
  return (
    <span className="relative block h-1 flex-1 overflow-hidden rounded-full bg-fill-2">
      <motion.span
        className="absolute inset-0 origin-left rounded-full bg-accent"
        initial={false}
        animate={{ scaleX: state === "done" ? 1 : 0, opacity: state === "done" ? 1 : 0 }}
      />
      {state === "active" ? (
        <motion.span
          className="absolute inset-0 overflow-hidden rounded-full bg-accent-soft"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="sweep" />
        </motion.span>
      ) : null}
    </span>
  );
}
