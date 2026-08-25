import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";
import { HeroSystemGraph } from "@/components/sections/hero-system-graph";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="gradient-glow pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] opacity-40 blur-2xl"
      />
      <Container className="relative flex flex-col gap-6 py-16 md:py-24">
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

        <Reveal delay={0.2}>
          <div className="pt-6">
            <HeroSystemGraph />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
