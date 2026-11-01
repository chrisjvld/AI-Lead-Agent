import Papa from "papaparse";
import { z } from "zod";

import { db } from "@/lib/db";
import { processQueue } from "@/lib/pipeline";
import { leads } from "@/lib/schema";

const MAX_CSV_BYTES = 1_000_000;

const UploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "CSV file is empty.")
    .refine((file) => file.size <= MAX_CSV_BYTES, "CSV file must be 1 MB or smaller."),
});

const CsvLeadSchema = z
  .object({
    company: z.string().trim().min(1),
    website: z
      .string()
      .trim()
      .min(1)
      .transform((value) =>
        /^https?:\/\//i.test(value) ? value : `https://${value}`,
      )
      .pipe(z.url()),
    contact_name: z.string().trim().min(1),
    title: z.string().trim().min(1),
    email: z.email().transform((value) => value.toLowerCase()),
  })
  .strict();

type CsvLead = z.infer<typeof CsvLeadSchema>;

function parseCsv(csv: string) {
  return Papa.parse<Record<string, unknown>>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });
}

function validateRows(rows: Record<string, unknown>[]) {
  const validRows: CsvLead[] = [];
  const errors: Array<{ row: number; issues: string[] }> = [];

  rows.forEach((row, index) => {
    const parsed = CsvLeadSchema.safeParse(row);

    if (parsed.success) {
      validRows.push(parsed.data);
      return;
    }

    errors.push({
      row: index + 2,
      issues: parsed.error.issues.map((issue) => issue.message),
    });
  });

  return { validRows, errors };
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Request must be multipart form data." },
      { status: 400 },
    );
  }

  const upload = UploadSchema.safeParse({ file: formData.get("file") });
  if (!upload.success) {
    return Response.json(
      { error: "Invalid upload.", details: upload.error.flatten() },
      { status: 400 },
    );
  }

  const parsedCsv = parseCsv(await upload.data.file.text());
  if (parsedCsv.errors.length > 0) {
    return Response.json(
      { error: "CSV could not be parsed.", details: parsedCsv.errors },
      { status: 400 },
    );
  }

  if (parsedCsv.data.length === 0) {
    return Response.json({ error: "CSV contains no lead rows." }, { status: 400 });
  }

  const { validRows, errors } = validateRows(parsedCsv.data);
  if (errors.length > 0) {
    return Response.json(
      { error: "CSV contains invalid rows.", details: errors },
      { status: 400 },
    );
  }

  const inserted = db
    .insert(leads)
    .values(
      validRows.map((row) => ({
        company: row.company,
        website: row.website,
        contactName: row.contact_name,
        title: row.title,
        email: row.email,
      })),
    )
    .returning()
    .all();

  setImmediate(() => {
    void processQueue().catch((error: unknown) => {
      console.error("Lead queue failed:", error);
    });
  });

  return Response.json(
    { imported: inserted.length, leads: inserted },
    { status: 201 },
  );
}
