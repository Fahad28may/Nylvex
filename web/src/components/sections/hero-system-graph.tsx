"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const nodes = [
  { label: "User", description: "Describes a problem in plain language." },
  { label: "AI", description: "Reasons about the request and plans steps." },
  { label: "Tools", description: "Calls the right APIs, functions, and data sources." },
  { label: "Data", description: "Reads and writes the systems of record." },
  { label: "Action", description: "Delivers a result back to the user." },
];

export function HeroSystemGraph() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center overflow-x-auto pb-1">
        {nodes.map((node, index) => (
          <div key={node.label} className="flex shrink-0 items-center">
            {index > 0 ? (
              <div
                className={cn(
                  "h-px w-4 shrink-0 bg-border-strong transition-colors duration-200 sm:w-10",
                  (active === index || active === index - 1) && "gradient-accent"
                )}
              />
            ) : null}
            <button
              type="button"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 font-mono text-xs transition-all duration-200 sm:text-sm",
                active === index
                  ? "gradient-accent border-transparent text-accent-foreground shadow-[0_0_20px_-6px_var(--gradient-end)]"
                  : "border-border-strong text-muted-strong hover:text-foreground"
              )}
            >
              {node.label}
            </button>
          </div>
        ))}
      </div>

      <p className="min-h-5 text-sm text-muted" aria-live="polite">
        {active !== null ? nodes[active].description : ""}
      </p>
    </div>
  );
}
