import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base text-muted-strong md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
