import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { InlineCta } from "@/components/ui/inline-cta";
import { CapabilitiesExplorer } from "@/components/capabilities/capabilities-explorer";
import { capabilityGroups, technologies } from "@/data/capabilities";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "Capabilities organized around problems and systems — AI engineering, software engineering, intelligent applications, automation, and product engineering.",
};

export default function CapabilitiesPage() {
  return (
    <Container className="flex flex-col gap-14 py-14 md:py-20">
      <SectionHeading
        eyebrow="Capabilities"
        title="What gets built"
        description="Capabilities organized around problems and systems, not a list of buzzwords."
        level="h1"
      />

      <CapabilitiesExplorer groups={capabilityGroups} />

      <div className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Technology
        </h2>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </div>

      <InlineCta title="Need a system like this?" />
    </Container>
  );
}
