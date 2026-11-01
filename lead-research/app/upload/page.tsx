"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Dropzone } from "@/components/Dropzone";

const UploadResponseSchema = z.object({
  imported: z.number().int().nonnegative(),
});

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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<number | null>(null);

  function chooseFile(nextFile: File | null) {
    setFile(nextFile);
    setError(null);
    setImported(null);
  }

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
    <AppShell active="upload">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="text-sm font-medium text-accent">Import prospects</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Upload a lead list
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Upload a CSV and the research queue will process each company one at
            a time.
          </p>
        </header>

        <form
          className="mt-page rounded-lg border border-border bg-surface p-section shadow-card"
          onSubmit={handleSubmit}
        >
          <Dropzone
            file={file}
            disabled={uploading}
            onFileChange={chooseFile}
          />

          {uploading ? (
            <p className="mt-card text-sm text-muted" role="status">
              Uploading and validating the CSV…
            </p>
          ) : null}

          {error ? (
            <div
              className="mt-card rounded-md border border-danger p-card text-sm text-danger"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {imported !== null ? (
            <div
              className="mt-card rounded-md border border-success p-card text-sm text-success"
              role="status"
            >
              Imported {imported} {imported === 1 ? "lead" : "leads"}. Research
              is running in the background.
            </div>
          ) : null}

          <div className="mt-section flex flex-wrap gap-3">
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? "Uploading…" : "Upload leads"}
            </Button>
            {imported !== null ? (
              <Button href="/leads" variant="secondary">
                View leads
              </Button>
            ) : null}
          </div>
        </form>

        <section className="mt-section rounded-lg border border-border bg-surface p-card">
          <h2 className="font-semibold">Need a test file?</h2>
          <p className="mt-2 text-sm text-muted">
            Use <code className="font-mono">seed/sample_leads.csv</code>. It
            contains 20 public company websites and invented contacts.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
