import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authConfigured = Boolean(
    (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) ||
      (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET),
  );
  const checks = {
    database: env.DEMO_MODE || Boolean(env.DATABASE_URL && env.DIRECT_URL),
    authentication: env.DEMO_MODE || authConfigured,
    ai: env.AI_MODE === "stub" || Boolean(env.GEMINI_API_KEY),
    storage:
      env.DEMO_MODE ||
      (env.STORAGE_DRIVER === "s3" &&
        Boolean(
          env.S3_BUCKET &&
            env.S3_ACCESS_KEY_ID &&
            env.S3_SECRET_ACCESS_KEY,
        )),
    rateLimit:
      env.DEMO_MODE ||
      Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  };
  const healthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      mode: env.DEMO_MODE ? "demo" : "production",
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}