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
  Hot: "text-hot",
  Warm: "text-warm",
  Cold: "text-muted",
};

function domain(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
}

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
  const hasUnsavedChanges = message !== (lead.message ?? "");

  return (
    <aside
      role="complementary"
      aria-label="Lead details"
      className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-border bg-surface pb-20 shadow-drawer sm:w-[var(--token-drawer-width)]"
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
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
          <h2 className="text-lg font-semibold">
            {lead.company}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {lead.contactName}, {lead.title}
          </p>
          <a
            className="mt-0.5 block text-xs text-accent underline"
            href={lead.website}
            target="_blank"
            rel="noreferrer"
          >
            {domain(lead.website)}
          </a>
        </div>

        {lead.error ? (
          <div className="mt-4 border-t border-border pt-3 text-xs text-danger">
            {lead.error}
          </div>
        ) : null}

        <section className="mt-5 border-t border-border pt-4">
          <div className="flex items-end gap-2">
            <span className="text-[30px] font-semibold tabular-nums">
              {lead.score ?? "—"}
            </span>
            {lead.tier ? (
              <span className={`pb-1 text-xs ${tierStyles[lead.tier]}`}>
                {lead.tier}
              </span>
            ) : null}
            <span className="ml-auto pb-1 text-xs text-muted">
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
          <h3 className="text-xs text-muted">What they do</h3>
          <p className="mt-2 text-sm leading-5">
            {lead.summary ?? "Waiting for research."}
          </p>
        </section>

        <section className="mt-5">
          <h3 className="text-xs text-muted">
            Why {lead.score ?? "this score"}
          </h3>
          {lead.reasons?.length ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-5">
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
            <label htmlFor="outreach-message" className="text-xs text-muted">
              Opener
            </label>
            <span className="truncate text-xs text-muted">
              to {lead.email}
            </span>
          </div>
          <textarea
            id="outreach-message"
            className="mt-2 min-h-24 w-full resize-y rounded-md border border-border bg-surface p-2 text-sm leading-5 outline-none focus:border-foreground disabled:bg-surface-muted"
            disabled={!canEdit || isSaving}
            maxLength={300}
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder={
              canEdit ? "Write an outreach opener…" : "Available after processing"
            }
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>{hasUnsavedChanges ? "Unsaved changes" : null}</span>
            <span>{message.length} / 300</span>
          </div>

          {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
        </section>
      </div>

      <footer className="fixed right-0 bottom-0 flex w-full gap-2 border-t border-border bg-surface p-3 sm:w-[var(--token-drawer-width)]">
        <Button
          className="flex-1"
          size="drawer"
          variant="secondary"
          disabled={!canEdit || isSaving}
          onClick={onSave}
        >
          {isSaving ? "Saving…" : "Save draft"}
        </Button>
        <Button
          className="flex-[1.6]"
          size="drawer"
          disabled={!canEdit || isSaving || lead.approved}
          onClick={onApprove}
        >
          {lead.approved ? "Approved" : "Approve and next"}
        </Button>
      </footer>
    </aside>
  );
}
