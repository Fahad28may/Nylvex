const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 3;

const hits = new Map<string, number[]>();

// Best-effort only: state is per server instance, so it resets on redeploy
// and doesn't share across serverless instances. Good enough to blunt bots,
// not a substitute for a shared store if abuse becomes a real problem.
//
// `key` should be namespaced per caller (e.g. "contact:1.2.3.4") so
// unrelated endpoints sharing an IP don't share a rate-limit bucket.
export function isRateLimited(
  key: string,
  options?: { windowMs?: number; maxRequests?: number }
): boolean {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;

  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}
