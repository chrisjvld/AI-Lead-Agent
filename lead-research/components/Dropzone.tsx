"use client";

import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

type DropzoneProps = {
  disabled?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
};

/**
 * Drop target with instant feedback: it lifts and tints the moment a file is
 * dragged over (not on drop), and presses down on pointer-down.
 */
export function Dropzone({ disabled = false, file, onFileChange }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (disabled) return;
    depth.current += 1;
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    depth.current = 0;
    setDragging(false);
    if (!disabled) onFileChange(event.dataTransfer.files?.[0] ?? null);
  }

  const Icon = file ? FileSpreadsheet : UploadCloud;

  return (
    <motion.label
      className={`focus-within:ring-accent relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border-[1.5px] border-dashed px-6 text-center transition-colors duration-150 focus-within:ring-2 ${
        file ? "min-h-32 py-6" : "min-h-56 py-10"
      } ${
        dragging
          ? "border-accent bg-accent-soft"
          : "border-[color-mix(in_srgb,var(--text)_16%,transparent)] bg-surface hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] hover:bg-surface-2"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      animate={{ scale: dragging ? 1.01 : 1 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", bounce: 0, duration: 0.25 }}
      onDragEnter={handleDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-dragging={dragging}
    >
      <input
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        disabled={disabled}
        onChange={handleInput}
        aria-label={file ? "Choose another CSV file" : "Choose a CSV file"}
      />
      <motion.span
        className={`flex size-12 items-center justify-center rounded-2xl ${
          dragging || file ? "bg-accent text-white" : "bg-accent-soft text-accent"
        }`}
        animate={{ y: dragging ? -4 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        aria-hidden="true"
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </motion.span>
      <span className="type-heading mt-3 text-[1rem]">
        {dragging ? "Drop to preview" : file ? "Choose a different CSV" : "Drop a CSV here"}
      </span>
      <span className="mt-1 text-[0.8125rem] text-fg-2">
        {dragging ? "Nothing is imported until you start research." : (
          <>
            or <span className="font-medium text-accent">browse your files</span> · up to 1 MB
          </>
        )}
      </span>
    </motion.label>
  );
}
