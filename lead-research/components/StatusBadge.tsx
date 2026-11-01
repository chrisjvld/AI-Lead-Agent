import type { LeadRecord } from "@/lib/types";

type StatusBadgeProps = {
  status: LeadRecord["status"];
};

const labels: Record<LeadRecord["status"], string> = {
  queued: "Queued",
  researching: "Researching…",
  scoring: "Scoring…",
  done: "Done",
  failed: "Site didn’t load",
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
    <span className={`text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
