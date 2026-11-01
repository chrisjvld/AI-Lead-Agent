"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { DataTable } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { useLeads } from "@/hooks/useLeads";
import { LeadRecordSchema, type LeadRecord } from "@/lib/types";

const LeadResponseSchema = z.object({
  lead: LeadRecordSchema,
});

type LeadFilter = "All" | "Hot" | "Warm" | "Cold" | "Failed";

export default function LeadsPage() {
  const {
    leads,
    loading,
    error,
    isProcessing,
    refresh,
    replaceLead,
  } = useLeads();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LeadFilter>("All");

  const selectedLead =
    leads.find((lead) => lead.id === selectedId) ?? null;
  const draftMessage = message ?? selectedLead?.message ?? "";

  const stats = useMemo(() => {
    const scored = leads.filter((lead) => lead.score !== null);
    return {
      processed: leads.filter(
        (lead) => lead.status === "done" || lead.status === "failed",
      ).length,
      approved: leads.filter((lead) => lead.approved).length,
      average:
        scored.length > 0
          ? Math.round(
              scored.reduce((total, lead) => total + (lead.score ?? 0), 0) /
                scored.length,
            )
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
        filter === "All" ||
        (filter === "Failed"
          ? lead.status === "failed"
          : lead.tier === filter);
      const matchesSearch =
        !query ||
        lead.company.toLowerCase().includes(query) ||
        lead.contactName.toLowerCase().includes(query) ||
        lead.website.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, leads, search]);

  const activeLead = leads.find(
    (lead) => lead.status === "researching" || lead.status === "scoring",
  );
  const selectedPosition = selectedLead
    ? Math.max(1, leads.findIndex((lead) => lead.id === selectedLead.id) + 1)
    : 0;

  function selectLead(lead: LeadRecord) {
    setSelectedId(lead.id);
    setMessage(null);
    setDrawerError(null);
  }

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
        updateError instanceof Error
          ? updateError.message
          : "The lead could not be updated.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function approveAndSelectNext() {
    if (!selectedLead) return;

    const updated = await updateLead({
      message: draftMessage,
      approved: true,
    });
    if (!updated) return;

    const nextLead = leads.find(
      (lead) =>
        lead.id !== selectedLead.id &&
        lead.status === "done" &&
        !lead.approved,
    );

    if (nextLead) {
      selectLead(nextLead);
    } else {
      setSelectedId(null);
    }
  }

  const filters: LeadFilter[] = ["All", "Hot", "Warm", "Cold", "Failed"];

  return (
    <AppShell active="leads" leadCount={leads.length}>
      <div
        className={selectedLead ? "sm:mr-[var(--token-drawer-width)]" : ""}
      >
        <header className="flex min-h-8 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold">Leads</h1>
            {leads.length > 0 ? (
              <span className="text-xs text-muted">
                {leads.length} imported leads
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <input
              type="search"
              aria-label="Search companies"
              placeholder="Search companies"
              className="h-[34px] w-36 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-foreground"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          <Button href="/upload" variant="secondary">
              Import
          </Button>
          <Button
            href="/api/leads/export"
            variant="primary"
              disabled={stats.approved === 0}
          >
              Export {stats.approved} approved
          </Button>
        </div>
      </header>

      {isProcessing ? (
        <div
            className="mt-3 flex items-center gap-3 border-y border-border py-2 text-xs"
          role="status"
        >
            <strong className="whitespace-nowrap font-medium">
              Researching {stats.processed} of {leads.length}
            </strong>
            <div className="h-0.5 flex-1 bg-surface-muted">
              <div
                className="h-0.5 bg-accent"
                style={{
                  width: `${leads.length ? (stats.processed / leads.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="whitespace-nowrap text-muted">
              {activeLead
                ? `now ${activeLead.status === "scoring" ? "scoring" : "researching"} ${activeLead.company.toLowerCase()}`
                : "queue running"}
            </span>
        </div>
      ) : null}

      {error ? (
        <div
            className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger bg-surface p-3 text-xs text-danger"
          role="alert"
        >
          <span>{error}</span>
          <Button variant="secondary" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

        <section className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
          {leads.length > 0 ? (
            <div className="flex items-center border-b border-border px-2 py-2">
              <div className="flex gap-1">
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-md px-2 py-1 text-xs ${
                      filter === item
                        ? "bg-surface-muted font-medium"
                        : "text-muted hover:text-foreground"
                    }`}
                    onClick={() => setFilter(item)}
                  >
                    {item} {stats.counts[item]}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-xs text-muted">
                Avg. score {stats.average || "—"}
              </span>
            </div>
          ) : null}

          <DataTable
            leads={loading ? [] : filteredLeads}
            selectedId={selectedId}
            onSelect={selectLead}
            emptyContent={
              loading ? (
                <div className="min-h-40 p-5 text-xs text-muted" role="status">
                  Loading leads…
                </div>
              ) : leads.length === 0 && !error ? (
                <EmptyState
                  title="No leads yet"
                  description="Import a CSV with company, website, contact_name, title and email. Each row gets researched and scored in about ten seconds."
                  action={
                    <>
                      <Button href="/upload">Import CSV</Button>
                      <a
                        href="/upload?sample=1"
                        className="self-center text-xs text-accent underline"
                      >
                        Try it with sample data
                      </a>
                    </>
                  }
                />
              ) : (
                <div className="min-h-40 p-5 text-xs text-muted">
                  No leads match this search or filter.
                </div>
              )
            }
          />
        </section>
      </div>

      {selectedLead ? (
        <Drawer
          lead={selectedLead}
          message={draftMessage}
          isSaving={saving}
          error={drawerError}
          position={selectedPosition}
          total={leads.length}
          onClose={() => setSelectedId(null)}
          onMessageChange={setMessage}
          onSave={() => void updateLead({ message: draftMessage })}
          onApprove={() => void approveAndSelectNext()}
        />
      ) : null}
    </AppShell>
  );
}
