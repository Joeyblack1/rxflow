// In-memory sliding-window rate limiter (resets on cold start — good enough for serverless)
// For distributed rate limiting, replace with Upstash Redis.

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  entry.count++;
  if (entry.count > max) return false; // blocked
  return true;
}
