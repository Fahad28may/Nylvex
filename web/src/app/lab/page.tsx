import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getAllExperiments } from "@/data/lab";

export const metadata: Metadata = {
  title: "Lab",
  description: "Experiments, prototypes, and research from the Nylvex lab.",
};

export default function LabPage() {
  const experiments = getAllExperiments();

  return (
    <Container className="flex flex-col gap-14 py-20 md:py-28">
      <SectionHeading
        eyebrow="Nylvex Lab"
        title="Experiments in progress"
        description="Prototypes, research, and technical work that hasn't shipped as a full product yet."
        level="h1"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {experiments.map((experiment) => (
          <div
            key={experiment.slug}
            className="flex flex-col gap-3 rounded-lg border border-border p-6 transition-colors duration-200 hover:border-border-strong hover:bg-surface"
          >
            <Tag className="self-start font-mono text-[10px]">{experiment.status}</Tag>
            <h2 className="text-lg font-medium text-foreground">{experiment.title}</h2>
            <p className="text-sm text-muted-strong">{experiment.description}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {experiment.technology.map((tech) => (
                <span key={tech} className="text-xs text-muted">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {experiment.demoUrl ? (
                <TrackedLink
                  event="lab_demo_click"
                  properties={{ slug: experiment.slug }}
                  href={experiment.demoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted-strong transition-colors hover:text-foreground"
                >
                  Demo →
                </TrackedLink>
              ) : null}
              {experiment.githubUrl ? (
                <a
                  href={experiment.githubUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted-strong transition-colors hover:text-foreground"
                >
                  GitHub →
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
