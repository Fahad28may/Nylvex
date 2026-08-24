import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="border-b border-border">
      <Container className="flex flex-col gap-8 py-24 md:py-36">
        <Reveal>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
            {siteConfig.eyebrow}
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {siteConfig.headline}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="max-w-xl text-lg text-muted-strong">{siteConfig.subheadline}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button href="/work">Explore the work</Button>
            <Button href="/contact" variant="secondary">
              Start a project
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
