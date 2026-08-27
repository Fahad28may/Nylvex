import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "positive" | "warning" | "danger";

const dotStyles: Record<StatusTone, string> = {
  neutral: "bg-muted",
  positive: "bg-accent",
  warning: "bg-violet",
  danger: "bg-red-400",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-muted-strong",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[tone])} />
      {label}
    </span>
  );
}
