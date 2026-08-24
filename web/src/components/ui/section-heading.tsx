import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  level = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  level?: "h1" | "h2";
  className?: string;
}) {
  const Heading = level;

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
      <Heading className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        {title}
      </Heading>
      {description ? (
        <p className="max-w-2xl text-base text-muted-strong md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
