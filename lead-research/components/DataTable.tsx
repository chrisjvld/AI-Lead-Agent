import type { KeyboardEvent } from "react";

import { ScorePill } from "@/components/ScorePill";
import { StatusBadge } from "@/components/StatusBadge";
import type { LeadRecord } from "@/lib/types";

type DataTableProps = {
  leads: LeadRecord[];
  onSelect: (lead: LeadRecord) => void;
};

export function DataTable({ leads, onSelect }: DataTableProps) {
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
    <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
      <table className="w-full min-w-3xl border-collapse text-left">
        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Approval</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
              onClick={() => onSelect(lead)}
              onKeyDown={(event) => handleKeyDown(event, lead)}
            >
              <td className="px-4 py-4">
                <p className="font-medium">{lead.company}</p>
                <p className="mt-1 max-w-56 truncate text-xs text-muted">
                  {lead.website}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm">{lead.contactName}</p>
                <p className="mt-1 text-xs text-muted">{lead.title}</p>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-4">
                <ScorePill score={lead.score} tier={lead.tier} />
              </td>
              <td className="px-4 py-4 text-sm">
                {lead.approved ? (
                  <span className="font-medium text-success">Approved</span>
                ) : (
                  <span className="text-muted">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
