import type { KeyboardEvent, ReactNode } from "react";

import { ScorePill } from "@/components/ScorePill";
import { StatusBadge } from "@/components/StatusBadge";
import type { LeadRecord } from "@/lib/types";

type DataTableProps = {
  emptyContent: ReactNode;
  leads: LeadRecord[];
  onSelect: (lead: LeadRecord) => void;
  selectedId?: number | null;
};

const tierStyles: Record<NonNullable<LeadRecord["tier"]>, string> = {
  Hot: "text-danger",
  Warm: "text-warning",
  Cold: "text-muted",
};

function domain(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}

export function DataTable({
  emptyContent,
  leads,
  onSelect,
  selectedId,
}: DataTableProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    lead: LeadRecord,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(lead);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-[10px]">
        <thead className="border-b border-border text-[9px] text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">Company</th>
            <th className="px-3 py-2 font-medium">Contact</th>
            <th className="px-3 py-2 text-right font-medium">Score</th>
            <th className="px-3 py-2 font-medium">Fit</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 text-center font-medium">Approved</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.length === 0 ? (
            <tr>
              <td colSpan={6}>{emptyContent}</td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr
                key={lead.id}
                role="button"
                tabIndex={0}
                className={`cursor-pointer hover:bg-surface-muted focus:bg-surface-muted focus:outline-none ${
                  selectedId === lead.id ? "bg-surface-muted" : ""
                }`}
                onClick={() => onSelect(lead)}
                onKeyDown={(event) => handleKeyDown(event, lead)}
              >
                <td
                  className={`whitespace-nowrap px-3 py-2 ${
                    selectedId === lead.id
                      ? "border-l-2 border-accent pl-2.5"
                      : ""
                  }`}
                >
                  <span className="font-medium">{lead.company}</span>
                  <span className="ml-2 text-[10px] text-muted">
                    {domain(lead.website)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {lead.contactName}
                </td>
                <td className="px-3 py-2 text-right">
                  <ScorePill score={lead.score} tier={lead.tier} />
                </td>
                <td className="px-3 py-2">
                  {lead.tier ? (
                    <span className={tierStyles[lead.tier]}>{lead.tier}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-3 py-2 text-center">
                  {lead.approved ? (
                    <span className="font-medium text-success">✓</span>
                  ) : (
                    <span className="text-muted"> </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
