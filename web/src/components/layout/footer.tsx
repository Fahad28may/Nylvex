import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { navItems, siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-sm text-sm text-muted">{siteConfig.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Site
            </span>
            {[...navItems, { label: "Contact", href: "/contact" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-strong transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Connect
            </span>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-sm text-muted-strong transition-colors hover:text-foreground"
            >
              Email
            </a>
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-muted-strong transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} Nylvex. All rights reserved.</span>
        <span>Built by Fahad.</span>
      </Container>
    </footer>
  );
}
