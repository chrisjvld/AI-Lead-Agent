import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { leads } from "@/lib/schema";

export async function GET() {
  const result = db.select().from(leads).orderBy(desc(leads.createdAt), desc(leads.id)).all();

  return Response.json(
    { leads: result },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
