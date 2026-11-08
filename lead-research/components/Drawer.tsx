"use client";

import {
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Copy,
  Mail,
  Users,
  X,
} from "lucide-react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { Button } from "@/components/Button";
import { PipelineProgress } from "@/components/PipelineProgress";
import { momentumSpring, spring } from "@/components/Providers";
import { tierDot, tierTone } from "@/components/ScorePill";
import { domain, initials, isActive } from "@/lib/format";
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
  onStep?: (direction: 1 | -1) => void;
  position: number;
  total: number;
};

const THRESHOLD = 70;

/** Apple's momentum projection (Designing Fluid Interfaces). */
function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

function isInteractive(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("textarea, input, button, a, [data-no-drag]"));
}

export function Drawer(props: DrawerProps) {
  const { lead, onClose, onStep, position, total } = props;
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const scrimOpacity = useTransform(x, (value) => {
    const width = panelRef.current?.offsetWidth ?? 448;
    return Math.max(0, 1 - value / width);
  });
  const dragging = useRef(false);

  // Escape closes; arrow keys step between leads when not typing.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      const typing = event.target instanceof HTMLElement && event.target.closest("textarea, input");
      if (typing || !onStep) return;
      if (event.key === "ArrowDown" || event.key === "j") onStep(1);
      if (event.key === "ArrowUp" || event.key === "k") onStep(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  function onPanStart(event: PointerEvent, info: PanInfo) {
    // Only claim clearly horizontal drags that do not start on a control.
    dragging.current =
      !isInteractive(event.target) && Math.abs(info.offset.x) > Math.abs(info.offset.y);
  }

  function onPan(_event: PointerEvent, info: PanInfo) {
    if (!dragging.current) return;
    const width = panelRef.current?.offsetWidth ?? 448;
    const offset = info.offset.x;
    // 1:1 toward the dismiss edge, rubber-band the other way.
    x.set(offset >= 0 ? offset : rubberband(offset, width));
  }

  function onPanEnd(_event: PointerEvent, info: PanInfo) {
    if (!dragging.current) return;
    dragging.current = false;
    const width = panelRef.current?.offsetWidth ?? 448;
    const velocity = info.velocity.x;
    const projected = x.get() + project(velocity);

    if (projected > width / 2 && velocity > -200) {
      // Hand off the finger's velocity so there is no seam, then close.
      animate(x, width, { ...momentumSpring, bounce: 0, velocity }).then(onClose);
    } else {
      animate(x, 0, { ...momentumSpring, velocity });
    }
  }

  return (
    <>
      {/* Scrim on small screens only: there the drawer is modal. On large
          screens it is a parallel panel and the table stays usable. */}
      <motion.div
        className="fixed inset-0 z-40 lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        aria-hidden="true"
      >
        <motion.div className="h-full w-full bg-scrim" style={{ opacity: scrimOpacity }} />
      </motion.div>
      {/* Outer layer: enters from and exits to the right edge.
          Inner layer: follows the drag gesture. */}
      <motion.div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[var(--drawer-width)] lg:inset-y-2 lg:right-2"
        initial={reduceMotion ? { opacity: 0 } : { x: "100%", opacity: 1 }}
        animate={reduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { x: "105%" }}
        transition={spring}
      >
      <motion.aside
        ref={panelRef}
        role="dialog"
        aria-label={`Lead details: ${lead.company}`}
        tabIndex={-1}
        className="flex h-full w-full touch-pan-y flex-col bg-surface shadow-sheet outline-none sm:rounded-l-sheet lg:rounded-sheet"
        style={{ x }}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
      >
        {/* Grab affordance. */}
        <div
          className="absolute top-1/2 left-1.5 hidden h-10 w-1 -translate-y-1/2 rounded-full bg-fill-2 sm:block"
          aria-hidden="true"
        />

        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-separator px-4 sm:px-5">
          <p className="type-meta tabular">
            Lead {position} of {total}
          </p>
          <div className="ml-auto flex items-center gap-0.5">
            {onStep ? (
              <>
                <IconButton label="Previous lead" onClick={() => onStep(-1)} disabled={position <= 1}>
                  <ChevronUp className="size-[1.125rem]" strokeWidth={2} />
                </IconButton>
                <IconButton label="Next lead" onClick={() => onStep(1)} disabled={position >= total}>
                  <ChevronDown className="size-[1.125rem]" strokeWidth={2} />
                </IconButton>
                <span className="mx-1 h-5 w-px bg-separator" aria-hidden="true" />
              </>
            ) : null}
            <IconButton label="Close lead details" onClick={onClose}>
              <X className="size-[1.125rem]" strokeWidth={2} />
            </IconButton>
          </div>
        </header>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={lead.id}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ ...spring, opacity: { duration: 0.18 } }}
          >
            <DrawerBody {...props} />
          </motion.div>
        </AnimatePresence>

        <DrawerFooter {...props} />
      </motion.aside>
      </motion.div>
    </>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="pressable focus-ring inline-flex size-8 items-center justify-center rounded-full text-fg-2 hover:bg-fill hover:text-fg disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Section({
  title,
  children,
  aside,
}: {
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="type-eyebrow">{title}</h3>
        {aside ? <div className="ml-auto">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

function DrawerBody({ lead, message, onMessageChange, isSaving, error }: DrawerProps) {
  const running = isActive(lead.status) || lead.status === "queued";
  const canEdit = lead.status === "done";
  const hasUnsavedChanges = message !== (lead.message ?? "");

  return (
    <div className="px-4 pt-5 pb-8 sm:px-6">
      {/* Identity */}
      <div className="flex items-start gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[0.875rem] bg-fill-2 text-[0.9375rem] font-semibold text-fg-2">
          {initials(lead.company)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="type-display truncate text-[1.5rem]">{lead.company}</h2>
          <p className="mt-0.5 truncate text-[0.875rem] text-fg-2">
            {lead.contactName} · {lead.title}
          </p>
          <a
            className="focus-ring mt-1 inline-flex items-center gap-0.5 rounded text-[0.8125rem] font-medium text-accent hover:underline"
            href={lead.website}
            target="_blank"
            rel="noreferrer"
          >
            {domain(lead.website)}
            <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </div>

      {lead.error ? (
        <div
          className="mt-5 flex gap-2.5 rounded-btn bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-3 text-[0.8125rem] text-danger"
          role="alert"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <div>
            <p className="font-medium">The website couldn’t be researched.</p>
            <p className="mt-0.5 opacity-90">{lead.error}</p>
          </div>
        </div>
      ) : null}

      {running ? (
        <div className="mt-5 rounded-card bg-surface-2 p-4 ring-1 ring-separator">
          <p className="mb-3 text-[0.8125rem] font-medium">
            {lead.status === "queued" ? "Waiting in the queue" : "Scout is researching this lead"}
          </p>
          <PipelineProgress status={lead.status} variant="detail" />
        </div>
      ) : null}

      {/* Score */}
      {lead.score !== null && lead.tier ? (
        <motion.section
          className="mt-5 rounded-card bg-surface-2 p-4 ring-1 ring-separator"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <span className="type-display tabular text-[2.5rem]">{lead.score}</span>
            <div className="leading-tight">
              <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-medium ${tierTone[lead.tier]}`}>
                <span className={`size-1.5 rounded-full ${tierDot[lead.tier]}`} aria-hidden="true" />
                {lead.tier === "Hot" ? "Strong fit" : lead.tier === "Warm" ? "Good fit" : "Weak fit"}
              </span>
              <p className="mt-1 text-xs text-fg-2">
                {lead.score >= THRESHOLD ? "Above" : "Below"} the {THRESHOLD}-point outreach threshold
              </p>
            </div>
          </div>
          <div className="relative mt-4 h-1.5 rounded-full bg-fill-2">
            <motion.div
              className={`absolute inset-y-0 left-0 w-full origin-left rounded-full ${tierDot[lead.tier]}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: lead.score / 100 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            />
            <span
              className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-fg-3"
              style={{ left: `${THRESHOLD}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="tabular relative mt-1.5 h-4 text-[0.6875rem] text-fg-3" aria-hidden="true">
            <span className="absolute left-0">0</span>
            <span className="absolute -translate-x-1/2 font-medium text-fg-2" style={{ left: `${THRESHOLD}%` }}>
              {THRESHOLD}
            </span>
            <span className="absolute right-0">100</span>
          </div>
        </motion.section>
      ) : null}

      {/* Research findings */}
      <Section title="Research findings">
        {lead.summary ? (
          <>
            <p className="text-[0.9375rem] leading-relaxed">{lead.summary}</p>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Fact icon={<Building2 className="size-3.5" strokeWidth={2} />} label="Industry" value={lead.industry} />
              <Fact icon={<Users className="size-3.5" strokeWidth={2} />} label="Size signal" value={lead.sizeSignal} />
            </dl>
          </>
        ) : running ? (
          <SkeletonLines lines={3} />
        ) : (
          <p className="text-[0.875rem] text-fg-2">No findings for this lead.</p>
        )}
      </Section>

      {/* Score reasoning */}
      <Section title={lead.score !== null ? `Why ${lead.score}` : "Score reasoning"}>
        {lead.reasons?.length ? (
          <ul className="space-y-2">
            {lead.reasons.slice(0, 3).map((reason, index) => (
              <motion.li
                key={reason}
                className="flex gap-2.5 text-[0.875rem] leading-snug"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.05 * index }}
              >
                <span className="tabular mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-fill-2 text-[0.6875rem] font-semibold text-fg-2">
                  {index + 1}
                </span>
                <span>{reason}</span>
              </motion.li>
            ))}
          </ul>
        ) : running ? (
          <SkeletonLines lines={2} />
        ) : (
          <p className="text-[0.875rem] text-fg-2">Not available.</p>
        )}
      </Section>

      {/* Outreach draft */}
      <Section
        title="Outreach draft"
        aside={canEdit ? <CopyButton text={message} /> : null}
      >
        <div className="overflow-hidden rounded-card bg-surface ring-1 ring-separator focus-within:ring-2 focus-within:ring-accent">
          <div className="flex items-center gap-2 border-b border-separator px-3.5 py-2.5 text-[0.8125rem]">
            <Mail className="size-3.5 shrink-0 text-fg-3" strokeWidth={2} aria-hidden="true" />
            <span className="text-fg-3">To</span>
            <span className="truncate font-medium">{lead.contactName}</span>
            <span className="truncate text-fg-2">&lt;{lead.email}&gt;</span>
          </div>
          {running && !message ? (
            <div className="p-3.5">
              <SkeletonLines lines={2} />
            </div>
          ) : (
            <>
              <label htmlFor="outreach-message" className="sr-only">
                Outreach opener
              </label>
              <textarea
                id="outreach-message"
                className="block min-h-28 w-full resize-none bg-transparent px-3.5 py-3 text-[0.9375rem] leading-relaxed outline-none placeholder:text-fg-3 disabled:text-fg-2"
                disabled={!canEdit || isSaving}
                maxLength={300}
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                placeholder={canEdit ? "Write an outreach opener…" : "Available after processing"}
              />
            </>
          )}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-fg-3">
          <AnimatePresence>
            {hasUnsavedChanges ? (
              <motion.span
                className="flex items-center gap-1.5 text-warning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
                Unsaved changes
              </motion.span>
            ) : (
              <span />
            )}
          </AnimatePresence>
          <span className="tabular">{message.length} / 300</span>
        </div>

        {error ? (
          <p className="mt-2 text-[0.8125rem] text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </Section>
    </div>
  );
}

function DrawerFooter({ lead, isSaving, onSave, onApprove }: DrawerProps) {
  const canEdit = lead.status === "done";
  return (
    <footer className="flex shrink-0 gap-2 border-t border-separator px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
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
        {lead.approved ? (
          <>
            <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
            Approved
          </>
        ) : (
          "Approve and next"
        )}
      </Button>
    </footer>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="rounded-btn bg-fill px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs text-fg-3">
        <span aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 text-[0.8125rem] leading-snug">{value ?? "–"}</dd>
    </div>
  );
}

function SkeletonLines({ lines }: { lines: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <div key={index} className="skeleton h-3.5" style={{ width: `${index === lines - 1 ? 62 : 100 - index * 6}%` }} />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(event: ReactPointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; nothing to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!text}
      className="pressable focus-ring inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-accent hover:bg-accent-soft disabled:opacity-40"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "done" : "copy"}
          className="inline-flex items-center gap-1"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {copied ? <Check className="size-3.5" strokeWidth={2.5} /> : <Copy className="size-3.5" strokeWidth={2} />}
          {copied ? "Copied" : "Copy"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
