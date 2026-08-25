import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";

export function Cta() {
  return (
    <section className="py-16 md:py-20">
      <Container className="flex flex-col items-start gap-6">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Have a problem worth solving?
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="max-w-xl text-lg text-muted-strong">
            Tell me what you&apos;re trying to build. I&apos;ll help determine the right
            technical approach.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Button href="/contact">Start a project</Button>
        </Reveal>
      </Container>
    </section>
  );
}
