import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/animations/reveal";
import { capabilityGroups } from "@/data/capabilities";

export function CapabilitiesPreview() {
  const groups = capabilityGroups.slice(0, 3);

  return (
    <section className="border-b border-border py-24 md:py-28">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Capabilities"
            title="What gets built"
            description="Capabilities organized around problems and systems, not a list of buzzwords."
          />
          <Link
            href="/capabilities"
            className="whitespace-nowrap text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            View all capabilities →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {groups.map((group, index) => (
            <Reveal key={group.title} delay={index * 0.05}>
              <div className="flex h-full flex-col gap-4 rounded-lg border border-border p-6">
                <h3 className="text-base font-medium text-foreground">{group.title}</h3>
                <p className="text-sm text-muted-strong">{group.description}</p>
                <ul className="mt-auto flex flex-col gap-1.5 pt-4">
                  {group.items.slice(0, 4).map((item) => (
                    <li key={item} className="text-sm text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
