"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navItems } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || open
          ? "border-border bg-background/85 backdrop-blur"
          : "border-transparent bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors",
                  active ? "text-foreground" : "text-muted-strong hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button href="/contact" size="sm">
            Start a project
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-foreground"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-4 w-5">
              <span
                className={cn(
                  "absolute left-0 top-0 block h-px w-5 bg-current transition-transform",
                  open && "translate-y-[7.5px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 block h-px w-5 -translate-y-1/2 bg-current transition-opacity",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 block h-px w-5 bg-current transition-transform",
                  open && "-translate-y-[7.5px] -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </Container>

      <div
        id="mobile-nav"
        className={cn(
          "grid overflow-hidden border-b border-border bg-background transition-[grid-template-rows] duration-300 ease-out md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <Container className="flex flex-col gap-1 py-4">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2 py-3 text-base transition-colors",
                    active ? "text-foreground" : "text-muted-strong hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button href="/contact" className="mt-3 w-full">
              Start a project
            </Button>
          </Container>
        </div>
      </div>
    </header>
  );
}
