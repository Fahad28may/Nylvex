import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/animations/reveal";
import { getLatestPosts } from "@/data/blog";

export function InsightsPreview() {
  const posts = getLatestPosts(3);

  return (
    <section className="border-b border-border py-24 md:py-28">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Insights" title="Latest insights" />
          <Link
            href="/blog"
            className="whitespace-nowrap text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            Read all insights →
          </Link>
        </div>

        <div className="flex flex-col">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.05}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-1.5 border-t border-border py-6 transition-colors last:border-b hover:bg-surface"
              >
                <div className="flex flex-col gap-1.5 px-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="text-base font-medium text-foreground underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 group-hover:decoration-accent">
                    {post.title}
                  </h3>
                  <span className="whitespace-nowrap font-mono text-xs text-muted">
                    {post.category} · {post.readingTime}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
