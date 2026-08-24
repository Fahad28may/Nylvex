export type ExperimentStatus = "EXPERIMENT" | "PROTOTYPE" | "RESEARCH" | "BUILDING";

export type Experiment = {
  slug: string;
  title: string;
  description: string;
  technology: string[];
  status: ExperimentStatus;
  demoUrl?: string;
  githubUrl?: string;
};

export const experiments: Experiment[] = [
  {
    slug: "mcp-tool-router",
    title: "MCP tool router",
    description:
      "A routing layer that lets an agent select between many MCP tool servers without loading every tool schema into context at once.",
    technology: ["Python", "MCP"],
    status: "BUILDING",
    githubUrl: "https://github.com/Fahad28may",
  },
  {
    slug: "realtime-transcription-agent",
    title: "Realtime transcription agent",
    description:
      "Streaming speech-to-text piped directly into an agent loop to test end-to-end latency for voice-triggered actions.",
    technology: ["Python", "WebSockets"],
    status: "EXPERIMENT",
    githubUrl: "https://github.com/Fahad28may",
  },
  {
    slug: "document-chunking-eval",
    title: "Document chunking evaluation",
    description:
      "A small evaluation harness comparing chunking strategies for retrieval quality across different document types.",
    technology: ["Python", "pgvector"],
    status: "RESEARCH",
    githubUrl: "https://github.com/Fahad28may",
  },
  {
    slug: "lightweight-object-tracker",
    title: "Lightweight object tracker",
    description:
      "A minimal cross-frame object tracker built to run detection pipelines on modest hardware without a full tracking framework.",
    technology: ["Python", "OpenCV"],
    status: "PROTOTYPE",
    githubUrl: "https://github.com/Fahad28may",
  },
];

export function getAllExperiments(): Experiment[] {
  return experiments;
}
