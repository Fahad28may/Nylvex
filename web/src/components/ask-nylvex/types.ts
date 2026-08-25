export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  relevantProjectSlugs?: string[];
  relevantCapabilities?: string[];
  architectureSteps?: string[];
  suggestStartProject?: boolean;
};

export const QUICK_REPLIES = [
  "I need an AI agent",
  "I want to automate a workflow",
  "I want to build an AI SaaS",
  "I need a custom AI application",
  "Show me your work",
  "I have an idea",
] as const;
