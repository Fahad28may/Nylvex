import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { WorkArchive } from "@/components/work/work-archive";
import { getAllProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Systems and products built across AI, software engineering, and intelligent applications.",
};

export default function WorkPage() {
  const projects = getAllProjects();

  return (
    <Container className="flex flex-col gap-10 py-14 md:py-20">
      <SectionHeading
        eyebrow="Work"
        title="Selected work"
        description="Systems and products built across AI, software engineering, and intelligent applications."
        level="h1"
      />

      <WorkArchive projects={projects} />
    </Container>
  );
}
