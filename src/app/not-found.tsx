import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-bone px-6 text-center">
      <h1 className="font-display text-[clamp(2rem,5vw,3.6rem)] font-bold tracking-tighter">
        This page wandered off.
        <br />
        Cats, probably.
      </h1>
      <Link
        href="/"
        className="rounded-full bg-ink px-6 py-3 text-bone transition-colors hover:bg-signal"
      >
        Back to the desk
      </Link>
    </main>
  );
}
