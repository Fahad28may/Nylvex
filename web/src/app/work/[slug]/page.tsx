import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Tag } from "@/components/ui/tag";
import { buttonClasses } from "@/components/ui/button";
import { ProjectVisual } from "@/components/projects/project-visual";
import { StatusBadge } from "@/components/projects/status-badge";
import { ArchitectureDiagram } from "@/components/projects/architecture-diagram";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { getAllProjects, getProjectBySlug } from "@/data/projects";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="flex flex-col">
      <Container className="flex flex-col gap-8 py-20 md:py-28">
        <Link href="/work" className="text-sm text-muted-strong hover:text-foreground">
          ← Back to work
        </Link>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {project.categories.map((category) => (
              <Tag key={category}>{category}</Tag>
            ))}
            <StatusBadge status={project.status} />
          </div>

          <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-lg text-muted-strong">{project.summary}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            {project.demoUrl ? (
              <TrackedLink
                event="project_demo_click"
                properties={{ slug: project.slug }}
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonClasses("primary", "md")}
              >
                View live demo
              </TrackedLink>
            ) : null}
            {project.githubUrl ? (
              <TrackedLink
                event="github_click"
                properties={{ slug: project.slug }}
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonClasses("secondary", "md")}
              >
                View source
              </TrackedLink>
            ) : null}
          </div>
        </div>

        <ProjectVisual title={project.title} categories={project.categories} className="mt-4" />
      </Container>

      <Container className="flex flex-col gap-20 pb-28">
        <Section title="Problem">
          <p className="max-w-3xl text-base leading-relaxed text-muted-strong">
            {project.problem}
          </p>
        </Section>

        <Section title="Solution">
          <p className="max-w-3xl text-base leading-relaxed text-muted-strong">
            {project.solution}
          </p>
        </Section>

        <Section title="Architecture">
          <ArchitectureDiagram nodes={project.architecture} />
        </Section>

        <Section title="Engineering">
          <div className="flex flex-col gap-6">
            {project.decisions.map((item) => (
              <div key={item.decision} className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium text-foreground">{item.decision}</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-strong">
                  {item.reasoning}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Challenges">
          <ul className="flex max-w-3xl flex-col gap-3">
            {project.challenges.map((challenge) => (
              <li key={challenge} className="text-sm leading-relaxed text-muted-strong">
                {challenge}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Results">
          <p className="text-sm text-muted-strong">
            {project.results ?? "Prototype / experimental project — no production metrics yet."}
          </p>
        </Section>

        <Section title="Stack">
          <p className="text-sm text-muted-strong">{project.technologies.join(" · ")}</p>
        </Section>
      </Container>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 border-t border-border pt-10">
      <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">{title}</h2>
      {children}
    </div>
  );
}
