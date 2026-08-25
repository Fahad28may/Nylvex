const STORAGE_KEY = "nylvex_chat_handoff";

export function writeChatHandoff(summary: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ summary }));
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — the contact form
    // simply won't be prefilled, which is a harmless degradation.
  }
}

export function readAndClearChatHandoff(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return typeof parsed?.summary === "string" ? parsed.summary : null;
  } catch {
    return null;
  }
}
