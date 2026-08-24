"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DURATION } from "@/lib/motion";
import type { CapabilityGroup } from "@/data/capabilities";

export function CapabilitiesExplorer({ groups }: { groups: CapabilityGroup[] }) {
  const [active, setActive] = useState(0);
  const group = groups[active];

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr] md:gap-16">
      <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
        {groups.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onMouseEnter={() => setActive(index)}
            onClick={() => setActive(index)}
            className={cn(
              "shrink-0 rounded-md border-l-2 px-4 py-3 text-left text-sm transition-colors duration-200 md:border-l-2 md:px-4",
              active === index
                ? "border-accent bg-surface text-foreground"
                : "border-transparent text-muted-strong hover:text-foreground"
            )}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="min-h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: DURATION.base }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-medium text-foreground">{group.title}</h2>
              <p className="text-sm text-muted-strong">{group.description}</p>
            </div>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border px-3.5 py-2.5 text-sm text-muted-strong"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
