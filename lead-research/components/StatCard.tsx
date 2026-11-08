import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: ReactNode;
  accessory?: ReactNode;
};

export function StatCard({ label, value, helper, accessory }: StatCardProps) {
  return (
    <article className="rounded-card bg-surface px-4 py-3.5 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="type-meta">{label}</p>
        {accessory}
      </div>
      <p className="type-display tabular mt-1.5 text-[1.5rem] sm:text-[2rem]">{value}</p>
      {helper ? <div className="mt-1 hidden text-xs text-fg-2 sm:block">{helper}</div> : null}
    </article>
  );
}
