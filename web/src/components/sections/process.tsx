import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/animations/reveal";

const steps = [
  {
    number: "01",
    title: "Understand the problem",
    description:
      "Before any architecture decisions, the actual problem, constraints, and existing systems get mapped out.",
  },
  {
    number: "02",
    title: "Design the system",
    description:
      "Data flow, technology choices, and tradeoffs are decided upfront, not discovered mid-build.",
  },
  {
    number: "03",
    title: "Build incrementally",
    description:
      "Working software ships in stages, so direction can be corrected early instead of at the end.",
  },
  {
    number: "04",
    title: "Ship and iterate",
    description:
      "Deployed systems get monitored and refined based on real usage, not left as a one-time delivery.",
  },
];

export function Process() {
  return (
    <section className="border-b border-border py-24 md:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow="Process" title="How the work gets done" />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.05}>
              <div className="flex flex-col gap-3">
                <span className="font-mono text-sm text-accent">{step.number}</span>
                <h3 className="text-base font-medium text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-strong">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
