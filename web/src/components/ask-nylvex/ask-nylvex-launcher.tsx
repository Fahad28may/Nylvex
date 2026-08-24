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
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-surface text-muted-strong shadow-lg transition-colors hover:text-foreground sm:bottom-6 sm:right-6"
      >
        {open ? <CloseIcon /> : <AskIcon />}
      </button>

      {open ? (
        <AskNylvexPanel configured={configured} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function AskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.5A2 2 0 014.5 2.5h9a2 2 0 012 2v6a2 2 0 01-2 2H8l-3.2 2.4c-.4.3-.9 0-.9-.5V12.5h-1a2 2 0 01-2-2v-6z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
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
