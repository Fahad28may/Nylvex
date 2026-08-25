import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/animations/reveal";

export function AboutPreview() {
  return (
    <section className="border-b border-border py-14 md:py-16">
      <Container className="flex flex-col gap-6">
        <Reveal>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
            Built by Fahad
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="max-w-2xl text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
            Nylvex is an AI and software engineering studio focused on building intelligent
            systems and practical software.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href="/about"
            className="text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            More about Nylvex →
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
