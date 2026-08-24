import { AskNylvexLauncher } from "@/components/ask-nylvex/ask-nylvex-launcher";

export function AskNylvex() {
  return <AskNylvexLauncher configured={Boolean(process.env.ANTHROPIC_API_KEY)} />;
}
