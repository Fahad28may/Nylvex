"use client";

import { useState } from "react";
import type { ArchitectureNode } from "@/data/projects";
import { cn } from "@/lib/utils";

type NodeProps = {
  node: ArchitectureNode;
  id: string;
  activeId: string | null;
  onActivate: (id: string, detail?: string) => void;
  onDeactivate: () => void;
};

function hasActiveChild(node: ArchitectureNode, id: string, activeId: string | null) {
  if (!node.children) return false;
  return node.children.some((_, index) => `${id}-${index}` === activeId);
}

function Node({ node, id, activeId, onActivate, onDeactivate }: NodeProps) {
  const isActive = activeId === id;
  const connectorActive = isActive || hasActiveChild(node, id, activeId);

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onMouseEnter={() => onActivate(id, node.detail)}
        onMouseLeave={onDeactivate}
        onFocus={() => onActivate(id, node.detail)}
        onBlur={onDeactivate}
        onClick={() => onActivate(id, node.detail)}
        className={cn(
          "flex flex-col rounded-md border bg-surface px-4 py-3 text-left transition-colors duration-200",
          isActive ? "border-accent" : "border-border hover:border-border-strong"
        )}
      >
        <span
          className={cn(
            "font-mono text-sm transition-colors duration-200",
            isActive ? "text-accent" : "text-foreground"
          )}
        >
          {node.label}
        </span>
      </button>

      {node.children && node.children.length > 0 ? (
        <div
          className={cn(
            "ml-4 mt-2 flex flex-col gap-2 border-l pl-6 transition-colors duration-200",
            connectorActive ? "border-accent" : "border-border"
          )}
        >
          {node.children.map((child, index) => (
            <Node
              key={`${id}-${index}`}
              id={`${id}-${index}`}
              node={child}
              activeId={activeId}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
            />
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDetail, setActiveDetail] = useState<string | undefined>(undefined);

  const handleActivate = (id: string, detail?: string) => {
    setActiveId(id);
    setActiveDetail(detail);
  };

  const handleDeactivate = () => {
    setActiveId(null);
    setActiveDetail(undefined);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        {nodes.map((node, index) => (
          <Node
            key={index}
            id={String(index)}
            node={node}
            activeId={activeId}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
          />
        ))}
      </div>

      <p className="min-h-5 text-sm text-muted-strong" aria-live="polite">
        {activeDetail ?? "Hover or tap a node to see what it does."}
      </p>
    </div>
  );
}
