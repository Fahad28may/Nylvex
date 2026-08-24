export type ProjectStatus = "prototype" | "in-progress" | "shipped";

export type ArchitectureNode = {
  label: string;
  detail?: string;
  children?: ArchitectureNode[];
};

export type TechnicalDecision = {
  decision: string;
  reasoning: string;
};

export type Project = {
  slug: string;
  title: string;
  categories: string[];
  summary: string;
  description: string;
  technologies: string[];
  status: ProjectStatus;
  githubUrl?: string;
  demoUrl?: string;
  problem: string;
  solution: string;
  architecture: ArchitectureNode[];
  decisions: TechnicalDecision[];
  challenges: string[];
  results?: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "ai-crm-agent",
    title: "AI CRM Agent",
    categories: ["AI", "SaaS", "Agents"],
    summary:
      "An intelligent CRM system that analyzes sales activity, identifies opportunities, and recommends actions.",
    description:
      "AI CRM Agent sits on top of an existing CRM rather than replacing it — reading activity as it's logged, scoring which accounts show real buying signals, and drafting the next action for a rep to approve. The goal was to cut the gap between data entry and follow-up, not to build another dashboard.",
    technologies: ["Python", "FastAPI", "PostgreSQL", "OpenAI", "Next.js"],
    status: "prototype",
    githubUrl: "https://github.com/Fahad28may",
    problem:
      "Sales teams generate large volumes of activity data — calls, emails, notes — but most CRMs only store it. Reps spend more time logging activity than acting on it, and opportunities buried in unstructured notes go unnoticed.",
    solution:
      "An agent layer sits on top of CRM data, reading activity as it comes in, surfacing accounts that show buying signals, and drafting recommended next actions for a rep to approve rather than write from scratch.",
    architecture: [
      { label: "User", detail: "Sales rep dashboard" },
      {
        label: "Next.js",
        detail: "Dashboard, review queue",
        children: [
          {
            label: "FastAPI",
            detail: "Agent orchestration, auth",
            children: [
              { label: "AI Agent", detail: "Tool calling, reasoning" },
              { label: "PostgreSQL", detail: "Accounts, activity, recommendations" },
              { label: "External CRM API", detail: "Sync source data" },
            ],
          },
        ],
      },
    ],
    decisions: [
      {
        decision: "FastAPI for the orchestration layer",
        reasoning:
          "Async request handling made it straightforward to fan out multiple tool calls (CRM lookups, enrichment, scoring) per recommendation without blocking the request thread.",
      },
      {
        decision: "Structured outputs over free-form generation",
        reasoning:
          "Recommendations feed a review queue with typed fields (account, action, reasoning, confidence). Structured outputs kept the UI reliable and removed brittle text parsing.",
      },
      {
        decision: "Human approval before any CRM write",
        reasoning:
          "The agent drafts actions but never writes back to the CRM directly — every recommendation is approved or dismissed by a rep, which kept trust and data quality high during early use.",
      },
    ],
    challenges: [
      "Keeping recommendation latency low while calling multiple tools per account required batching lookups and caching enrichment data instead of calling on every request.",
      "Avoiding notification fatigue meant scoring and ranking opportunities rather than surfacing everything the model flagged as interesting.",
    ],
    featured: true,
  },
  {
    slug: "ai-personal-agent",
    title: "AI Personal Agent",
    categories: ["AI", "Agents", "Python"],
    summary:
      "A personal AI system capable of interacting with files, applications, and external tools.",
    description:
      "AI Personal Agent is a local assistant that goes past conversation into actually doing the task — reading and editing files, running scripts, and driving applications through a growing set of MCP tool servers. It's built to run on a single machine as a working environment, not a hosted chatbot.",
    technologies: ["Python", "MCP", "Anthropic", "SQLite"],
    status: "in-progress",
    githubUrl: "https://github.com/Fahad28may",
    problem:
      "General-purpose assistants are useful for conversation but stop short of taking action across a person's own files, tools, and local applications without a lot of manual copy-pasting.",
    solution:
      "A local agent that exposes files, applications, and scripts as callable tools through MCP, so a single conversational interface can read, edit, and execute across a real working environment instead of only describing what to do.",
    architecture: [
      { label: "User", detail: "Conversational interface" },
      {
        label: "Agent runtime",
        detail: "Python process, tool router",
        children: [
          { label: "MCP tool servers", detail: "Filesystem, shell, apps" },
          { label: "LLM", detail: "Anthropic, reasoning + tool calls" },
          { label: "SQLite", detail: "Session + task memory" },
        ],
      },
    ],
    decisions: [
      {
        decision: "MCP for tool exposure",
        reasoning:
          "Standardizing tools behind MCP meant new capabilities (a new app integration, a new script) could be added as independent servers instead of hardcoding branches into the agent loop.",
      },
      {
        decision: "Explicit tool permissions per session",
        reasoning:
          "Because the agent can touch real files and applications, each session scopes which tools are available rather than granting blanket filesystem or shell access by default.",
      },
    ],
    challenges: [
      "Designing tool schemas specific enough for the model to call correctly, without so many tools that tool selection itself became unreliable.",
      "Handling partial failures mid-task (a tool call fails halfway through a multi-step task) required explicit recovery steps rather than assuming every call succeeds.",
    ],
    featured: true,
  },
  {
    slug: "knowledge-intelligence",
    title: "Knowledge Intelligence",
    categories: ["RAG", "LLM", "Search"],
    summary:
      "A knowledge system that turns large document collections into an intelligent, searchable interface.",
    description:
      "Knowledge Intelligence turns a document collection into something you can actually ask questions of — retrieving the relevant passages for a query, re-ranking them, and generating an answer with citations back to the source. The focus was on retrieval quality and traceability, not just wiring up an embedding API.",
    technologies: ["Python", "FastAPI", "PostgreSQL", "pgvector", "OpenAI"],
    status: "prototype",
    githubUrl: "https://github.com/Fahad28may",
    problem:
      "Large document collections — internal docs, PDFs, support articles — are searchable by keyword at best. Finding the right answer means knowing the right words to search for, and synthesis across multiple documents falls entirely on the reader.",
    solution:
      "A retrieval-augmented pipeline chunks and embeds documents, retrieves relevant passages per query, and generates grounded answers with citations back to source documents instead of a flat list of search results.",
    architecture: [
      { label: "User", detail: "Search / ask interface" },
      {
        label: "FastAPI",
        detail: "Query + ingestion API",
        children: [
          { label: "Embedding pipeline", detail: "Chunking, embeddings" },
          { label: "pgvector", detail: "Vector similarity search" },
          { label: "LLM", detail: "Grounded answer generation" },
        ],
      },
    ],
    decisions: [
      {
        decision: "pgvector instead of a dedicated vector database",
        reasoning:
          "Document volume didn't justify running a separate vector store. Keeping embeddings in PostgreSQL alongside metadata simplified operations and kept retrieval and filtering in one query.",
      },
      {
        decision: "Citations required on every generated answer",
        reasoning:
          "Answers link back to the exact source chunk they were generated from, which made it possible to verify correctness and catch retrieval gaps during testing.",
      },
    ],
    challenges: [
      "Chunking strategy had a bigger effect on answer quality than model choice — chunk size and overlap needed tuning per document type.",
      "Balancing retrieval recall against context window limits meant re-ranking retrieved chunks before passing them to the model rather than passing every match.",
    ],
    featured: true,
  },
  {
    slug: "ai-voice-agent",
    title: "AI Voice Agent",
    categories: ["AI", "Voice", "Realtime"],
    summary:
      "A conversational voice system capable of understanding requests and executing actions through external tools.",
    description:
      "AI Voice Agent handles a spoken request end to end — understanding intent as audio streams in, calling out to external tools while still speaking, and responding without the dead air that comes from waiting on a full round trip. It's a latency problem as much as an understanding problem.",
    technologies: ["Python", "WebSockets", "Realtime API", "FastAPI"],
    status: "prototype",
    githubUrl: "https://github.com/Fahad28may",
    problem:
      "Voice interfaces are typically limited to scripted responses or simple transcription. Handling open-ended spoken requests and turning them into real actions requires low-latency reasoning, not just speech-to-text.",
    solution:
      "A realtime pipeline streams audio to a speech-aware model over WebSockets, interprets intent as the conversation happens, and calls external tools mid-conversation to complete the request rather than replying afterward.",
    architecture: [
      { label: "User", detail: "Voice input/output" },
      {
        label: "WebSocket gateway",
        detail: "FastAPI, streaming audio",
        children: [
          { label: "Realtime model", detail: "Speech understanding + generation" },
          { label: "Tool layer", detail: "External API calls" },
        ],
      },
    ],
    decisions: [
      {
        decision: "WebSockets over request/response for audio",
        reasoning:
          "Conversational latency depends on streaming partial audio and interim transcripts rather than waiting for a full utterance, which ruled out a standard REST request cycle.",
      },
      {
        decision: "Tool calls interleaved with speech generation",
        reasoning:
          "Waiting for a tool call to finish before responding created awkward silence, so the system acknowledges the request in speech while the tool call runs in parallel.",
      },
    ],
    challenges: [
      "Interruption handling — detecting when a user talks over the agent — needed explicit state management in the audio pipeline.",
      "Keeping end-to-end latency low enough to feel conversational required careful placement of buffering at each stage of the pipeline.",
    ],
    featured: true,
  },
  {
    slug: "computer-vision-system",
    title: "Computer Vision System",
    categories: ["Computer Vision", "Python", "Realtime"],
    summary: "A real-time visual detection and event-processing system.",
    description:
      "Computer Vision System takes a live video feed and turns it into discrete, actionable events instead of a stream of bounding boxes — tracking objects across frames to filter noise before anything reaches a downstream consumer. Built to run within real hardware constraints, not just a benchmark GPU.",
    technologies: ["Python", "PyTorch", "OpenCV", "Redis"],
    status: "prototype",
    githubUrl: "https://github.com/Fahad28may",
    problem:
      "Turning a raw video feed into useful, actionable events — not just bounding boxes on a screen — requires a processing pipeline that can run in real time and decide what actually matters.",
    solution:
      "A detection model runs against a live video stream, and detections are passed through an event pipeline that filters noise, tracks objects across frames, and emits discrete events rather than raw per-frame output.",
    architecture: [
      { label: "Video stream", detail: "Camera / file input" },
      {
        label: "Detection pipeline",
        detail: "PyTorch model, frame sampling",
        children: [
          { label: "Tracking", detail: "Cross-frame object tracking" },
          { label: "Event queue", detail: "Redis, downstream consumers" },
        ],
      },
    ],
    decisions: [
      {
        decision: "Frame sampling instead of processing every frame",
        reasoning:
          "Running inference on every frame wasn't necessary for the target use case and made real-time performance impossible on available hardware, so sampling rate became a tunable tradeoff.",
      },
      {
        decision: "Redis as an event queue",
        reasoning:
          "Decoupling detection from downstream consumers let the vision pipeline emit events without knowing or blocking on what consumed them.",
      },
    ],
    challenges: [
      "False positives from single-frame detections required object tracking across frames before an event was considered real.",
      "Balancing model accuracy against inference speed meant evaluating smaller model variants rather than defaulting to the largest available.",
    ],
    featured: true,
  },
];

export function getAllProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
