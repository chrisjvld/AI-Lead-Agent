import { Briefcase, CircleMinus, Megaphone, ScanText, Users } from "lucide-react";

import { PageContainer, PageHeader } from "@/components/PageHeader";

const criteria = [
  {
    icon: Briefcase,
    title: "Business model",
    body: "B2B company selling a service.",
  },
  {
    icon: Users,
    title: "Company size",
    body: "Roughly 10–200 employees.",
  },
  {
    icon: Megaphone,
    title: "Sales motion",
    body: "Evidence of a sales team or decision maker.",
  },
  {
    icon: ScanText,
    title: "Website clarity",
    body: "A clear, specific offer on the homepage.",
  },
];

const penalties = [
  "B2C-focused companies.",
  "Very large enterprises.",
  "Websites with no clear service offer.",
  "Claims that cannot be supported by homepage evidence.",
];

const tiers = [
  { name: "Hot", range: "70–100", label: "Strong fit", tone: "bg-success", text: "text-success", from: 70, to: 100 },
  { name: "Warm", range: "40–69", label: "Good fit", tone: "bg-warning", text: "text-warning", from: 40, to: 70 },
  { name: "Cold", range: "0–39", label: "Weak fit", tone: "bg-fg-3", text: "text-fg-2", from: 0, to: 40 },
];

export default function ScoringRulesPage() {
  return (
    <PageContainer width="narrow">
      <PageHeader
        title="Scoring rules"
        description="Scout uses these fixed criteria when qualifying every lead. They live in the system prompt in lib/pipeline.ts."
      />

      <section className="mt-6 overflow-hidden rounded-card bg-surface shadow-card" aria-labelledby="icp">
        <h2 id="icp" className="type-heading px-5 pt-4 pb-1 text-[1rem]">
          Ideal customer profile
        </h2>
        <ul className="grid gap-px sm:grid-cols-2">
          {criteria.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3 px-5 py-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.625rem] bg-accent-soft text-accent">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.875rem] font-medium">{title}</p>
                <p className="text-[0.8125rem] leading-snug text-fg-2">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3 rounded-card bg-surface shadow-card" aria-labelledby="penalties">
        <h2 id="penalties" className="type-heading px-5 pt-4 pb-1 text-[1rem]">
          Penalties
        </h2>
        <ul className="px-5 pb-3">
          {penalties.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 border-b border-separator py-3 text-[0.875rem] last:border-b-0"
            >
              <CircleMinus className="size-4 shrink-0 text-danger" strokeWidth={1.75} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3 rounded-card bg-surface p-5 shadow-card" aria-labelledby="tiers">
        <h2 id="tiers" className="type-heading text-[1rem]">
          Fit tiers
        </h2>
        <p className="mt-0.5 text-[0.8125rem] text-fg-2">
          Leads at 70 or above clear the outreach threshold.
        </p>

        <div className="relative mt-5 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
          {[...tiers].reverse().map((tier) => (
            <span key={tier.name} className={`${tier.tone} opacity-80`} style={{ width: `${tier.to - tier.from}%` }} />
          ))}
        </div>
        <div className="tabular relative mt-1.5 h-4 text-[0.6875rem] text-fg-3" aria-hidden="true">
          <span className="absolute left-0">0</span>
          <span className="absolute left-[40%] -translate-x-1/2">40</span>
          <span className="absolute left-[70%] -translate-x-1/2 font-medium text-fg-2">70</span>
          <span className="absolute right-0">100</span>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          {tiers.map((tier) => (
            <div key={tier.name} className="rounded-btn bg-fill px-3 py-3">
              <dt className="flex items-center gap-1.5 text-[0.8125rem] font-medium">
                <span className={`size-2 rounded-full ${tier.tone}`} aria-hidden="true" />
                <span className={tier.text}>{tier.name}</span>
              </dt>
              <dd className="tabular mt-1 text-[1.0625rem] font-semibold tracking-tight">{tier.range}</dd>
              <dd className="text-xs text-fg-2">{tier.label}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageContainer>
  );
}
