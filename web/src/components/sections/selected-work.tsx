import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal } from "@/components/animations/reveal";
import { getFeaturedProjects } from "@/data/projects";

export function SelectedWork() {
  const projects = getFeaturedProjects();

  return (
    <section className="border-b border-border py-24 md:py-28">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Selected work"
            title="Systems built end to end"
            description="Systems and products built across AI, software engineering, and intelligent applications."
          />
          <Link
            href="/work"
            className="whitespace-nowrap text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            View all work →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.05}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
