import { Button } from "@/components/Button";
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
  position: number;
  total: number;
};

const tierStyles: Record<NonNullable<LeadRecord["tier"]>, string> = {
  Hot: "text-danger",
  Warm: "text-warning",
  Cold: "text-muted",
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
  position,
  total,
}: DrawerProps) {
  const canEdit = lead.status === "done";

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-drawer-title"
      className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-border bg-surface pb-20 shadow-drawer sm:w-[var(--token-drawer-width)]"
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted">
            {position} of {total}
          </p>
          <button
            type="button"
            aria-label="Close lead details"
            className="px-1 text-sm text-muted hover:text-foreground"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mt-4">
          <h2 id="lead-drawer-title" className="text-sm font-semibold">
            {lead.company}
          </h2>
          <p className="mt-0.5 text-[10px] text-muted">
            {lead.contactName}, {lead.title}
          </p>
          <a
            className="mt-0.5 block text-[10px] text-accent underline"
            href={lead.website}
            target="_blank"
            rel="noreferrer"
          >
            {new URL(lead.website).hostname.replace(/^www\./, "")}
          </a>
        </div>

        {lead.error ? (
          <div className="mt-4 border-t border-border pt-3 text-xs text-danger">
            {lead.error}
          </div>
        ) : null}

        <section className="mt-5 border-t border-border pt-4">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {lead.score ?? "—"}
            </span>
            {lead.tier ? (
              <span className={`pb-1 text-xs ${tierStyles[lead.tier]}`}>
                {lead.tier}
              </span>
            ) : null}
            <span className="ml-auto pb-1 text-[9px] text-muted">
              threshold 70
            </span>
          </div>
          <div className="relative mt-2 h-1 bg-surface-muted">
            <div
              className="h-1 bg-foreground"
              style={{ width: `${lead.score ?? 0}%` }}
            />
            <span className="absolute top-[-2px] left-[70%] h-2 w-px bg-muted" />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-[10px] text-muted">What they do</h3>
          <p className="mt-2 text-xs leading-5">
            {lead.summary ?? "Waiting for research."}
          </p>
        </section>

        <section className="mt-5">
          <h3 className="text-[10px] text-muted">
            Why {lead.score ?? "this score"}
          </h3>
          {lead.reasons?.length ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-4">
              {lead.reasons.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-xs text-muted">Not available</p>
          )}
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="outreach-message" className="text-[10px] text-muted">
              Opener
            </label>
            <span className="truncate text-[9px] text-muted">
              to {lead.email}
            </span>
          </div>
          <textarea
            id="outreach-message"
            className="mt-2 min-h-24 w-full resize-y rounded-md border border-border bg-surface p-2 text-xs leading-5 outline-none focus:border-foreground disabled:bg-surface-muted"
            disabled={!canEdit || isSaving}
            maxLength={300}
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder={
              canEdit ? "Write an outreach opener…" : "Available after processing"
            }
          />
          <div className="mt-1 flex justify-between text-[9px] text-muted">
            <span>Edited by you</span>
            <span>{message.length} / 300</span>
          </div>

          {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
        </section>
      </div>

      <footer className="fixed right-0 bottom-0 flex w-full gap-2 border-t border-border bg-surface p-3 sm:w-[var(--token-drawer-width)]">
        <Button
          className="flex-1"
          variant="secondary"
          disabled={!canEdit || isSaving}
          onClick={onSave}
        >
          {isSaving ? "Saving…" : "Save draft"}
        </Button>
        <Button
          className="flex-[1.6]"
          disabled={!canEdit || isSaving || lead.approved}
          onClick={onApprove}
        >
          {lead.approved ? "Approved" : "Approve and next"}
        </Button>
      </footer>
    </aside>
  );
}
