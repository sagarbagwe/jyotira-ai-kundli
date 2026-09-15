import "server-only";

import { env } from "@/lib/env";

type Bucket = "ai" | "report" | "geocode" | "upload";

const limits: Record<Bucket, number> = {
  ai: env.AI_REQUESTS_PER_HOUR,
  report: env.REPORTS_PER_DAY,
  geocode: 60,
  upload: 15,
};

const memory = new Map<string, { count: number; reset: number }>();

function windowMs(bucket: Bucket) {
  return bucket === "report" ? 86_400_000 : 3_600_000;
}

export async function rateLimit(bucket: Bucket, identifier: string) {
  const key = `${bucket}:${identifier}`;
  const now = Date.now();
  const found = memory.get(key);
  if (!found || found.reset <= now) {
    const reset = now + windowMs(bucket);
    memory.set(key, { count: 1, reset });
    return { success: true, limit: limits[bucket], remaining: limits[bucket] - 1, reset };
  }
  found.count += 1;
  return {
    success: found.count <= limits[bucket],
    limit: limits[bucket],
    remaining: Math.max(0, limits[bucket] - found.count),
    reset: found.reset,
  };
}

export function requestIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return `ip:${forwarded?.split(",")[0]?.trim() || "unknown"}`;
}
