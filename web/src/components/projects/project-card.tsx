"use client";

import Link from "next/link";
import type { Project } from "@/data/projects";
import { ProjectVisual } from "@/components/projects/project-visual";
import { StatusBadge } from "@/components/projects/status-badge";
import { trackEvent } from "@/lib/analytics";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      onClick={() => trackEvent("project_view", { slug: project.slug })}
      className="group flex flex-col gap-4 rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <ProjectVisual
        title={project.title}
        categories={project.categories}
        className="transition-colors group-hover:border-border-strong"
      />
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-foreground">{project.title}</h3>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-sm text-muted-strong">{project.summary}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {project.categories.map((category) => (
            <span key={category} className="text-xs text-muted">
              {category}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
