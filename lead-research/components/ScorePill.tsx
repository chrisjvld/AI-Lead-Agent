import type { LeadRecord } from "@/lib/types";

type ScorePillProps = {
  score: number | null;
  tier: LeadRecord["tier"];
};

export function ScorePill({ score, tier }: ScorePillProps) {
  if (score === null || tier === null) {
    return <span className="text-sm text-muted">—</span>;
  }

  return (
    <span
      className="text-xs font-medium tabular-nums"
      title={`${tier} lead`}
    >
      {score}
    </span>
  );
}
