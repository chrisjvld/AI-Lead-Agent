import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { processLead } from "@/lib/pipeline";

function normaliseUrl(value: string) {
  return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
}

async function main() {
  if (existsSync(".env.local")) {
    loadEnvFile(".env.local");
  }

  const value = process.argv[2];
  if (!value) {
    throw new Error("Usage: npx tsx scripts/try-one.ts <url>");
  }

  const url = normaliseUrl(value);
  const company = url.hostname.replace(/^www\./, "");

  console.log(`Researching ${url.origin}...\n`);

  const insight = await processLead({
    company,
    website: url.origin,
  });

  console.log(JSON.stringify(insight, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Research failed: ${message}`);
  process.exitCode = 1;
});
