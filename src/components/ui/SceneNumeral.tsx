/**
 * The slate/clapperboard motif: giant scene numbers in --plush, barely darker
 * than the background, sitting behind content (creative direction §1.2).
 */
export function SceneNumeral({
  n,
  side = "right",
}: {
  n: string;
  side?: "left" | "right";
}) {
  return (
    <span
      aria-hidden
      className={`slate-numeral absolute top-8 -z-10 ${
        side === "right" ? "right-[-2vw]" : "left-[-2vw]"
      }`}
    >
      {n}
    </span>
  );
}
