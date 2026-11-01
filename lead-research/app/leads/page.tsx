"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { DataTable } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { useLeads } from "@/hooks/useLeads";
import { LeadRecordSchema, type LeadRecord } from "@/lib/types";

const LeadResponseSchema = z.object({
  lead: LeadRecordSchema,
});

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

  const selectedLead =
    leads.find((lead) => lead.id === selectedId) ?? null;
  const draftMessage = message ?? selectedLead?.message ?? "";

  const stats = useMemo(() => {
    const scored = leads.filter((lead) => lead.score !== null);
    const average =
      scored.length > 0
        ? Math.round(
            scored.reduce((total, lead) => total + (lead.score ?? 0), 0) /
              scored.length,
          )
        : 0;

    return {
      total: leads.length,
      processed: leads.filter(
        (lead) => lead.status === "done" || lead.status === "failed",
      ).length,
      hot: leads.filter((lead) => lead.tier === "Hot").length,
      average,
    };
  }, [leads]);

  function selectLead(lead: LeadRecord) {
    setSelectedId(lead.id);
    setMessage(null);
    setDrawerError(null);
  }

  async function updateLead(body: { message?: string; approved?: boolean }) {
    if (!selectedLead) return;

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
    } catch (updateError) {
      setDrawerError(
        updateError instanceof Error
          ? updateError.message
          : "The lead could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell active="leads">
      <header className="flex flex-col gap-card sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Lead workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-2 text-sm text-muted">
            Review research, edit outreach, and approve leads for export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/upload" variant="secondary">
            Upload CSV
          </Button>
          <Button
            href="/api/leads/export"
            variant="primary"
            disabled={leads.every((lead) => !lead.approved)}
          >
            Export approved
          </Button>
        </div>
      </header>

      <section className="mt-page grid gap-card sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={loading ? "—" : stats.total} />
        <StatCard
          label="Processed"
          value={loading ? "—" : stats.processed}
          helper={isProcessing ? "Queue is running" : undefined}
        />
        <StatCard label="Hot" value={loading ? "—" : stats.hot} />
        <StatCard
          label="Average score"
          value={loading || stats.processed === 0 ? "—" : stats.average}
        />
      </section>

      {isProcessing ? (
        <div
          className="mt-section rounded-md border border-accent bg-surface p-card text-sm text-accent"
          role="status"
        >
          Research is in progress. This page refreshes every two seconds.
        </div>
      ) : null}

      {error ? (
        <div
          className="mt-section flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger bg-surface p-card text-sm text-danger"
          role="alert"
        >
          <span>{error}</span>
          <Button variant="secondary" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="mt-section">
        {loading ? (
          <section
            className="rounded-lg border border-border bg-surface p-page text-center text-sm text-muted"
            role="status"
          >
            Loading leads…
          </section>
        ) : leads.length === 0 && !error ? (
          <EmptyState
            title="No leads yet"
            description="Upload a CSV to start researching and scoring prospects."
            action={<Button href="/upload">Upload CSV</Button>}
          />
        ) : leads.length > 0 ? (
          <DataTable leads={leads} onSelect={selectLead} />
        ) : null}
      </div>

      {selectedLead ? (
        <Drawer
          lead={selectedLead}
          message={draftMessage}
          isSaving={saving}
          error={drawerError}
          onClose={() => setSelectedId(null)}
          onMessageChange={setMessage}
          onSave={() => void updateLead({ message: draftMessage })}
          onApprove={() =>
            void updateLead({ message: draftMessage, approved: true })
          }
        />
      ) : null}
    </AppShell>
  );
}
