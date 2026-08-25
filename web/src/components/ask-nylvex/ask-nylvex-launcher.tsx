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
        aria-label={open ? "Close Ask Nylvex" : "Ask Nylvex"}
        className="gradient-accent fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full text-accent-foreground shadow-[0_0_28px_-6px_var(--gradient-end)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {open ? <CloseIcon /> : <SparkleIcon />}
      </button>

      {open ? (
        <AskNylvexPanel configured={configured} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 2l1.4 4.6L15 8l-4.6 1.4L9 14l-1.4-4.6L3 8l4.6-1.4L9 2z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
