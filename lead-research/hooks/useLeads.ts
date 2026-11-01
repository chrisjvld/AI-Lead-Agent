"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  LeadsResponseSchema,
  type LeadRecord,
} from "@/lib/types";

const activeStatuses = new Set<LeadRecord["status"]>([
  "queued",
  "researching",
  "scoring",
]);

async function requestLeads() {
  const response = await fetch("/api/leads", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load leads.");
  }

  return LeadsResponseSchema.parse(await response.json()).leads;
}

export function useLeads() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const nextLeads = await requestLeads();
        if (cancelled) return;

        setLeads(nextLeads);
        setError(null);

        if (nextLeads.some((lead) => activeStatuses.has(lead.status))) {
          timer = setTimeout(() => void poll(), 2_000);
        }
      } catch (pollError) {
        if (!cancelled) {
          setError(
            pollError instanceof Error ? pollError.message : "Could not load leads.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const nextLeads = await requestLeads();
      setLeads(nextLeads);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Could not load leads.",
      );
    }
  }, []);

  const replaceLead = useCallback((updated: LeadRecord) => {
    setLeads((current) =>
      current.map((lead) => (lead.id === updated.id ? updated : lead)),
    );
  }, []);

  const isProcessing = useMemo(
    () => leads.some((lead) => activeStatuses.has(lead.status)),
    [leads],
  );

  return {
    leads,
    loading,
    error,
    isProcessing,
    refresh,
    replaceLead,
  };
}
