import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Tag } from "@/components/ui/tag";
import { getAllPosts } from "@/data/blog";
import { formatDate } from "@/lib/format-date";

export const metadata: Metadata = {
  title: "Insights",
  description: "Ideas, experiments, and engineering notes from building intelligent systems.",
};

export default function BlogPage() {
  const [featured, ...rest] = getAllPosts();

  return (
    <Container className="flex flex-col gap-14 py-14 md:py-20">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Nylvex / Insights
        </span>
        <h1 className="max-w-2xl text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Ideas, experiments and engineering notes from building intelligent systems.
        </h1>
      </div>

      {featured ? (
        <Link
          href={`/blog/${featured.slug}`}
          className="group flex flex-col gap-4 rounded-lg border border-border p-8 transition-colors hover:border-border-strong hover:bg-surface"
        >
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Featured article
          </span>
          <h2 className="max-w-2xl text-2xl font-medium text-foreground underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 group-hover:decoration-accent">
            {featured.title}
          </h2>
          <p className="max-w-xl text-base text-muted-strong">{featured.description}</p>
          <div className="flex items-center gap-3 pt-2">
            <Tag>{featured.category}</Tag>
            <span className="font-mono text-xs text-muted">
              {formatDate(featured.publishedAt)} · {featured.readingTime}
            </span>
          </div>
        </Link>
      ) : null}

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Latest articles
        </h2>
        <div className="flex flex-col">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-1.5 border-t border-border py-6 transition-colors last:border-b hover:bg-surface"
            >
              <div className="flex flex-col gap-1.5 px-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-medium text-foreground underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 group-hover:decoration-accent">
                    {post.title}
                  </h3>
                  <p className="max-w-xl text-sm text-muted-strong">{post.description}</p>
                </div>
                <span className="whitespace-nowrap font-mono text-xs text-muted">
                  {formatDate(post.publishedAt)} · {post.readingTime}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
