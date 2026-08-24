import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/data/projects";

const statusLabels: Record<ProjectStatus, string> = {
  prototype: "Prototype",
  "in-progress": "In progress",
  shipped: "Shipped",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-muted-strong",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "shipped" ? "bg-accent" : "bg-muted"
        )}
      />
      {statusLabels[status]}
    </span>
  );
}
