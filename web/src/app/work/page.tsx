import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { getAllProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Systems and products built across AI, software engineering, and intelligent applications.",
};

export default function WorkPage() {
  const projects = getAllProjects();

  return (
    <Container className="flex flex-col gap-14 py-20 md:py-28">
      <SectionHeading
        eyebrow="Work"
        title="Selected work"
        description="Systems and products built across AI, software engineering, and intelligent applications."
        level="h1"
      />

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Container>
  );
}
