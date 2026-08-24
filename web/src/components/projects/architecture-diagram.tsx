import type { ArchitectureNode } from "@/data/projects";
import { cn } from "@/lib/utils";

function Node({ node, depth = 0 }: { node: ArchitectureNode; depth?: number }) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-col rounded-md border border-border bg-surface px-4 py-3">
        <span className="font-mono text-sm text-foreground">{node.label}</span>
        {node.detail ? (
          <span className="text-xs text-muted">{node.detail}</span>
        ) : null}
      </div>

      {node.children && node.children.length > 0 ? (
        <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-border pl-6">
          {node.children.map((child, index) => (
            <Node key={`${depth}-${index}-${child.label}`} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ArchitectureDiagram({
  nodes,
  className,
}: {
  nodes: ArchitectureNode[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {nodes.map((node, index) => (
        <Node key={`${index}-${node.label}`} node={node} />
      ))}
    </div>
  );
}
