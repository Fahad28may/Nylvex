import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { getAllProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Products",
  description: "Software products built and operated by Nylvex.",
};

export default function ProductsPage() {
  const products = getAllProducts();

  return (
    <Container className="flex flex-col gap-10 py-14 md:py-20">
      <SectionHeading
        eyebrow="Products"
        title="Nylvex products"
        description="Standalone software products, built and operated by Nylvex."
        level="h1"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group flex flex-col gap-4 rounded-lg border border-border bg-surface p-8 transition-colors hover:border-border-strong"
          >
            <div className="flex flex-col gap-2">
              <Tag>{product.tagline}</Tag>
              <h2 className="text-2xl font-medium tracking-tight text-foreground">
                {product.name}
              </h2>
            </div>
            <p className="text-sm text-muted-strong">{product.summary}</p>
            <span
              aria-hidden="true"
              className="mt-auto text-sm text-muted-strong transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:text-foreground"
            >
              Learn more →
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
