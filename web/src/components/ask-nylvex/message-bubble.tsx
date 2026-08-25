import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/components/ask-nylvex/types";
import {
  ArchitectureSteps,
  CapabilityTags,
  ProjectRecommendations,
  StartProjectPrompt,
} from "@/components/ask-nylvex/message-extras";

export function MessageBubble({
  message,
  onNavigate,
  onStartProject,
}: {
  message: ChatMessage;
  onNavigate: () => void;
  onStartProject: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-2.5", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-surface-hover text-foreground"
            : "border border-border bg-surface text-foreground"
        )}
      >
        {message.content}
      </div>

      {!isUser && message.architectureSteps && message.architectureSteps.length > 0 ? (
        <div className="w-full max-w-[88%]">
          <ArchitectureSteps steps={message.architectureSteps} />
        </div>
      ) : null}

      {!isUser && message.relevantCapabilities && message.relevantCapabilities.length > 0 ? (
        <div className="w-full max-w-[88%]">
          <CapabilityTags items={message.relevantCapabilities} />
        </div>
      ) : null}

      {!isUser && message.relevantProjectSlugs && message.relevantProjectSlugs.length > 0 ? (
        <div className="w-full max-w-[88%]">
          <ProjectRecommendations slugs={message.relevantProjectSlugs} onNavigate={onNavigate} />
        </div>
      ) : null}

      {!isUser && message.suggestStartProject ? (
        <div className="w-full max-w-[88%]">
          <StartProjectPrompt onStart={onStartProject} />
        </div>
      ) : null}
    </div>
  );
}
