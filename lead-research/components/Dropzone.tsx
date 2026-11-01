import type { ChangeEvent, DragEvent } from "react";

type DropzoneProps = {
  disabled?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
};

export function Dropzone({
  disabled = false,
  file,
  onFileChange,
}: DropzoneProps) {
  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!disabled) onFileChange(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <label
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-surface px-4 py-3 text-left"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        disabled={disabled}
        onChange={handleInput}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="size-4 shrink-0 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5M4 11v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
      </svg>
      <span className="text-xs">
        <strong className="font-medium">
          {file ? "Choose another CSV" : "Choose a CSV"}
        </strong>
        <span className="text-muted"> or drop it here</span>
      </span>
    </label>
  );
}
