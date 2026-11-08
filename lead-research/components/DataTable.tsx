"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import type { KeyboardEvent, ReactNode } from "react";

import { PipelineProgress } from "@/components/PipelineProgress";
import { ScorePill } from "@/components/ScorePill";
import { StatusBadge } from "@/components/StatusBadge";
import { domain, initials, isActive } from "@/lib/format";
import type { LeadRecord } from "@/lib/types";

type DataTableProps = {
  emptyContent: ReactNode;
  leads: LeadRecord[];
  onSelect: (lead: LeadRecord) => void;
  selectedId?: number | null;
  /** Narrower layout while the detail panel is open beside the table. */
  compact?: boolean;
};

const enter = (index: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: {
    type: "spring" as const,
    bounce: 0,
    duration: 0.35,
    delay: Math.min(index, 12) * 0.025,
  },
});

function Monogram({ company, active }: { company: string; active: boolean }) {
  return (
    <span
      className={`relative flex size-8 shrink-0 items-center justify-center rounded-[0.625rem] text-[0.6875rem] font-semibold tracking-wide transition-colors duration-300 ${
        active ? "bg-accent-soft text-accent" : "bg-fill-2 text-fg-2"
      }`}
      aria-hidden="true"
    >
      {initials(company)}
    </span>
  );
}

function StatusCell({ lead }: { lead: LeadRecord }) {
  if (isActive(lead.status) || lead.status === "queued") {
    return <PipelineProgress status={lead.status} />;
  }
  return <StatusBadge status={lead.status} approved={lead.approved} />;
}

export function DataTable({
  emptyContent,
  leads,
  onSelect,
  selectedId,
  compact = false,
}: DataTableProps) {
  const contactCol = compact ? "hidden 2xl:table-cell" : "hidden lg:table-cell";
  function handleKeyDown(event: KeyboardEvent<HTMLElement>, lead: LeadRecord) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(lead);
    }
  }

  if (leads.length === 0) {
    return <div>{emptyContent}</div>;
  }

  return (
    <>
      {/* Desktop / tablet: dense table. */}
      <div className="hidden sm:block">
        <table className="w-full border-collapse text-left text-[0.875rem]">
          <thead>
            <tr className="type-eyebrow border-b border-separator">
              <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">Company</th>
              <th scope="col" className={`${contactCol} px-3 py-2.5 font-medium`}>Contact</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">Score</th>
              <th scope="col" className="w-10 py-2.5 pr-4" aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => {
              const selected = selectedId === lead.id;
              const active = isActive(lead.status);
              return (
                <motion.tr
                  key={lead.id}
                  {...enter(index)}
                  tabIndex={0}
                  aria-selected={selected}
                  aria-label={`${lead.company}, open details`}
                  className={`group focus-ring cursor-pointer border-b border-separator transition-colors duration-150 last:border-b-0 active:bg-fill-2 ${
                    selected ? "bg-accent-soft" : active ? "bg-surface-2" : "hover:bg-fill"
                  }`}
                  onClick={() => onSelect(lead)}
                  onKeyDown={(event) => handleKeyDown(event, lead)}
                >
                  <td className="py-2.5 pr-3 pl-5">
                    <div className="flex min-w-0 items-center gap-3 transition-transform duration-100 group-active:scale-[0.985]">
                      <Monogram company={lead.company} active={active} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lead.company}</p>
                        <p className="truncate text-xs text-fg-2">{domain(lead.website)}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${contactCol} px-3 py-2.5`}>
                    <p className="truncate">{lead.contactName}</p>
                    <p className="truncate text-xs text-fg-2">{lead.title}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusCell lead={lead} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <ScorePill score={lead.score} tier={lead.tier} />
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <ChevronRight
                      className={`ml-auto size-4 transition-[transform,color] duration-200 ${
                        selected ? "translate-x-0.5 text-accent" : "text-fg-3 group-hover:translate-x-0.5"
                      }`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: grouped list rows. */}
      <ul className="sm:hidden" aria-label="Leads">
        {leads.map((lead, index) => {
          const selected = selectedId === lead.id;
          const active = isActive(lead.status);
          return (
            <motion.li key={lead.id} {...enter(index)} className="border-b border-separator last:border-b-0">
              <div
                role="button"
                tabIndex={0}
                aria-label={`${lead.company}, open details`}
                className={`pressable focus-ring flex items-center gap-3 px-4 py-3 active:bg-fill-2 ${
                  selected ? "bg-accent-soft" : ""
                }`}
                onClick={() => onSelect(lead)}
                onKeyDown={(event) => handleKeyDown(event, lead)}
              >
                <Monogram company={lead.company} active={active} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{lead.company}</p>
                    <span className="ml-auto shrink-0">
                      <ScorePill score={lead.score} tier={lead.tier} />
                    </span>
                  </div>
                  <div className="mt-1">
                    {active || lead.status === "queued" ? (
                      <PipelineProgress status={lead.status} />
                    ) : (
                      <p className="truncate text-xs text-fg-2">
                        {lead.contactName} · {lead.status === "failed" ? "Site didn’t load" : lead.approved ? "Approved" : domain(lead.website)}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-fg-3" strokeWidth={2} aria-hidden="true" />
              </div>
            </motion.li>
          );
        })}
      </ul>
    </>
  );
}
