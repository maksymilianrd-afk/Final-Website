/**
 * Static Cut keyframe slot — build spec §8. The 4-frame render sets for
 * Scenes 03/04/09 are pending from the 3D chat; until they land this renders
 * the same intentional placeholder language as MediaSlot.
 */
export function StaticFrame({
  id,
  alt,
  aspect,
  frame = 1,
  className,
}: {
  id: string;
  alt: string;
  aspect: number;
  frame?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  // When the stills land at /public/frames/{id}_k{1..4}.webp, this component
  // switches to rendering them — no call-site changes.
  return (
    <div
      role="img"
      aria-label={`${alt} (render in production)`}
      className={`relative overflow-hidden border hairline bg-bone-deep ${className ?? ""}`}
      style={{ aspectRatio: aspect }}
    >
      <div className="absolute inset-0 flex items-end p-4">
        <span className="mono-label text-ink/40">
          {id}_k{frame} · RENDER IN PRODUCTION
        </span>
      </div>
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-ink/10"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.25" />
      </svg>
    </div>
  );
}
