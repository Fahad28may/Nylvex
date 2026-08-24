export type CapabilityGroup = {
  title: string;
  description: string;
  items: string[];
};

export const capabilityGroups: CapabilityGroup[] = [
  {
    title: "AI Engineering",
    description: "Building applications on top of language models, not just prompting them.",
    items: [
      "LLM applications",
      "AI agents",
      "RAG systems",
      "Tool calling",
      "Structured outputs",
      "AI evaluation",
      "AI integrations",
    ],
  },
  {
    title: "Software Engineering",
    description: "The infrastructure that makes AI features reliable in production.",
    items: [
      "Python",
      "FastAPI",
      "REST APIs",
      "Asynchronous systems",
      "Databases",
      "Background processing",
      "Authentication",
      "System architecture",
    ],
  },
  {
    title: "Intelligent Applications",
    description: "Products where intelligence is the core feature, not a bolt-on.",
    items: [
      "AI SaaS",
      "Knowledge systems",
      "Computer vision",
      "Voice AI",
      "Recommendation systems",
      "Intelligent interfaces",
    ],
  },
  {
    title: "Automation",
    description: "Connecting systems together so work happens without manual steps.",
    items: [
      "API integrations",
      "Event-driven workflows",
      "Workflow automation",
      "Webhooks",
      "Business process automation",
    ],
  },
  {
    title: "Product Engineering",
    description: "Taking an idea from architecture to a deployed, iterating product.",
    items: ["Architecture", "Prototyping", "MVP development", "Deployment", "Iteration"],
  },
];

export const technologies = [
  "Python",
  "FastAPI",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Next.js",
  "TypeScript",
  "PyTorch",
  "Hugging Face",
  "OpenAI",
  "Anthropic",
  "MCP",
  "n8n",
];
