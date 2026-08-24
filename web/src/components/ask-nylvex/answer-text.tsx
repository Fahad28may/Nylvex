import Link from "next/link";
import { getProjectBySlug } from "@/data/projects";

const SLUG_PATTERN = /\[\[([a-z0-9-]+)\]\]/g;

export function AnswerText({ text }: { text: string }) {
  const parts = text.split(SLUG_PATTERN);

  return (
    <p className="text-sm leading-relaxed text-foreground">
      {parts.map((part, index) => {
        // Odd indices are the captured slug groups from the split above.
        if (index % 2 === 1) {
          const project = getProjectBySlug(part);
          if (project) {
            return (
              <Link
                key={index}
                href={`/work/${project.slug}`}
                className="text-accent underline underline-offset-2 hover:opacity-80"
              >
                {project.title}
              </Link>
            );
          }
          return null;
        }
        return part;
      })}
    </p>
  );
}
