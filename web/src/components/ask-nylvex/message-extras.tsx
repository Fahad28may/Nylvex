import Link from "next/link";
import { getProjectBySlug } from "@/data/projects";
import { Button } from "@/components/ui/button";

export function ProjectRecommendations({
  slugs,
  onNavigate,
}: {
  slugs: string[];
  onNavigate: () => void;
}) {
  const projects = slugs.map(getProjectBySlug).filter((p): p is NonNullable<typeof p> => !!p);
  if (projects.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        Relevant Nylvex work
      </span>
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/work/${project.slug}`}
          onClick={onNavigate}
          className="group flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3.5 py-2.5 transition-colors hover:border-accent"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{project.title}</span>
            <span className="text-xs text-muted">{project.categories.join(" · ")}</span>
          </div>
          <span className="text-muted-strong transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      ))}
    </div>
  );
}

export function CapabilityTags({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        Relevant capabilities
      </span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-strong"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ArchitectureSteps({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col rounded-md border border-border bg-surface p-3">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col">
          <div className="flex items-start gap-2 py-1">
            <span className="font-mono text-xs text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-sm text-foreground">{step}</span>
          </div>
          {index < steps.length - 1 ? (
            <span className="pl-[calc(1.5rem-1px)] font-mono text-xs leading-none text-muted">
              ↓
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function StartProjectPrompt({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-gradient-to-r from-accent/10 to-transparent p-3">
      <span className="text-sm text-foreground">Want to discuss building it?</span>
      <Button size="sm" onClick={onStart} className="self-start">
        Start a project
      </Button>
    </div>
  );
}
