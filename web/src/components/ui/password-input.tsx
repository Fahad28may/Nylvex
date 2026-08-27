"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const fieldStyles =
  "w-full rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus-visible:border-accent";

export function PasswordInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(fieldStyles, "pr-16", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 px-3.5 text-xs font-medium text-muted-strong transition-colors hover:text-foreground"
        tabIndex={-1}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
