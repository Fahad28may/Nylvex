import { Button } from "@/components/ui/button";

export function InlineCta({
  title,
  ctaLabel = "Start a project",
  href = "/contact",
}: {
  title: string;
  ctaLabel?: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-lg border border-border bg-surface px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg font-medium text-foreground">{title}</p>
      <Button href={href}>{ctaLabel}</Button>
    </div>
  );
}
