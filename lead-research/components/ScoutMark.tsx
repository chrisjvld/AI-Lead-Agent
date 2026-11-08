/** Scout logo mark: a rounded tile in the project tint with a simple scope glyph. */
export function ScoutMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="7.5" fill="var(--scout-tint)" />
      <circle cx="12.5" cy="12.5" r="5.25" fill="none" stroke="#fff" strokeWidth="2.1" />
      <path d="M16.6 16.6 21 21" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12.5" cy="12.5" r="1.6" fill="#fff" />
    </svg>
  );
}
