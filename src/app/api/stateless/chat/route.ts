import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getAIProvider } from "@/lib/ai/provider";
import type { CalculatedChart } from "@/lib/astrology/types";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 3_000_000) {
    return NextResponse.json({ error: "Chart payload is too large." }, { status: 413 });
  }

  const limit = await rateLimit("ai", requestIdentifier(request, actor.id));
  if (!limit.success) {
    return NextResponse.json(
      { error: "AI question limit reached. Please try again after reset." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Chart and question are required." }, { status: 400 });
  }
  const candidate = body as { chart?: unknown; question?: unknown };
  const question = typeof candidate.question === "string" ? candidate.question.trim() : "";
  if (question.length < 3 || question.length > 1200 || !candidate.chart || typeof candidate.chart !== "object") {
    return NextResponse.json({ error: "Chart and a valid question are required." }, { status: 400 });
  }

  const chart = candidate.chart as CalculatedChart;
  if (!chart.input || !Array.isArray(chart.planets) || !Array.isArray(chart.houses)) {
    return NextResponse.json({ error: "Calculated chart data is incomplete." }, { status: 400 });
  }

  try {
    const answer = await getAIProvider().answerQuestion(chart, question);
    return NextResponse.json(
      { answer },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gemini interpretation is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
