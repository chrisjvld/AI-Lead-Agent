import { asc, eq } from "drizzle-orm";
import Papa from "papaparse";

import { db } from "@/lib/db";
import { leads } from "@/lib/schema";

export async function GET() {
  const approved = db
    .select()
    .from(leads)
    .where(eq(leads.approved, true))
    .orderBy(asc(leads.createdAt), asc(leads.id))
    .all();

  const csv = Papa.unparse(
    approved.map((lead) => ({
      company: lead.company,
      website: lead.website,
      contact_name: lead.contactName,
      title: lead.title,
      email: lead.email,
      summary: lead.summary ?? "",
      industry: lead.industry ?? "",
      size_signal: lead.sizeSignal ?? "",
      score: lead.score ?? "",
      tier: lead.tier ?? "",
      reasons: lead.reasons?.join(" | ") ?? "",
      message: lead.message ?? "",
      approved: lead.approved,
    })),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="approved-leads.csv"',
      "Cache-Control": "no-store",
    },
  });
}
