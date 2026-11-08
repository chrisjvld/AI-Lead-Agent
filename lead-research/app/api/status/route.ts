import { connection } from "next/server";

import { isDemoMode } from "@/lib/demo";

// Tells the UI whether results are real or precomputed demo data.
export async function GET() {
  await connection();

  return Response.json(
    { demo: isDemoMode() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
