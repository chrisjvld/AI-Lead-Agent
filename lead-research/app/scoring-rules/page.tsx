import { AppShell } from "@/components/AppShell";

export default function ScoringRulesPage() {
  return (
    <AppShell active="scoring">
      <div className="max-w-[31rem]">
        <header className="border-b border-border pb-3">
          <h1 className="text-xl font-semibold">Scoring rules</h1>
          <p className="mt-1 text-xs text-muted">
            Scout uses these fixed criteria when qualifying every lead.
          </p>
        </header>

        <section className="mt-3 rounded-md border border-border bg-surface">
          <div className="border-b border-border px-3 py-3">
            <h2 className="text-xs font-semibold">Ideal customer profile</h2>
          </div>
          <ul className="space-y-3 p-4 text-xs leading-5">
            <li>
              <strong className="font-medium">Business model:</strong> B2B
              company selling a service.
            </li>
            <li>
              <strong className="font-medium">Company size:</strong> Roughly
              10–200 employees.
            </li>
            <li>
              <strong className="font-medium">Sales motion:</strong> Evidence of
              a sales team or decision maker.
            </li>
            <li>
              <strong className="font-medium">Website clarity:</strong> A clear,
              specific offer on the homepage.
            </li>
          </ul>
        </section>

        <section className="mt-3 rounded-md border border-border bg-surface">
          <div className="border-b border-border px-3 py-3">
            <h2 className="text-xs font-semibold">Penalties</h2>
          </div>
          <ul className="space-y-3 p-4 text-xs leading-5">
            <li>B2C-focused companies.</li>
            <li>Very large enterprises.</li>
            <li>Websites with no clear service offer.</li>
            <li>Claims that cannot be supported by homepage evidence.</li>
          </ul>
        </section>

        <section className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-border bg-surface text-center text-xs">
          <div className="border-r border-border p-3">
            <p className="font-medium text-hot">Hot</p>
            <p className="mt-1 text-muted">70–100</p>
          </div>
          <div className="border-r border-border p-3">
            <p className="font-medium text-warm">Warm</p>
            <p className="mt-1 text-muted">40–69</p>
          </div>
          <div className="p-3">
            <p className="font-medium text-muted">Cold</p>
            <p className="mt-1 text-muted">0–39</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
