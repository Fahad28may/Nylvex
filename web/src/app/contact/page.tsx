import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell Nylvex what you're trying to build and get help finding the right technical approach.",
};

export default function ContactPage() {
  return (
    <Container className="flex flex-col gap-10 py-14 md:py-20">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Contact
        </span>
        <h1 className="max-w-2xl text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Have a problem worth solving?
        </h1>
        <p className="max-w-xl text-base text-muted-strong md:text-lg">
          Tell me what you&apos;re trying to build. I&apos;ll help determine the right
          technical approach.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <div className="flex flex-col gap-2 border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <span className="text-sm font-medium text-foreground">Prefer email?</span>
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            {siteConfig.email}
          </a>
        </div>
      </div>
    </Container>
  );
}
