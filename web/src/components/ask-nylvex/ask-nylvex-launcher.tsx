"use client";

import { useState } from "react";
import { AskNylvexPanel } from "@/components/ask-nylvex/ask-nylvex-panel";

export function AskNylvexLauncher({ configured }: { configured: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 rounded-full border border-border-strong bg-surface px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-strong shadow-lg transition-colors hover:text-foreground"
      >
        Ask Nylvex
      </button>

      {open ? (
        <AskNylvexPanel configured={configured} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
