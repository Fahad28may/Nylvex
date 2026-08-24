import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { Reveal } from "@/components/animations/reveal";
import { getAllExperiments } from "@/data/lab";

export function LabPreview() {
  const experiments = getAllExperiments().slice(0, 3);

  return (
    <section className="border-b border-border py-24 md:py-28">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Nylvex Lab"
            title="Experiments in progress"
            description="Prototypes, research, and technical work that hasn't shipped as a full product yet."
          />
          <Link
            href="/lab"
            className="whitespace-nowrap text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            View the lab →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {experiments.map((experiment, index) => (
            <Reveal key={experiment.slug} delay={index * 0.05}>
              <div className="flex h-full flex-col gap-3 rounded-lg border border-border p-6">
                <Tag className="self-start font-mono text-[10px]">{experiment.status}</Tag>
                <h3 className="text-base font-medium text-foreground">{experiment.title}</h3>
                <p className="text-sm text-muted-strong">{experiment.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
