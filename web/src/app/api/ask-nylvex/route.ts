import { NextResponse, type NextRequest } from "next/server";
import { getAllProjects } from "@/data/projects";
import { capabilityGroups } from "@/data/capabilities";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

function buildContext() {
  const projects = getAllProjects()
    .map(
      (project) =>
        `- ${project.title} (slug: ${project.slug}): ${project.summary} Categories: ${project.categories.join(", ")}. Stack: ${project.technologies.join(", ")}.`
    )
    .join("\n");

  const capabilities = capabilityGroups
    .map((group) => `- ${group.title}: ${group.items.join(", ")}`)
    .join("\n");

  return `Nylvex projects:\n${projects}\n\nNylvex capabilities:\n${capabilities}`;
}

const SYSTEM_PROMPT = `You are "Ask Nylvex," an assistant embedded on the Nylvex studio website. Nylvex is an AI and software engineering studio built by Fahad.

Answer only using the context below about Nylvex's real projects and capabilities. Be concise (2-4 sentences). When a specific project is clearly the best match, reference it once using the exact format [[project-slug]] so the site can render a link — never invent a slug that isn't listed.

If a question is unrelated to Nylvex, AI engineering, or software engineering, say briefly that you can only answer questions about Nylvex's work.

Context:
${buildContext()}`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Ask Nylvex is not configured yet." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Each request is a real, billed call to Anthropic's API — cap volume per
  // IP so this can't be scripted into unbounded API spend (denial-of-wallet).
  if (isRateLimited(`ask-nylvex:${ip}`, { windowMs: 10 * 60 * 1000, maxRequests: 8 })) {
    return NextResponse.json(
      { error: "Too many questions. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!question) {
    return NextResponse.json({ error: "Enter a question." }, { status: 400 });
  }

  if (question.length > 500) {
    return NextResponse.json(
      { error: "Keep questions under 500 characters." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Ask Nylvex couldn't process that. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer: string =
      data.content?.find((block: { type: string }) => block.type === "text")?.text ?? "";

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Ask Nylvex couldn't process that. Please try again." },
      { status: 502 }
    );
  }
}
