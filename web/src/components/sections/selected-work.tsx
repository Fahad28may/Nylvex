import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal } from "@/components/animations/reveal";
import { getFeaturedProjects } from "@/data/projects";

export function SelectedWork() {
  const projects = getFeaturedProjects().slice(0, 3);

  return (
    <section className="border-b border-border py-24 md:py-28">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Selected work"
            title="A few systems worth a closer look"
            description="A selection of systems and products built across AI and software engineering."
          />
          <Link
            href="/work"
            className="whitespace-nowrap text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            View all work →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.05}>
              <ProjectCard project={project} index={index} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
