import { AskNylvexLauncher } from "@/components/ask-nylvex/ask-nylvex-launcher";

export function AskNylvex() {
  return <AskNylvexLauncher configured={Boolean(process.env.OPENROUTER_API_KEY)} />;
}
