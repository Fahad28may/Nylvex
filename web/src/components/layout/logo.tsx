import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-mono text-sm font-medium tracking-[0.18em] text-foreground ${className ?? ""}`}
      aria-label="Nylvex home"
    >
      NYLVEX
    </Link>
  );
}
