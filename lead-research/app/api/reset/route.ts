import { db } from "@/lib/db";
import { leads } from "@/lib/schema";

export async function POST() {
  const result = db.delete(leads).run();

  return Response.json({ deleted: result.changes });
}
