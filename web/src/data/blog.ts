export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string; language?: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: string;
  author: string;
  content: ContentBlock[];
};

export const posts: BlogPost[] = [
  {
    slug: "how-i-design-reliable-ai-agents",
    title: "How I Design Reliable AI Agents",
    description:
      "Reliability in agent systems comes from constraining what the model is allowed to do, not from a smarter prompt.",
    category: "AI Engineering",
    tags: ["Agents", "Tool Calling", "Reliability"],
    publishedAt: "2026-07-14",
    readingTime: "8 min",
    author: "Fahad",
    content: [
      {
        type: "paragraph",
        text: "Most agent failures I've run into weren't reasoning failures — they were scope failures. The model picked a plausible tool, called it with plausible arguments, and did something the system had no way to undo. The fix wasn't a better prompt. It was narrowing what the agent could actually do at each step.",
      },
      { type: "heading", text: "Constrain the action space, not the thinking" },
      {
        type: "paragraph",
        text: "It's tempting to give an agent broad tools and trust the model to use them responsibly. In practice, the more tools available at once, the more often the model picks a plausible-but-wrong one. Grouping tools by task stage and only exposing the relevant subset at each step cuts down on this significantly.",
      },
      {
        type: "list",
        items: [
          "Expose fewer tools per step, not every tool all the time.",
          "Make destructive actions require a separate confirmation step the model can't skip.",
          "Return structured errors from tools so the model can actually recover, not just retry blindly.",
        ],
      },
      { type: "heading", text: "Structured outputs over free text" },
      {
        type: "paragraph",
        text: "Anywhere an agent's output feeds into code — not just a chat window — structured outputs remove an entire category of parsing bugs. If a recommendation needs a specific account ID and action type, define that schema and let the model fill it in, rather than parsing free text after the fact.",
      },
      {
        type: "paragraph",
        text: "None of this makes agents smarter. It makes their failures smaller and easier to recover from, which in production matters more.",
      },
    ],
  },
  {
    slug: "rag-isnt-just-vector-search",
    title: "RAG Isn't Just Vector Search",
    description:
      "The retrieval step gets all the attention, but chunking strategy and re-ranking usually matter more for answer quality.",
    category: "AI",
    tags: ["RAG", "Search", "LLM"],
    publishedAt: "2026-06-02",
    readingTime: "6 min",
    author: "Fahad",
    content: [
      {
        type: "paragraph",
        text: "When a RAG system gives a wrong answer, the instinct is to blame the embedding model or swap the vector database. In most cases I've debugged, the actual problem was upstream: the wrong chunk was retrieved in the first place, or the right chunk was retrieved but buried below the context window's effective attention.",
      },
      { type: "heading", text: "Chunking decides what's retrievable at all" },
      {
        type: "paragraph",
        text: "A chunk that splits a table in half, or separates a heading from the paragraph it introduces, can't be retrieved correctly no matter how good the embedding is. Chunk boundaries need to respect document structure, not just a fixed token count.",
      },
      { type: "heading", text: "Re-ranking is not optional at scale" },
      {
        type: "paragraph",
        text: "Vector similarity is a reasonable first pass, but it optimizes for semantic closeness, not relevance to the specific question asked. Re-ranking the top-k results with a cheaper, more precise pass before they reach the model consistently improved answer quality more than switching embedding models did.",
      },
      {
        type: "paragraph",
        text: "Vector search gets you candidates. Getting from candidates to a correct, cited answer is where most of the actual engineering work is.",
      },
    ],
  },
  {
    slug: "building-production-apis-with-fastapi",
    title: "Building Production APIs with FastAPI",
    description:
      "FastAPI's async support is the headline feature, but the parts that matter for production are dependency injection and typed error handling.",
    category: "Python",
    tags: ["FastAPI", "APIs", "Backend"],
    publishedAt: "2026-04-21",
    readingTime: "5 min",
    author: "Fahad",
    content: [
      {
        type: "paragraph",
        text: "FastAPI gets picked for its speed and async support, but the features that actually pay off once an API is in production are less flashy: dependency injection for shared resources, and Pydantic models that make invalid requests fail before they reach business logic.",
      },
      { type: "heading", text: "Dependencies as the seam for testing" },
      {
        type: "paragraph",
        text: "Routing database connections, auth checks, and external clients through FastAPI's dependency system means they can be overridden in tests without monkeypatching internals. That seam is worth designing around from the first route, not retrofitting later.",
      },
      { type: "heading", text: "Let Pydantic reject bad input early" },
      {
        type: "paragraph",
        text: "Typed request and response models catch malformed input at the edge instead of deep inside a handler. Combined with typed exception handlers that map domain errors to consistent HTTP responses, most of an API's error handling stops being ad hoc try/except blocks scattered across routes.",
      },
      {
        type: "paragraph",
        text: "None of this is unique to FastAPI — it's just unusually easy to fall into doing it correctly with the tools it gives you by default.",
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getLatestPosts(count: number): BlogPost[] {
  return getAllPosts().slice(0, count);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
