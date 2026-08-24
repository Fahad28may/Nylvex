import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { capabilityGroups, technologies } from "@/data/capabilities";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "Capabilities organized around problems and systems — AI engineering, software engineering, intelligent applications, automation, and product engineering.",
};

export default function CapabilitiesPage() {
  return (
    <Container className="flex flex-col gap-20 py-20 md:py-28">
      <SectionHeading
        eyebrow="Capabilities"
        title="What gets built"
        description="Capabilities organized around problems and systems, not a list of buzzwords."
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {capabilityGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-4 border-t border-border pt-6">
            <h2 className="text-lg font-medium text-foreground">{group.title}</h2>
            <p className="text-sm text-muted-strong">{group.description}</p>
            <ul className="flex flex-col gap-2 pt-2">
              {group.items.map((item) => (
                <li key={item} className="text-sm text-muted-strong">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

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
    </Container>
  );
}
