import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="min-h-40 p-5 text-left">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-muted">{description}</p>
      {action ? <div className="mt-3 flex flex-wrap gap-3">{action}</div> : null}
    </section>
  );
}
