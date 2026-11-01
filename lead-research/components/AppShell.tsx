import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  active: "leads" | "upload";
  children: ReactNode;
};

const navigation = [
  { href: "/leads", label: "Leads", id: "leads" },
  { href: "/upload", label: "Upload CSV", id: "upload" },
] as const;

export function AppShell({ active, children }: AppShellProps) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[var(--token-sidebar-width)_1fr]">
      <aside className="border-b border-border bg-surface p-card md:border-r md:border-b-0 md:p-section">
        <Link href="/leads" className="block font-semibold tracking-tight">
          Lead Research
        </Link>
        <p className="mt-1 text-xs text-muted">AI outreach workspace</p>

        <nav className="mt-section flex gap-2 md:flex-col" aria-label="Primary navigation">
          {navigation.map((item) => {
            const isActive = item.id === active;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-accent text-surface"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 p-card sm:p-section lg:p-page">{children}</main>
    </div>
  );
}
