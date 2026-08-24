const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;

const hits = new Map<string, number[]>();

// Best-effort only: state is per server instance, so it resets on redeploy
// and doesn't share across serverless instances. Good enough to blunt bots,
// not a substitute for a shared store if abuse becomes a real problem.
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}
