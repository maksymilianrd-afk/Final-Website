/**
 * Wordmark + the product's side-profile line: bowl curve, clamp hook, screw
 * drop — the engineering-drawing motif from Scene 00. Static here; Phase 4
 * animates the stroke draw as the intro mark and the footer end-card.
 */
export function Wordmark({ withLine = true }: { withLine?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      {withLine ? <SilhouetteLine className="h-4 w-auto text-ink" /> : null}
      <span
        className="font-display text-[15px] font-bold tracking-tight"
        style={{ fontVariationSettings: "'wdth' 125" }}
      >
        DESKPAWS
      </span>
    </span>
  );
}

export function SilhouetteLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 28"
      fill="none"
      className={className}
    >
      {/* one pen stroke: shallow bowl → top plate → clamp body → screw drop */}
      <path
        d="M2 6 C4 18, 26 22, 38 14 C42 11.5, 44 8.5, 45 6 L62 6 M52 6 L52 14 M46 14 L52 14 M49 14 L49 24 M45.5 24 L52.5 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
