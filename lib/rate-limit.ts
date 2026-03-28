/**
 * Rate limiter — uses Upstash Redis when credentials are present,
 * falls back to in-memory for local dev (in-memory resets on cold start).
 *
 * To enable Upstash: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * in Vercel env vars and .env.local.
 */

// ── In-memory fallback ────────────────────────────────────────────────────

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

function checkInMemory(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

// ── Upstash Redis (lazy-loaded) ───────────────────────────────────────────

let upstashRatelimit: ((key: string, max: number, windowMs: number) => Promise<boolean>) | null = null;

async function getUpstashChecker() {
  if (upstashRatelimit) return upstashRatelimit;
  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  upstashRatelimit = async (key: string, max: number, windowMs: number) => {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
    });
    const { success } = await rl.limit(key);
    return success;
  };
  return upstashRatelimit;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Returns true if the request is within the rate limit, false if blocked.
 * Async so callers must await.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    const checker = await getUpstashChecker();
    return checker(key, max, windowMs);
  }
  return checkInMemory(key, max, windowMs);
}
