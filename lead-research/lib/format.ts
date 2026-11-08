import type { LeadRecord } from "@/lib/types";

export function domain(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}

export function initials(name: string) {
  const letters = name
    .replace(/[^\p{L}\p{N}\s&-]/gu, "")
    .split(/[\s&-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export type Tier = NonNullable<LeadRecord["tier"]>;

export const tierRanges: Record<Tier, string> = {
  Hot: "70–100",
  Warm: "40–69",
  Cold: "0–39",
};

/** The four visible pipeline steps, in order. */
export const pipelineSteps = [
  { id: "research", label: "Research", active: "Reading homepage" },
  { id: "enrich", label: "Enrich", active: "Profiling company" },
  { id: "score", label: "Score", active: "Scoring against profile" },
  { id: "draft", label: "Draft", active: "Drafting opener" },
] as const;

/**
 * Index of the step currently running for a status. -1 = not started,
 * 4 = all steps complete. Real mode only reports `researching` and
 * `scoring` (score and draft happen in one model call); demo mode reports
 * all four.
 */
export function stepIndex(status: LeadRecord["status"]) {
  switch (status) {
    case "queued":
      return -1;
    case "researching":
      return 0;
    case "enriching":
      return 1;
    case "scoring":
      return 2;
    case "drafting":
      return 3;
    case "done":
      return 4;
    case "failed":
      return -2;
  }
}

export function activeStep(status: LeadRecord["status"]) {
  const index = stepIndex(status);
  return index >= 0 && index < pipelineSteps.length
    ? pipelineSteps[index as 0 | 1 | 2 | 3]
    : null;
}

export function isActive(status: LeadRecord["status"]) {
  const index = stepIndex(status);
  return index >= 0 && index < 4;
}

/**
 * Display order: newest import first, and within one import the order rows
 * appeared in the CSV, which is also the order the queue processes them.
 */
export function sortLeads(leads: LeadRecord[]) {
  return [...leads].sort((a, b) => {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return a.id - b.id;
  });
}
