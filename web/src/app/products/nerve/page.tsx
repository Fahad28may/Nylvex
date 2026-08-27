import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { RequestConsultationButton } from "@/components/products/request-consultation-button";
import { getProductBySlug } from "@/data/products";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Nerve",
  description: "Nerve is an AI Business Operator built to run business conversations on WhatsApp.",
};

export default async function NervePage() {
  const product = getProductBySlug("nerve");
  if (!product) notFound();

  const session = await auth();
  const requestNerveHref = session ? "/dashboard" : "/login?callbackUrl=%2Fdashboard";

  return (
    <Container className="flex flex-col gap-16 py-14 md:py-20">
      <div className="flex flex-col gap-5">
        <Tag>{product.tagline}</Tag>
        <h1 className="max-w-2xl text-3xl font-medium tracking-tight text-foreground md:text-5xl">
          {product.name}
        </h1>
        <p className="max-w-2xl text-base text-muted-strong md:text-lg">{product.summary}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={requestNerveHref}>Request Nerve</Button>
          <RequestConsultationButton productName={product.name} variant="secondary" />
        </div>
        <p className="max-w-xl text-xs text-muted">
          Requesting Nerve starts the process from your Nylvex dashboard — it doesn&apos;t fully
          deploy Nerve automatically. WhatsApp connection and the rest of your business setup are
          completed with our team afterward.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-medium text-foreground">Who it&apos;s for</h2>
          <p className="text-sm text-muted-strong">
            Businesses that field a steady stream of customer questions over WhatsApp — and want
            those conversations handled by something that actually knows the business, not a
            generic chatbot.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-medium text-foreground">How it works</h2>
          <p className="text-sm text-muted-strong">
            A business configures Nerve with its own information. Customers message the business
            on WhatsApp; Nerve reads the conversation history, answers using that business&apos;s
            configuration, and keeps a persistent record of every customer and conversation.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-medium text-foreground">What Nerve does today</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {product.capabilitiesNow.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-muted-strong"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-medium text-foreground">Coming next</h2>
        <p className="max-w-2xl text-sm text-muted-strong">
          These are on the roadmap, not available yet — Nerve is designed to grow into them
          without changing how a business already uses it.
        </p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {product.capabilitiesNext.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full border border-muted" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-start gap-5 rounded-lg border border-border bg-surface px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-medium text-foreground">
          Want Nerve running for your business?
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={requestNerveHref}>Request Nerve</Button>
          <RequestConsultationButton productName={product.name} variant="secondary" />
        </div>
      </div>
    </Container>
  );
}
