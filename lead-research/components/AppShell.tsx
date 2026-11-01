import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  active: "leads" | "upload" | "scoring";
  children: ReactNode;
  leadCount?: number;
};

const navigation = [
  { href: "/leads", label: "Leads", id: "leads" },
  { href: "/upload", label: "Import", id: "upload" },
  { href: "/scoring-rules", label: "Scoring rules", id: "scoring" },
] as const;

export function AppShell({ active, children, leadCount }: AppShellProps) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[var(--token-sidebar-width)_1fr]">
      <aside className="flex border-b border-border bg-background p-card md:sticky md:top-0 md:h-screen md:flex-col md:border-r md:border-b-0 md:p-2">
        <Link
          href="/leads"
          className="px-2 py-2 text-xs font-bold tracking-tight"
        >
          scout.
        </Link>

        <nav
          className="ml-auto flex gap-1 md:mt-3 md:ml-0 md:flex-col"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => {
            const isActive = item.id === active;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-md px-2 py-2 text-xs ${
                  isActive
                    ? "bg-surface-muted font-medium text-foreground"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {item.id === "leads" && leadCount !== undefined ? (
                  <span className="text-xs text-muted">{leadCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden items-center gap-2 px-2 py-3 md:flex">
          <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-surface">
            CJ
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-medium">Christoffer</p>
            <p className="truncate text-xs text-muted">Demo workspace</p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 p-card sm:p-section lg:p-page">{children}</main>
    </div>
  );
}
