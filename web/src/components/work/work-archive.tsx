"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectCard } from "@/components/projects/project-card";
import { cn } from "@/lib/utils";
import { DURATION, EASE_OUT } from "@/lib/motion";
import type { Project } from "@/data/projects";

const CATEGORIES = [
  "All",
  "AI",
  "Agents",
  "RAG",
  "Software",
  "Computer Vision",
  "Voice",
  "Automation",
] as const;

export function WorkArchive({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string>("All");

  const filtered =
    active === "All" ? projects : projects.filter((project) => project.categories.includes(active));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            aria-pressed={active === category}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200",
              active === category
                ? "border-accent text-accent"
                : "border-border-strong text-muted-strong hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-sm text-muted-strong">No projects in this category yet.</p>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DURATION.base, ease: EASE_OUT }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
