"use client";

import dynamic from "next/dynamic";

/** R3F/GSAP/Lenis load as a separate chunk after paint (perf budget §7) —
 * the server-rendered Static Cut never waits on the stage. */
const StageRoot = dynamic(
  () => import("./StageRoot").then((m) => m.StageRoot),
  { ssr: false },
);

export function StageMount() {
  return <StageRoot />;
}
