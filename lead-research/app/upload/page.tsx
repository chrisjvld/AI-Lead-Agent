"use client";

import Papa from "papaparse";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Dropzone } from "@/components/Dropzone";
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

export default function UploadPage() {
  const { leads } = useLeads();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<number | null>(null);

  const chooseFile = useCallback(async (nextFile: File | null) => {
    setFile(nextFile);
    setError(null);
    setImported(null);
    setPreviewRows([]);
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

    setPreviewRows(parsed.data.slice(0, 3));
    setRowCount(parsed.data.length);
  }, []);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("sample")) return;

    let cancelled = false;

    async function loadSample() {
      const response = await fetch("/sample_leads.csv");
      if (!response.ok) return;

      const blob = await response.blob();
      if (!cancelled) {
        await chooseFile(
          new File([blob], "sample_leads.csv", { type: "text/csv" }),
        );
      }
    }

    void loadSample();

    return () => {
      cancelled = true;
    };
  }, [chooseFile]);

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

      setImported(UploadResponseSchema.parse(body).imported);
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

  return (
    <AppShell active="upload" leadCount={leads.length}>
      <div className="max-w-[31rem]">
        <header className="border-b border-border pb-3">
          <h1 className="text-xl font-semibold">Import leads</h1>
          <p className="mt-1 text-xs text-muted">
            One row per prospect. Scout visits each website, scores the fit and
            drafts an opener.
          </p>
        </header>

        <form className="mt-3" onSubmit={handleSubmit}>
          <Dropzone
            file={file}
            disabled={uploading}
            onFileChange={(nextFile) => void chooseFile(nextFile)}
          />

          {file && rowCount > 0 ? (
            <section className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
              <div className="flex items-center border-b border-border px-3 py-3">
                <span className="text-xs font-medium">{file.name}</span>
                <span className="ml-2 text-xs text-muted">
                  {rowCount} rows
                </span>
                <button
                  type="button"
                  className="ml-auto text-xs text-muted underline hover:text-foreground"
                  onClick={() => void chooseFile(null)}
                >
                  Remove
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] text-left text-[13.5px]">
                  <thead className="border-b border-border text-xs text-muted">
                    <tr>
                      {[
                        "company",
                        "website",
                        "contact_name",
                        "title",
                        "email",
                      ].map((field) => (
                        <th key={field} className="whitespace-nowrap px-2 py-2 font-normal">
                          <span className="mr-1 text-success">✓</span>
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row, index) => (
                      <tr key={`${row.email}-${index}`}>
                        <td className="whitespace-nowrap px-2 py-2 font-medium">
                          {row.company}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2">
                          {row.website?.replace(/^https?:\/\/(www\.)?/, "")}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2">
                          {row.contact_name}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2">
                          {row.title}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2">
                          {row.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rowCount > previewRows.length ? (
                <p className="border-t border-border px-3 py-2 text-xs text-muted">
                  and {rowCount - previewRows.length} more
                </p>
              ) : null}
            </section>
          ) : null}

          {uploading ? (
            <p className="mt-3 text-xs text-muted" role="status">
              Uploading and validating the CSV…
            </p>
          ) : null}

          {error ? (
            <div
              className="mt-3 rounded-md border border-danger p-3 text-xs text-danger"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {imported !== null ? (
            <div
              className="mt-3 rounded-md border border-success p-3 text-xs text-success"
              role="status"
            >
              Imported {imported} {imported === 1 ? "lead" : "leads"}. Research
              is running in the background.
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? "Starting…" : "Start research"}
            </Button>
            <a
              href="/sample_leads.csv"
              download
              className="text-xs text-accent underline hover:text-accent-hover"
            >
              Download the sample CSV
            </a>
            {imported !== null ? <Button href="/leads" variant="secondary">View leads</Button> : null}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
