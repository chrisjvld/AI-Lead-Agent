"use client";

import { ArrowRight, Check, CircleAlert, Download, FileSpreadsheet, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/Button";
import { Dropzone } from "@/components/Dropzone";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { useLeads } from "@/hooks/useLeads";

const UploadResponseSchema = z.object({
  imported: z.number().int().nonnegative(),
});

type PreviewRow = {
  company?: string;
  website?: string;
  contact_name?: string;
  title?: string;
  email?: string;
};

const REQUIRED_FIELDS = ["company", "website", "contact_name", "title", "email"] as const;
const PREVIEW_ROWS = 5;

function responseError(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return "The CSV could not be uploaded.";
}

const steps = [
  { title: "Research", body: "Reads each company’s homepage." },
  { title: "Score", body: "Rates fit 0–100 against your profile." },
  { title: "Draft", body: "Writes an opener from a real detail." },
];

export default function UploadPage() {
  const router = useRouter();
  const { refresh } = useLeads();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<number | null>(null);

  const chooseFile = useCallback(async (nextFile: File | null) => {
    setFile(nextFile);
    setError(null);
    setImported(null);
    setPreviewRows([]);
    setHeaders([]);
    setRowCount(0);

    if (!nextFile) return;

    const parsed = Papa.parse<PreviewRow>(await nextFile.text(), {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      setError("This CSV could not be previewed. Check its formatting.");
      return;
    }

    setHeaders(parsed.meta.fields ?? []);
    setPreviewRows(parsed.data.slice(0, PREVIEW_ROWS));
    setRowCount(parsed.data.length);
  }, []);

  const loadSample = useCallback(async () => {
    const response = await fetch("/sample_leads.csv");
    if (!response.ok) return;
    const blob = await response.blob();
    await chooseFile(new File([blob], "sample_leads.csv", { type: "text/csv" }));
  }, [chooseFile]);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("sample")) return;
    const timer = setTimeout(() => void loadSample(), 0);
    return () => clearTimeout(timer);
  }, [loadSample]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setImported(null);

    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch("/api/leads/upload", {
        method: "POST",
        body: formData,
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        throw new Error(responseError(body));
      }

      const count = UploadResponseSchema.parse(body).imported;
      setImported(count);
      await refresh();
      // Take the user straight to the live table so they can watch it run.
      router.push("/leads");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The CSV could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  const missing = headers.length
    ? REQUIRED_FIELDS.filter((field) => !headers.includes(field))
    : [];
  const ready = Boolean(file) && rowCount > 0 && missing.length === 0;

  return (
    <PageContainer width="narrow">
      <PageHeader
        title="Import CSV"
        description="One row per prospect. Scout researches each website, scores the fit and drafts a personal opener."
      />

      <form className="mt-6" onSubmit={handleSubmit}>
        <Dropzone
          file={file}
          disabled={uploading}
          onFileChange={(nextFile) => void chooseFile(nextFile)}
        />

        {!file ? (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.8125rem]">
            <button
              type="button"
              onClick={() => void loadSample()}
              className="pressable focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-accent hover:bg-accent-soft"
            >
              <Sparkles className="size-3.5" strokeWidth={2} aria-hidden="true" />
              Try it with sample data
            </button>
            <a
              href="/sample_leads.csv"
              download
              className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-fg-2 hover:text-fg"
            >
              <Download className="size-3.5" strokeWidth={2} aria-hidden="true" />
              Download the sample CSV
            </a>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {file && rowCount > 0 ? (
            <motion.section
              key={file.name + rowCount}
              className="mt-4 overflow-hidden rounded-card bg-surface shadow-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              aria-label="CSV preview"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="flex size-9 items-center justify-center rounded-[0.625rem] bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success">
                  <FileSpreadsheet className="size-[1.125rem]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.875rem] font-medium">{file.name}</p>
                  <p className="tabular text-xs text-fg-2">
                    {rowCount} {rowCount === 1 ? "prospect" : "prospects"} · {headers.length} columns
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove file"
                  className="pressable focus-ring ml-auto inline-flex size-8 items-center justify-center rounded-full text-fg-2 hover:bg-fill hover:text-fg"
                  onClick={() => void chooseFile(null)}
                >
                  <X className="size-4" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 border-t border-separator px-4 py-3 sm:px-5">
                {REQUIRED_FIELDS.map((field) => {
                  const present = headers.includes(field);
                  return (
                    <span
                      key={field}
                      className={`inline-flex h-6 items-center gap-1 rounded-chip px-2 font-mono text-[0.75rem] ${
                        present
                          ? "bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-success"
                          : "bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger"
                      }`}
                    >
                      {present ? (
                        <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
                      ) : (
                        <X className="size-3" strokeWidth={2.5} aria-hidden="true" />
                      )}
                      {field}
                    </span>
                  );
                })}
              </div>

              <div className="overflow-x-auto border-t border-separator">
                <table className="w-full min-w-[36rem] text-left text-[0.8125rem]">
                  <thead>
                    <tr className="type-eyebrow">
                      <th className="py-2 pr-3 pl-4 font-medium sm:pl-5">Company</th>
                      <th className="px-3 py-2 font-medium">Website</th>
                      <th className="px-3 py-2 font-medium">Contact</th>
                      <th className="py-2 pr-4 pl-3 font-medium sm:pr-5">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, index) => (
                      <motion.tr
                        key={`${row.email}-${index}`}
                        className="border-t border-separator"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.35, delay: 0.03 * index }}
                      >
                        <td className="py-2.5 pr-3 pl-4 font-medium whitespace-nowrap sm:pl-5">{row.company}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-fg-2">
                          {row.website?.replace(/^https?:\/\/(www\.)?/, "")}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {row.contact_name}
                          <span className="text-fg-2"> · {row.title}</span>
                        </td>
                        <td className="py-2.5 pr-4 pl-3 whitespace-nowrap text-fg-2 sm:pr-5">{row.email}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rowCount > previewRows.length ? (
                <p className="tabular border-t border-separator px-4 py-2.5 text-xs text-fg-2 sm:px-5">
                  and {rowCount - previewRows.length} more
                </p>
              ) : null}
            </motion.section>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {error ? (
            <motion.div
              className="mt-4 flex gap-2.5 rounded-btn bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-3.5 text-[0.8125rem] text-danger"
              role="alert"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              {error}
            </motion.div>
          ) : null}
          {missing.length > 0 ? (
            <motion.p
              className="mt-4 text-[0.8125rem] text-danger"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Missing {missing.length === 1 ? "column" : "columns"}: {missing.join(", ")}.
            </motion.p>
          ) : null}
          {imported !== null ? (
            <motion.p
              className="mt-4 flex items-center gap-2 text-[0.8125rem] text-success"
              role="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
              Imported {imported} {imported === 1 ? "lead" : "leads"}. Opening the live table…
            </motion.p>
          ) : null}
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" size="drawer" disabled={!ready || uploading} className="min-w-44">
            {uploading ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                Starting research…
              </>
            ) : (
              <>
                Start research
                {ready ? <span className="tabular opacity-80">· {rowCount}</span> : null}
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </Button>
          {uploading ? (
            <p className="text-[0.8125rem] text-fg-2" role="status">
              Validating rows…
            </p>
          ) : null}
        </div>
      </form>

      <section className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="What happens next">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-card bg-surface p-4 shadow-card">
            <p className="tabular text-xs font-medium text-accent">Step {index + 1}</p>
            <p className="type-heading mt-1 text-[0.9375rem]">{step.title}</p>
            <p className="mt-0.5 text-[0.8125rem] leading-snug text-fg-2">{step.body}</p>
          </div>
        ))}
      </section>
    </PageContainer>
  );
}
