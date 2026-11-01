import type { LeadRecord } from "@/lib/types";

type StatusBadgeProps = {
  status: LeadRecord["status"];
};

const labels: Record<LeadRecord["status"], string> = {
  queued: "Queued",
  researching: "Researching",
  scoring: "Scoring",
  done: "Done",
  failed: "Failed",
};

const styles: Record<LeadRecord["status"], string> = {
  queued: "text-muted",
  researching: "text-accent",
  scoring: "text-warning",
  done: "text-success",
  failed: "text-danger",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
