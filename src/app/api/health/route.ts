import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ai = Boolean(env.GEMINI_API_KEY);
  return NextResponse.json(
    {
      status: ai ? "ok" : "degraded",
      mode: "stateless",
      timestamp: new Date().toISOString(),
      checks: {
        ai,
        astrology: true,
        database: "not-used",
        authentication: "not-used",
        storage: "not-used",
      },
    },
    { status: ai ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
