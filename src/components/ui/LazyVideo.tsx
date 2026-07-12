"use client";

import { useEffect, useRef } from "react";

/**
 * Video discipline per build spec §7: preload="none", upgrade when near the
 * viewport via IntersectionObserver, always muted/playsinline/loop/poster.
 * Honors prefers-reduced-motion by showing poster + native controls instead
 * of autoplaying.
 */
export function LazyVideo({
  src,
  poster,
  aspect,
  label,
  className,
}: {
  src: string;
  poster?: string;
  aspect: number;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      video.controls = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (video.preload === "none") video.preload = "auto";
            video.play().catch(() => {
              video.controls = true;
            });
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.6 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      playsInline
      loop
      preload="none"
      aria-label={label}
      className={`h-auto w-full object-cover ${className ?? ""}`}
      style={{ aspectRatio: aspect }}
    />
  );
}
