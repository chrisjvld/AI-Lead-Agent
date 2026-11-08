import { connection } from "next/server";
import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { leads } from "@/lib/schema";

export async function GET() {
  // better-sqlite3 is synchronous; without this the query would run once at
  // build time and the route would be prerendered as static.
  await connection();

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
