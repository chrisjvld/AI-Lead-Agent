import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { leads } from "@/lib/schema";

const LeadIdSchema = z.coerce.number().int().positive();

const LeadPatchSchema = z
  .object({
    message: z.string().max(2_000).optional(),
    approved: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => value.message !== undefined || value.approved !== undefined,
    "Provide message or approved.",
  );

function parseId(value: string) {
  return LeadIdSchema.safeParse(value);
}

function findLead(id: number) {
  return db.select().from(leads).where(eq(leads.id, id)).get();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const parsedId = parseId(rawId);

  if (!parsedId.success) {
    return Response.json({ error: "Invalid lead id." }, { status: 400 });
  }

  const lead = findLead(parsedId.data);
  if (!lead) {
    return Response.json({ error: "Lead not found." }, { status: 404 });
  }

  return Response.json({ lead });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const parsedId = parseId(rawId);

  if (!parsedId.success) {
    return Response.json({ error: "Invalid lead id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedBody = LeadPatchSchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      { error: "Invalid request body.", details: parsedBody.error.flatten() },
      { status: 400 },
    );
  }

  const updated = db
    .update(leads)
    .set(parsedBody.data)
    .where(eq(leads.id, parsedId.data))
    .returning()
    .get();

  if (!updated) {
    return Response.json({ error: "Lead not found." }, { status: 404 });
  }

  return Response.json({ lead: updated });
}
