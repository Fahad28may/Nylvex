"use client";

import Link from "next/link";
import type { Project } from "@/data/projects";
import { ProjectVisual } from "@/components/projects/project-visual";
import { StatusBadge } from "@/components/projects/status-badge";
import { trackEvent } from "@/lib/analytics";

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index?: number;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      onClick={() => trackEvent("project_view", { slug: project.slug })}
      className="group flex flex-col gap-4 rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <div className="overflow-hidden rounded-lg">
        <ProjectVisual
          title={project.title}
          categories={project.categories}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:border-border-strong"
        />
      </div>
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            {typeof index === "number" ? (
              <span className="font-mono text-xs text-muted transition-colors duration-200 group-hover:text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
            ) : null}
            <h3 className="text-lg font-medium text-foreground underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 group-hover:decoration-accent">
              {project.title}
            </h3>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-sm text-muted-strong">{project.summary}</p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted opacity-70 transition-opacity duration-200 group-hover:opacity-100">
            {project.categories.map((category) => (
              <span key={category} className="text-xs">
                {category}
              </span>
            ))}
          </div>
          <span
            aria-hidden="true"
            className="text-sm text-muted-strong transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:text-foreground"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
