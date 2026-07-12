import type { MediaAsset } from "@/lib/media";
import { LazyVideo } from "./LazyVideo";

/**
 * Every media position on the page renders through this: a real asset when
 * the manifest has a URL, a labeled aspect-correct placeholder when pending
 * (build spec §9 — "labeled grey placeholder at correct aspect, keep building").
 */
export function MediaSlot({
  asset,
  className,
  sizes,
}: {
  asset: MediaAsset;
  className?: string;
  sizes?: string;
}) {
  if (asset.pending || !asset.src) {
    return (
      <div
        role="img"
        aria-label={`${asset.alt} (asset in production)`}
        className={`relative overflow-hidden border hairline bg-bone-deep ${className ?? ""}`}
        style={{ aspectRatio: asset.aspect }}
      >
        <div className="absolute inset-0 flex items-end p-4">
          <span className="mono-label text-ink/40">
            {asset.id} · IN PRODUCTION
          </span>
        </div>
        {/* quiet diagonal hairline, so the placeholder reads intentional */}
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

  if (asset.kind === "video") {
    return (
      <LazyVideo
        src={asset.src}
        poster={asset.poster}
        aspect={asset.aspect}
        label={asset.alt}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt={asset.alt}
      sizes={sizes}
      className={className}
      style={{ aspectRatio: asset.aspect }}
      loading="lazy"
      decoding="async"
    />
  );
}
