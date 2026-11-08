"use client";

import { FileUp, ListChecks, Users, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ScoutMark } from "@/components/ScoutMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLeads } from "@/hooks/useLeads";
import { isActive } from "@/lib/format";

type NavItem = {
  href: string;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
};

const navigation: NavItem[] = [
  {
    href: "/leads",
    label: "Leads",
    short: "Leads",
    description: "Research results and outreach drafts",
    icon: Users,
  },
  {
    href: "/upload",
    label: "Import CSV",
    short: "Import",
    description: "Add prospects to research",
    icon: FileUp,
  },
  {
    href: "/scoring-rules",
    label: "Scoring rules",
    short: "Rules",
    description: "The ideal customer profile",
    icon: ListChecks,
  },
];

function useDemoFlag() {
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => {
        if (
          !cancelled &&
          typeof body === "object" &&
          body !== null &&
          "demo" in body
        ) {
          setDemo(body.demo === true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return demo;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function QueueStatus() {
  const { leads, isProcessing } = useLeads();
  if (!isProcessing) return null;

  const finished = leads.filter(
    (lead) => lead.status === "done" || lead.status === "failed",
  ).length;
  const current = leads.find((lead) => isActive(lead.status));

  return (
    <Link
      href="/leads"
      className="pressable focus-ring mx-3 mb-3 block rounded-btn bg-fill px-3 py-2.5 hover:bg-fill-2"
      aria-label={`Research running: ${finished} of ${leads.length} done. View leads.`}
    >
      <div className="flex items-center gap-2 text-[0.8125rem] font-medium">
        <span className="breathe size-1.5 rounded-full bg-accent" aria-hidden="true" />
        Researching
        <span className="tabular ml-auto text-fg-2">
          {finished}/{leads.length}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-fill-2">
        <motion.div
          className="h-full origin-left rounded-full bg-accent"
          initial={false}
          animate={{ scaleX: leads.length ? finished / leads.length : 0 }}
        />
      </div>
      {current ? (
        <p className="mt-1.5 truncate text-xs text-fg-2">{current.company}</p>
      ) : null}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { leads } = useLeads();
  const demo = useDemoFlag();
  const scrolled = useScrolled();
  const activeItem =
    navigation.find((item) => pathname.startsWith(item.href)) ?? navigation[0];

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only z-[100] rounded-btn bg-surface px-3 py-2 shadow-raised focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar: translucent structural material. */}
      <aside className="material sticky top-0 z-30 hidden h-dvh flex-col border-r border-separator md:flex">
        <Link
          href="/leads"
          className="focus-ring mx-3 mt-4 mb-5 flex items-center gap-2.5 rounded-btn px-2 py-1"
        >
          <ScoutMark />
          <span className="leading-tight">
            <span className="type-heading block text-[0.9375rem]">Scout</span>
            <span className="block text-xs text-fg-2">Lead research</span>
          </span>
        </Link>

        <p className="type-eyebrow px-5 pb-1.5">Workspace</p>
        <nav aria-label="Primary" className="flex flex-col gap-0.5 px-3">
          {navigation.map((item) => {
            const current = item === activeItem;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                title={item.description}
                className={`pressable focus-ring relative flex h-9 items-center gap-2.5 rounded-btn px-2.5 text-[0.875rem] ${
                  current ? "font-medium text-fg" : "text-fg-2 hover:bg-fill hover:text-fg"
                }`}
              >
                {current ? (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-btn bg-fill-2"
                    aria-hidden="true"
                  />
                ) : null}
                <Icon
                  className={`relative size-[1.0625rem] ${current ? "text-accent" : ""}`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="relative">{item.label}</span>
                {item.href === "/leads" && leads.length > 0 ? (
                  <span className="tabular relative ml-auto text-xs text-fg-3">
                    {leads.length}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <QueueStatus />
          {demo ? (
            <p
              className="mx-3 mb-3 rounded-btn border border-dashed border-separator px-3 py-2 text-xs leading-snug text-fg-2"
              title="No OpenAI key is configured, so Scout uses precomputed sample results. Set OPENAI_API_KEY to research real websites."
            >
              <span className="font-medium text-fg">Demo mode.</span> Results are
              precomputed, no API key needed.
            </p>
          ) : null}
          <div className="flex items-center gap-2.5 border-t border-separator px-5 py-3.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-fill-2 text-[0.6875rem] font-semibold text-fg-2">
              CJ
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[0.8125rem] font-medium">Christoffer</p>
              <p className="truncate text-xs text-fg-2">Demo workspace</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top bar: translucent, scroll-edge fade once content is beneath. */}
      <header
        className="material scroll-edge sticky top-0 z-30 flex h-12 items-center gap-2 px-4 md:hidden"
        data-scrolled={scrolled}
      >
        <Link href="/leads" className="focus-ring flex items-center gap-2 rounded-btn" aria-label="Scout home">
          <ScoutMark className="size-6" />
        </Link>
        <span className="type-heading text-[0.9375rem]">{activeItem.short === "Rules" ? "Scoring rules" : activeItem.label}</span>
        {demo ? (
          <span className="ml-1 rounded-full bg-fill-2 px-2 py-0.5 text-[0.6875rem] font-medium text-fg-2">
            Demo
          </span>
        ) : null}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="min-w-0 pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+1rem)] md:pb-10">
        {children}
      </main>

      {/* Mobile tab bar. */}
      <nav
        aria-label="Primary"
        className="material fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-separator pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {navigation.map((item) => {
          const current = item === activeItem;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`pressable focus-ring flex h-[var(--tabbar-height)] flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium ${
                current ? "text-accent" : "text-fg-3"
              }`}
            >
              <Icon className="size-5" strokeWidth={current ? 2 : 1.75} aria-hidden="true" />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
