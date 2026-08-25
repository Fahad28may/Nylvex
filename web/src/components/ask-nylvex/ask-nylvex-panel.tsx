"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageBubble } from "@/components/ask-nylvex/message-bubble";
import { QuickReplies } from "@/components/ask-nylvex/quick-replies";
import { TypingIndicator } from "@/components/ask-nylvex/typing-indicator";
import type { ChatMessage } from "@/components/ask-nylvex/types";
import { trackEvent } from "@/lib/analytics";
import { writeChatHandoff } from "@/lib/chat-handoff";

export function AskNylvexPanel({
  configured,
  onClose,
}: {
  configured: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (!hasStarted.current) {
      hasStarted.current = true;
      trackEvent("chat_started");
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ask-nylvex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          relevantProjectSlugs: data.relevantProjectSlugs,
          relevantCapabilities: data.relevantCapabilities,
          architectureSteps: data.architectureSteps,
          suggestStartProject: data.suggestStartProject,
        },
      ]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleStartProject() {
    const summary = messages
      .filter((m) => m.role === "user")
      .map((m) => `- ${m.content}`)
      .join("\n");

    writeChatHandoff(summary);
    trackEvent("chat_handoff");
    onClose();
    router.push("/contact");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Ask Nylvex"
      className="fixed inset-x-4 bottom-20 z-50 flex max-h-[75vh] flex-col overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[26rem]"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="gradient-accent-text font-mono text-xs uppercase tracking-widest">
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
        <div className="p-4">
          <p className="text-sm leading-relaxed text-muted-strong">
            Ask Nylvex will help you explore Nylvex&apos;s capabilities, discover relevant
            projects, and sketch an approach for an idea. It isn&apos;t connected yet — check
            back soon, or browse{" "}
            <Link href="/work" className="text-accent underline underline-offset-2">
              the work
            </Link>{" "}
            in the meantime.
          </p>
        </div>
      ) : (
        <>
          <div ref={listRef} className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <QuickReplies onSelect={sendMessage} />
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    onNavigate={onClose}
                    onStartProject={handleStartProject}
                  />
                ))}
                {loading ? <TypingIndicator /> : null}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border p-3">
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  messages.length === 0 ? "Or describe your idea..." : "Ask a follow-up..."
                }
                maxLength={800}
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus-visible:border-accent"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="gradient-accent shrink-0 rounded-full px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
