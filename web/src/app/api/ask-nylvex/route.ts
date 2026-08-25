import { NextResponse, type NextRequest } from "next/server";
import { getAllProjects } from "@/data/projects";
import { capabilityGroups } from "@/data/capabilities";
import { getAllPosts } from "@/data/blog";
import { nylvexKnowledge } from "@/data/nylvex";
import { isRateLimited } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";
// stealth/ox-alpha (via OpenRouter) has been observed taking 6-30s+ to
// respond. Vercel's default function timeout is well under that, so this
// must be raised explicitly or slower responses fail in production even
// though the model itself answered successfully.
export const maxDuration = 60;

const UPSTREAM_TIMEOUT_MS = 55_000;

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 800;

const KNOWN_PROJECT_SLUGS = new Set(getAllProjects().map((p) => p.slug));
const KNOWN_CAPABILITIES = new Set(
  capabilityGroups.flatMap((group) => group.items.map((item) => item.toLowerCase()))
);

function buildContext() {
  const projects = getAllProjects()
    .map(
      (project) =>
        `- ${project.title} (slug: ${project.slug}): ${project.summary} Categories: ${project.categories.join(", ")}. Stack: ${project.technologies.join(", ")}. Status: ${project.status}.`
    )
    .join("\n");

  const capabilities = capabilityGroups
    .map((group) => `- ${group.title}: ${group.items.join(", ")}`)
    .join("\n");

  const posts = getAllPosts()
    .map((post) => `- ${post.title} (/blog/${post.slug}): ${post.description}`)
    .join("\n");

  return [
    `Nylvex: ${nylvexKnowledge.description}`,
    `Philosophy: ${nylvexKnowledge.philosophy}`,
    `Process: ${nylvexKnowledge.process.join(" ")}`,
    `About the founder: ${nylvexKnowledge.founder}`,
    `\nNylvex capabilities:\n${capabilities}`,
    `\nNylvex projects:\n${projects}`,
    `\nNylvex insights (blog articles):\n${posts}`,
  ].join("\n");
}

const SYSTEM_PROMPT = `You are "Ask Nylvex," a project-discovery assistant embedded on the Nylvex studio website. Your job is to: explain what Nylvex does, help visitors discover relevant Nylvex projects and capabilities, let visitors describe an idea or problem and sketch a possible technical approach, and guide genuinely interested visitors toward starting a project.

Ground rules:
- Only use the context below. Never invent clients, projects, results, revenue, metrics, testimonials, partnerships, certifications, prior experience, or technologies that aren't listed.
- If you don't have enough information to answer accurately, say so plainly: "I don't have enough information to answer that accurately." Do not guess.
- When a specific Nylvex project is clearly relevant, include its slug in relevantProjectSlugs — only slugs from the provided list, never invented.
- When specific capabilities are relevant, include them in relevantCapabilities — only items from the provided list, in their exact listed wording.
- If the visitor describes a concrete idea or problem worth sketching (e.g. "I want a system that reads emails and routes important ones"), provide 3-6 short architectureSteps describing a plausible pipeline from input to outcome, in order.
- Only set suggestStartProject to true when the visitor has shown genuine project intent (they described something they want built, not just casual browsing or a general question).
- Keep the message field concise: 2-5 sentences, conversational, not a sales pitch.
- If a question is unrelated to Nylvex, AI engineering, or software engineering, briefly say you can only help with Nylvex-related questions.

Context:
${buildContext()}`;

const RESPOND_TOOL = {
  type: "function" as const,
  function: {
    name: "respond_to_visitor",
    description: "Send a structured reply to the website visitor.",
    parameters: {
      type: "object" as const,
      properties: {
        message: {
          type: "string",
          description: "The conversational reply to show the visitor, 2-5 sentences.",
        },
        relevantCapabilities: {
          type: "array",
          items: { type: "string" },
          description: "Relevant capability names from the provided list, if applicable.",
        },
        relevantProjectSlugs: {
          type: "array",
          items: { type: "string" },
          description: "Relevant Nylvex project slugs from the provided list, if applicable.",
        },
        architectureSteps: {
          type: "array",
          items: { type: "string" },
          description: "3-6 short pipeline steps if the visitor described an idea worth sketching.",
        },
        suggestStartProject: {
          type: "boolean",
          description: "True only if the visitor has shown genuine project intent.",
        },
      },
      required: ["message"],
    },
  },
};

type ChatMessage = { role: "user" | "assistant"; content: string };

function sanitizeMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;

  const messages: ChatMessage[] = [];
  for (const item of input) {
    if (
      !item ||
      typeof item !== "object" ||
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string"
    ) {
      return null;
    }
    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return null;
    messages.push({ role: item.role, content });
  }

  if (messages[messages.length - 1].role !== "user") return null;

  // Cap conversation length server-side regardless of what the client sends,
  // both for cost control and to bound worst-case payload size.
  return messages.slice(-MAX_MESSAGES);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Ask Nylvex is not configured yet." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Each request is a real, billed call through OpenRouter — cap volume per
  // IP so this can't be scripted into unbounded API spend (denial-of-wallet).
  if (isRateLimited(`ask-nylvex:${ip}`, { windowMs: 10 * 60 * 1000, maxRequests: 12 })) {
    return NextResponse.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const messages = sanitizeMessages(body?.messages);

  if (!messages) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "HTTP-Referer": siteConfig.url,
        "X-Title": siteConfig.name,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "stealth/ox-alpha",
        max_tokens: 700,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        tools: [RESPOND_TOOL],
        tool_choice: { type: "function", function: { name: "respond_to_visitor" } },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Ask Nylvex couldn't process that. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const choiceMessage = data.choices?.[0]?.message as
      | { content?: string; tool_calls?: { function?: { arguments?: string } }[] }
      | undefined;

    const toolArgs = choiceMessage?.tool_calls?.[0]?.function?.arguments;
    let input: Record<string, unknown> = {};
    if (typeof toolArgs === "string") {
      try {
        input = JSON.parse(toolArgs);
      } catch {
        input = {};
      }
    }

    // Some models on OpenRouter may ignore tool_choice and reply in plain
    // text instead — fall back to that rather than failing the request.
    const message =
      typeof input.message === "string"
        ? input.message
        : typeof choiceMessage?.content === "string"
          ? choiceMessage.content
          : "";

    if (!message) {
      return NextResponse.json(
        { error: "Ask Nylvex couldn't process that. Please try again." },
        { status: 502 }
      );
    }

    // Never trust the model's slugs/capabilities as-is — filter against the
    // real, known lists so a hallucinated value can never reach the client.
    const relevantProjectSlugs = Array.isArray(input.relevantProjectSlugs)
      ? input.relevantProjectSlugs.filter(
          (slug): slug is string => typeof slug === "string" && KNOWN_PROJECT_SLUGS.has(slug)
        )
      : [];

    const relevantCapabilities = Array.isArray(input.relevantCapabilities)
      ? input.relevantCapabilities.filter(
          (item): item is string =>
            typeof item === "string" && KNOWN_CAPABILITIES.has(item.toLowerCase())
        )
      : [];

    const architectureSteps = Array.isArray(input.architectureSteps)
      ? input.architectureSteps.filter((step): step is string => typeof step === "string").slice(0, 6)
      : [];

    return NextResponse.json({
      message,
      relevantProjectSlugs,
      relevantCapabilities,
      architectureSteps,
      suggestStartProject: input.suggestStartProject === true,
    });
  } catch {
    return NextResponse.json(
      { error: "Ask Nylvex couldn't process that. Please try again." },
      { status: 502 }
    );
  }
}
