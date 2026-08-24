"use client";

import { useState } from "react";
import Link from "next/link";
import { AnswerText } from "@/components/ask-nylvex/answer-text";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "answered" | "error";

export function AskNylvexPanel({
  configured,
  onClose,
}: {
  configured: boolean;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!question.trim() || status === "loading") return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/ask-nylvex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setAnswer(data.answer);
      setStatus("answered");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Ask Nylvex"
      className="fixed inset-x-4 bottom-20 z-50 flex max-h-[70vh] flex-col gap-4 overflow-y-auto rounded-lg border border-border-strong bg-surface p-5 shadow-lg sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-96"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          Ask Nylvex
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-muted-strong hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {!configured ? (
        <p className="text-sm leading-relaxed text-muted-strong">
          Ask Nylvex will answer questions about Nylvex&apos;s capabilities and projects and
          point you to the right case study. It isn&apos;t connected yet — check back soon, or
          browse{" "}
          <Link href="/work" className="text-accent underline underline-offset-2">
            the work
          </Link>{" "}
          in the meantime.
        </p>
      ) : (
        <>
          {status === "answered" ? (
            <AnswerText text={answer} />
          ) : status === "error" ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <p className="text-sm text-muted-strong">
              Ask about Nylvex&apos;s capabilities, technologies, or which project fits a
              problem you&apos;re solving.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. I need an AI support system for my SaaS."
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus-visible:border-accent"
            />
            <button
              type="submit"
              disabled={status === "loading" || !question.trim()}
              className={cn(
                "self-start rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity",
                (status === "loading" || !question.trim()) && "opacity-50"
              )}
            >
              {status === "loading" ? "Thinking..." : "Ask"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
