import type { LeadRecord } from "@/lib/types";

type ScorePillProps = {
  score: number | null;
  tier: LeadRecord["tier"];
};

const tierStyles: Record<NonNullable<LeadRecord["tier"]>, string> = {
  Hot: "text-success",
  Warm: "text-warning",
  Cold: "text-muted",
};

export function ScorePill({ score, tier }: ScorePillProps) {
  if (score === null || tier === null) {
    return <span className="text-sm text-muted">—</span>;
  }

  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold ${tierStyles[tier]}`}
      title={`${tier} lead`}
    >
      {score} · {tier}
    </span>
  );
}
