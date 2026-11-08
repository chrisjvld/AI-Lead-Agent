import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
};

/** One sentence and one clear action. */
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          {icon}
        </div>
      ) : null}
      <h2 className="type-heading text-[1.0625rem]">{title}</h2>
      <p className="mt-1.5 max-w-sm text-[0.875rem] leading-relaxed text-fg-2">{description}</p>
      {action ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{action}</div>
      ) : null}
    </section>
  );
}
