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
      className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted p-section text-center"
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
      <span className="font-medium">
        {file ? file.name : "Drop a CSV file here"}
      </span>
      <span className="mt-2 text-sm text-muted">
        {file
          ? `${Math.max(1, Math.round(file.size / 1024))} KB selected`
          : "or click to choose a file"}
      </span>
      <span className="mt-3 text-xs text-muted">
        Required columns: company, website, contact_name, title, email
      </span>
    </label>
  );
}
