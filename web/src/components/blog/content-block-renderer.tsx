import type { ContentBlock } from "@/data/blog";

export function ContentBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={index} className="pt-4 text-xl font-medium text-foreground">
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={index} className="text-base leading-relaxed text-muted-strong">
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={index} className="flex flex-col gap-2 pl-1">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="text-base leading-relaxed text-muted-strong before:mr-2 before:text-accent before:content-['—']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-sm text-foreground"
              >
                <code>{block.code}</code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
