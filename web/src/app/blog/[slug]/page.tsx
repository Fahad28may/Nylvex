import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Tag } from "@/components/ui/tag";
import { InlineCta } from "@/components/ui/inline-cta";
import { ContentBlockRenderer } from "@/components/blog/content-block-renderer";
import { getAllPosts, getPostBySlug } from "@/data/blog";
import { formatDate } from "@/lib/format-date";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <Container className="flex flex-col gap-16 py-20 md:py-28">
        <div className="flex flex-col gap-6">
          <Link href="/blog" className="text-sm text-muted-strong hover:text-foreground">
            ← Back to insights
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Tag>{post.category}</Tag>
            <span className="font-mono text-xs text-muted">
              {formatDate(post.publishedAt)} · {post.readingTime} · {post.author}
            </span>
          </div>

          <h1 className="max-w-3xl text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            {post.title}
          </h1>
          <p className="max-w-2xl text-lg text-muted-strong">{post.description}</p>

          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-2xl">
          <ContentBlockRenderer blocks={post.content} />
        </div>

        <InlineCta
          title="Have an AI problem you're trying to solve?"
          ctaLabel="Talk to Nylvex"
        />
      </Container>
    </article>
  );
}
