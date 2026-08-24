import { cn } from "@/lib/utils";

export function ProjectVisual({
  title,
  categories,
  className,
}: {
  title: string;
  categories: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[16/10] w-full items-end overflow-hidden rounded-lg border border-border bg-surface p-6",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <span className="pointer-events-none absolute right-5 top-5 font-mono text-[11px] uppercase tracking-widest text-muted">
        {categories[0]}
      </span>
      <span className="font-mono text-lg text-muted-strong">{title}</span>
    </div>
  );
}
