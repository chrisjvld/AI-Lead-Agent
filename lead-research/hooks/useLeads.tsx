"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  LeadsResponseSchema,
  type LeadRecord,
} from "@/lib/types";

export const activeStatuses = new Set<LeadRecord["status"]>([
  "queued",
  "researching",
  "enriching",
  "scoring",
  "drafting",
]);

const POLL_MS = 1_000;

async function requestLeads() {
  const response = await fetch("/api/leads", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load leads.");
  }

  return LeadsResponseSchema.parse(await response.json()).leads;
}

type LeadsState = {
  leads: LeadRecord[];
  loading: boolean;
  error: string | null;
  isProcessing: boolean;
  refresh: () => Promise<void>;
  replaceLead: (updated: LeadRecord) => void;
};

const LeadsContext = createContext<LeadsState | null>(null);

/**
 * Owns the leads list and live polling for the whole app, so the shell,
 * import page and leads table share one source of truth and polling keeps
 * running across navigation. Polls while any lead is still in the queue.
 */
export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  const loadRef = useRef<() => Promise<void>>(async () => undefined);

  const load = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);

    try {
      const nextLeads = await requestLeads();
      if (!mounted.current) return;

      setLeads(nextLeads);
      setError(null);

      if (nextLeads.some((lead) => activeStatuses.has(lead.status))) {
        timer.current = setTimeout(() => void loadRef.current(), POLL_MS);
      }
    } catch (pollError) {
      if (mounted.current) {
        setError(
          pollError instanceof Error ? pollError.message : "Could not load leads.",
        );
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    mounted.current = true;
    const initial = setTimeout(() => void load(), 0);

    return () => {
      mounted.current = false;
      clearTimeout(initial);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setError(null);
    await load();
  }, [load]);

  const replaceLead = useCallback((updated: LeadRecord) => {
    setLeads((current) =>
      current.map((lead) => (lead.id === updated.id ? updated : lead)),
    );
  }, []);

  const isProcessing = useMemo(
    () => leads.some((lead) => activeStatuses.has(lead.status)),
    [leads],
  );

  const value = useMemo(
    () => ({ leads, loading, error, isProcessing, refresh, replaceLead }),
    [leads, loading, error, isProcessing, refresh, replaceLead],
  );

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads(): LeadsState {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used inside <LeadsProvider>.");
  }
  return context;
}
