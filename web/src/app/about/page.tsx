import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nylvex is an AI and software engineering studio focused on building intelligent systems and practical software.",
};

export default function AboutPage() {
  return (
    <Container className="flex flex-col gap-20 py-20 md:py-28">
      <div className="flex flex-col gap-6">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Nylvex
        </span>
        <h1 className="max-w-2xl text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
          Nylvex is an AI and software engineering studio focused on building intelligent
          systems and practical software.
        </h1>
      </div>

      <div className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Built by Fahad
        </h2>
        <div className="flex max-w-2xl flex-col gap-4 text-base leading-relaxed text-muted-strong">
          <p>
            I&apos;m Fahad, a software engineer working across Python, AI systems, and
            full-stack application development. Nylvex is where that work lives — AI agents,
            RAG systems, computer vision, and the backend infrastructure that makes them
            reliable in production.
          </p>
          <p>
            I care about building systems that hold up under real usage, not just demos —
            which means thinking through data flow, failure modes, and architecture before
            writing application code.
          </p>
        </div>

        <div className="flex gap-6 pt-2">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            Email
          </a>
        </div>
      </div>
    </Container>
  );
}
