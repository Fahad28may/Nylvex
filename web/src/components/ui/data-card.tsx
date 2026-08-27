import { cn } from "@/lib/utils";

export function DataCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg border border-border bg-surface p-6", className)}>
      {title || action ? (
        <div className="flex items-center justify-between gap-4">
          {title ? <h2 className="text-lg font-medium text-foreground">{title}</h2> : null}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}
