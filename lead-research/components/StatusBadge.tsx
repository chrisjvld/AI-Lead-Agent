import { Check, CircleAlert } from "lucide-react";

import type { LeadRecord } from "@/lib/types";

type StatusBadgeProps = {
  status: LeadRecord["status"];
  approved?: boolean;
};

/** Terminal states as small soft-tinted pills. Running states use PipelineProgress. */
export function StatusBadge({ status, approved = false }: StatusBadgeProps) {
  if (status === "failed") {
    return (
      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-2.5 text-[0.8125rem] font-medium text-danger">
        <CircleAlert className="size-3.5" strokeWidth={2} aria-hidden="true" />
        Site didn’t load
      </span>
    );
  }

  if (approved) {
    return (
      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-accent-soft px-2.5 text-[0.8125rem] font-medium text-accent">
        <Check className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
        Approved
      </span>
    );
  }

  if (status === "done") {
    return (
      <span className="inline-flex h-6 items-center gap-1.5 text-[0.8125rem] text-fg-2">
        <span className="size-1.5 rounded-full bg-fg-3" aria-hidden="true" />
        Ready to review
      </span>
    );
  }

  return (
    <span className="inline-flex h-6 items-center rounded-full px-2.5 text-[0.8125rem] text-fg-3">
      Queued
    </span>
  );
}
