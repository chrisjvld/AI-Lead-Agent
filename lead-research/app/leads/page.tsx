"use client";

import { Download, FileUp, Search, Sparkles, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/Button";
import { DataTable } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { useLeads } from "@/hooks/useLeads";
import { activeStep, isActive, sortLeads } from "@/lib/format";
import { LeadRecordSchema, type LeadRecord } from "@/lib/types";

const LeadResponseSchema = z.object({
  lead: LeadRecordSchema,
});

type LeadFilter = "All" | "Hot" | "Warm" | "Cold" | "Failed";
const filters: LeadFilter[] = ["All", "Hot", "Warm", "Cold", "Failed"];

export default function LeadsPage() {
  const { leads: rawLeads, loading, error, isProcessing, refresh, replaceLead } = useLeads();
  const leads = useMemo(() => sortLeads(rawLeads), [rawLeads]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LeadFilter>("All");

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? null;
  const draftMessage = message ?? selectedLead?.message ?? "";

  const stats = useMemo(() => {
    const scored = leads.filter((lead) => lead.score !== null);
    return {
      processed: leads.filter((lead) => lead.status === "done" || lead.status === "failed").length,
      approved: leads.filter((lead) => lead.approved).length,
      average:
        scored.length > 0
          ? Math.round(scored.reduce((total, lead) => total + (lead.score ?? 0), 0) / scored.length)
          : 0,
      counts: {
        All: leads.length,
        Hot: leads.filter((lead) => lead.tier === "Hot").length,
        Warm: leads.filter((lead) => lead.tier === "Warm").length,
        Cold: leads.filter((lead) => lead.tier === "Cold").length,
        Failed: leads.filter((lead) => lead.status === "failed").length,
      } satisfies Record<LeadFilter, number>,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesFilter =
        filter === "All" || (filter === "Failed" ? lead.status === "failed" : lead.tier === filter);
      const matchesSearch =
        !query ||
        lead.company.toLowerCase().includes(query) ||
        lead.contactName.toLowerCase().includes(query) ||
        lead.website.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, leads, search]);

  const activeLead = leads.find((lead) => isActive(lead.status));
  const selectedPosition = selectedLead
    ? Math.max(1, filteredLeads.findIndex((lead) => lead.id === selectedLead.id) + 1)
    : 0;

  const selectLead = useCallback((lead: LeadRecord) => {
    setSelectedId(lead.id);
    setMessage(null);
    setDrawerError(null);
  }, []);

  const closeDrawer = useCallback(() => setSelectedId(null), []);

  const stepLead = useCallback(
    (direction: 1 | -1) => {
      const index = filteredLeads.findIndex((lead) => lead.id === selectedId);
      const next = filteredLeads[index + direction];
      if (next) selectLead(next);
    },
    [filteredLeads, selectedId, selectLead],
  );

  async function updateLead(body: { message?: string; approved?: boolean }) {
    if (!selectedLead) return null;

    setSaving(true);
    setDrawerError(null);

    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const responseBody: unknown = await response.json();

      if (!response.ok) {
        throw new Error("The lead could not be updated.");
      }

      const updated = LeadResponseSchema.parse(responseBody).lead;
      replaceLead(updated);
      setMessage(updated.message ?? "");
      return updated;
    } catch (updateError) {
      setDrawerError(
        updateError instanceof Error ? updateError.message : "The lead could not be updated.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function approveAndSelectNext() {
    if (!selectedLead) return;

    const updated = await updateLead({ message: draftMessage, approved: true });
    if (!updated) return;

    const nextLead = leads.find(
      (lead) => lead.id !== selectedLead.id && lead.status === "done" && !lead.approved,
    );

    if (nextLead) {
      selectLead(nextLead);
    } else {
      setSelectedId(null);
    }
  }

  const progress = leads.length ? stats.processed / leads.length : 0;
  const hasLeads = leads.length > 0;

  return (
    <>
      <div
        className={`transition-[padding] duration-300 ease-out ${
          selectedLead ? "lg:pr-[calc(var(--drawer-width)+0.5rem)]" : ""
        }`}
      >
        <PageContainer>
          <PageHeader
            title="Leads"
            description={
              hasLeads
                ? `${leads.length} prospects researched against your ideal customer profile.`
                : "Research results and drafted outreach for every prospect you import."
            }
            actions={
              hasLeads ? (
                <>
                  <Button href="/upload" variant="secondary" size="small">
                    <FileUp className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    Import
                  </Button>
                  <Button href="/api/leads/export" size="small" disabled={stats.approved === 0}>
                    <Download className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    Export <span className="tabular">{stats.approved}</span> approved
                  </Button>
                </>
              ) : null
            }
          />

          {hasLeads ? (
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Researched"
                value={`${stats.processed}/${leads.length}`}
                helper={isProcessing ? "Queue running" : "Queue complete"}
                accessory={
                  isProcessing ? (
                    <span className="breathe size-2 rounded-full bg-accent" aria-hidden="true" />
                  ) : null
                }
              />
              <StatCard
                label="Strong fit"
                value={stats.counts.Hot}
                helper="Score 70 or higher"
                accessory={<span className="size-2 rounded-full bg-success" aria-hidden="true" />}
              />
              <StatCard label="Average score" value={stats.average || "–"} helper="Across scored leads" />
              <StatCard
                label="Approved"
                value={stats.approved}
                helper={stats.approved ? "Ready to export" : "Review and approve drafts"}
              />
            </div>
          ) : null}

          {/* Live queue banner: the "AI is working" moment. */}
          <AnimatePresence initial={false}>
            {isProcessing ? (
              <motion.div
                key="queue"
                className="mt-3 overflow-hidden rounded-card bg-surface shadow-card"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="status"
                aria-live="polite"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                  <span className="relative flex size-8 items-center justify-center rounded-[0.625rem] bg-accent-soft text-accent">
                    <Sparkles className="size-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.875rem] font-medium">
                      Researching <span className="tabular">{stats.processed + (activeLead ? 1 : 0)}</span> of{" "}
                      <span className="tabular">{leads.length}</span>
                    </p>
                    <div className="relative h-4 overflow-hidden text-xs text-fg-2">
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          key={activeLead ? `${activeLead.id}-${activeLead.status}` : "idle"}
                          className="absolute inset-0 truncate"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                        >
                          {activeLead
                            ? `${activeStep(activeLead.status)?.active ?? "Working"} · ${activeLead.company}`
                            : "Starting the queue…"}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                  <span className="tabular text-[0.8125rem] font-medium text-fg-2">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
                <div className="h-0.5 bg-fill">
                  <motion.div
                    className="h-full origin-left bg-accent"
                    initial={false}
                    animate={{ scaleX: progress }}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {error ? (
            <div
              className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-card bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 text-[0.8125rem] text-danger"
              role="alert"
            >
              <span>{error}</span>
              <Button variant="secondary" size="small" onClick={() => void refresh()}>
                Retry
              </Button>
            </div>
          ) : null}

          <section className={`${hasLeads ? "mt-3" : "mt-6"} overflow-hidden rounded-card bg-surface shadow-card`}>
            {hasLeads ? (
              <div className="flex flex-col gap-2 border-b border-separator px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">
                <div
                  className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]"
                  role="tablist"
                  aria-label="Filter by fit"
                >
                  {filters.map((item) => {
                    const current = filter === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={current}
                        className={`pressable focus-ring relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] ${
                          current ? "font-medium text-fg" : "text-fg-2 hover:text-fg"
                        }`}
                        onClick={() => setFilter(item)}
                      >
                        {current ? (
                          <motion.span
                            layoutId="filter-pill"
                            className="absolute inset-0 rounded-full bg-fill-2"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="relative">{item}</span>
                        <span className="tabular relative text-fg-3">{stats.counts[item]}</span>
                      </button>
                    );
                  })}
                </div>
                <label className="relative sm:ml-auto">
                  <span className="sr-only">Search companies</span>
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fg-3"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="Search"
                    className="focus-ring h-8 w-full rounded-chip bg-fill pr-3 pl-8 text-[0.8125rem] outline-none placeholder:text-fg-3 sm:w-52"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>
            ) : null}

            <DataTable
              leads={loading ? [] : filteredLeads}
              selectedId={selectedId}
              compact={Boolean(selectedLead)}
              onSelect={selectLead}
              emptyContent={
                loading ? (
                  <div className="space-y-3 p-5" role="status" aria-label="Loading leads">
                    {Array.from({ length: 6 }, (_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="skeleton size-8 rounded-[0.625rem]" />
                        <div className="flex-1 space-y-1.5">
                          <div className="skeleton h-3 w-40" />
                          <div className="skeleton h-2.5 w-24" />
                        </div>
                        <div className="skeleton h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : leads.length === 0 && !error ? (
                  <EmptyState
                    icon={<Users className="size-6" strokeWidth={1.75} />}
                    title="No leads yet"
                    description="Import a CSV of prospects and Scout will research, score and draft an opener for each one."
                    action={
                      <>
                        <Button href="/upload">
                          <FileUp className="size-4" strokeWidth={2} aria-hidden="true" />
                          Import CSV
                        </Button>
                        <Button href="/upload?sample=1" variant="plain">
                          Try it with sample data
                        </Button>
                      </>
                    }
                  />
                ) : (
                  <EmptyState
                    title="No matches"
                    description="No leads match this search or filter."
                    action={
                      <Button
                        variant="plain"
                        size="small"
                        onClick={() => {
                          setSearch("");
                          setFilter("All");
                        }}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                )
              }
            />
          </section>
        </PageContainer>
      </div>

      <AnimatePresence>
        {selectedLead ? (
          <Drawer
            key="drawer"
            lead={selectedLead}
            message={draftMessage}
            isSaving={saving}
            error={drawerError}
            position={selectedPosition}
            total={filteredLeads.length}
            onClose={closeDrawer}
            onStep={stepLead}
            onMessageChange={setMessage}
            onSave={() => void updateLead({ message: draftMessage })}
            onApprove={() => void approveAndSelectNext()}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
