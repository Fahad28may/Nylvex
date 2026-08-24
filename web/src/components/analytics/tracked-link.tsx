"use client";

import Link from "next/link";
import type { AnalyticsEvent } from "@/lib/analytics";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function TrackedLink({
  event,
  properties,
  href,
  className,
  target,
  rel,
  children,
}: {
  event: AnalyticsEvent;
  properties?: Record<string, unknown>;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={cn(className)}
        onClick={() => trackEvent(event, properties)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(className)} onClick={() => trackEvent(event, properties)}>
      {children}
    </Link>
  );
}
