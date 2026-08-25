import { QUICK_REPLIES } from "@/components/ask-nylvex/types";

export function QuickReplies({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="gradient-accent-text font-mono text-xs uppercase tracking-widest">
          Ask Nylvex
        </span>
        <p className="text-base font-medium text-foreground">What are you trying to build?</p>
      </div>

      <div className="flex flex-col gap-2">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onSelect(reply)}
            className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-left text-sm text-muted-strong transition-colors hover:border-accent hover:text-foreground"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
