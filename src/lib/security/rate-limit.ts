import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

type Bucket = "ai" | "report" | "geocode" | "upload";

const limits: Record<Bucket, { requests: number; window: `${number} ${"s" | "m" | "h" | "d"}` }> = {
  ai: { requests: env.AI_REQUESTS_PER_HOUR, window: "1 h" },
  report: { requests: env.REPORTS_PER_DAY, window: "1 d" },
  geocode: { requests: 60, window: "1 h" },
  upload: { requests: 15, window: "1 h" },
};

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const remoteLimiters = redis
  ? Object.fromEntries(
      Object.entries(limits).map(([bucket, config]) => [
        bucket,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.requests, config.window),
          prefix: `jyotira:${bucket}`,
          analytics: true,
        }),
      ]),
    )
  : null;

const memory = new Map<string, { count: number; reset: number }>();

function memoryWindowMs(bucket: Bucket) {
  return bucket === "report" ? 86_400_000 : 3_600_000;
}

export async function rateLimit(bucket: Bucket, identifier: string) {
  if (remoteLimiters) {
    return (
      remoteLimiters[bucket] as Ratelimit
    ).limit(identifier);
  }

  const key = `${bucket}:${identifier}`;
  const now = Date.now();
  const found = memory.get(key);
  if (!found || found.reset <= now) {
    const reset = now + memoryWindowMs(bucket);
    memory.set(key, { count: 1, reset });
    return {
      success: true,
      limit: limits[bucket].requests,
      remaining: limits[bucket].requests - 1,
      reset,
      pending: Promise.resolve(),
    };
  }
  found.count += 1;
  return {
    success: found.count <= limits[bucket].requests,
    limit: limits[bucket].requests,
    remaining: Math.max(0, limits[bucket].requests - found.count),
    reset: found.reset,
    pending: Promise.resolve(),
  };
}

export function requestIdentifier(request: Request, userId?: string | null) {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  return `ip:${forwarded?.split(",")[0]?.trim() || "unknown"}`;
}