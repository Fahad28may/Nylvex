export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2.5">
      <span className="sr-only">Ask Nylvex is thinking</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-strong"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}
