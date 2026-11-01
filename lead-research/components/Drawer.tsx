import { Button } from "@/components/Button";
import { ScorePill } from "@/components/ScorePill";
import { StatusBadge } from "@/components/StatusBadge";
import type { LeadRecord } from "@/lib/types";

type DrawerProps = {
  error: string | null;
  isSaving: boolean;
  lead: LeadRecord;
  message: string;
  onApprove: () => void;
  onClose: () => void;
  onMessageChange: (message: string) => void;
  onSave: () => void;
};

export function Drawer({
  error,
  isSaving,
  lead,
  message,
  onApprove,
  onClose,
  onMessageChange,
  onSave,
}: DrawerProps) {
  const canEdit = lead.status === "done";

  return (
    <div className="fixed inset-0 z-50 bg-overlay" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-drawer-title"
        className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-border bg-surface p-section shadow-drawer"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Lead details</p>
            <h2 id="lead-drawer-title" className="mt-1 text-xl font-semibold">
              {lead.company}
            </h2>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-section flex flex-wrap items-center gap-2">
          <StatusBadge status={lead.status} />
          <ScorePill score={lead.score} tier={lead.tier} />
          {lead.approved ? (
            <span className="text-sm font-medium text-success">Approved</span>
          ) : null}
        </div>

        {lead.error ? (
          <div className="mt-section rounded-md border border-danger p-card text-sm text-danger">
            {lead.error}
          </div>
        ) : null}

        <dl className="mt-section grid gap-card text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Contact</dt>
            <dd className="mt-1 font-medium">{lead.contactName}</dd>
          </div>
          <div>
            <dt className="text-muted">Title</dt>
            <dd className="mt-1 font-medium">{lead.title}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-1 break-all font-medium">{lead.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Website</dt>
            <dd className="mt-1">
              <a
                className="font-medium text-accent hover:text-accent-hover"
                href={lead.website}
                target="_blank"
                rel="noreferrer"
              >
                Visit homepage
              </a>
            </dd>
          </div>
        </dl>

        <section className="mt-section border-t border-border pt-section">
          <h3 className="font-semibold">Research</h3>
          <div className="mt-card space-y-card text-sm">
            <div>
              <p className="text-muted">Summary</p>
              <p className="mt-1">{lead.summary ?? "Waiting for research."}</p>
            </div>
            <div>
              <p className="text-muted">Industry</p>
              <p className="mt-1">{lead.industry ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-muted">Size signal</p>
              <p className="mt-1">{lead.sizeSignal ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-muted">Score reasons</p>
              {lead.reasons?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {lead.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1">Not available</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-section border-t border-border pt-section">
          <label htmlFor="outreach-message" className="font-semibold">
            Outreach opener
          </label>
          <textarea
            id="outreach-message"
            className="mt-3 min-h-32 w-full resize-y rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-accent disabled:bg-surface-muted"
            disabled={!canEdit || isSaving}
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder={
              canEdit ? "Write an outreach opener…" : "Available after processing"
            }
          />

          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}

          <div className="mt-card flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={!canEdit || isSaving}
              onClick={onSave}
            >
              {isSaving ? "Saving…" : "Save message"}
            </Button>
            <Button
              disabled={!canEdit || isSaving || lead.approved}
              onClick={onApprove}
            >
              {lead.approved ? "Approved" : "Approve lead"}
            </Button>
          </div>
        </section>
      </aside>
    </div>
  );
}
