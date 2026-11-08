import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="type-display hidden text-[2rem] md:block">{title}</h1>
        {description ? (
          <p className="type-meta mt-1 max-w-xl text-[0.875rem] md:mt-1.5">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{actions}</div>
      ) : null}
    </header>
  );
}

export function PageContainer({
  children,
  width = "wide",
}: {
  children: ReactNode;
  width?: "wide" | "narrow";
}) {
  return (
    <div
      className={`mx-auto w-full px-4 pt-5 sm:px-6 md:px-8 md:pt-10 ${
        width === "wide" ? "max-w-[75rem]" : "max-w-[46rem]"
      }`}
    >
      {children}
    </div>
  );
}
