import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getAIProvider } from "@/lib/ai/provider";
import { getDemoArtifact } from "@/lib/demo";
import { loadReportArtifact } from "@/lib/jobs/processor";
import { prisma } from "@/lib/db/client";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import { chatRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
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
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success || !parsed.data.reportId) {
    return NextResponse.json(
      { error: "A report and question are required." },
      { status: 400 },
    );
  }

  const artifact =
    parsed.data.reportId === "demo"
      ? await getDemoArtifact()
      : await loadReportArtifact(parsed.data.reportId, actor);
  if (!artifact) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const started = Date.now();
  try {
    const answer = await getAIProvider().answerQuestion(
      artifact.chart,
      parsed.data.question,
    );
    if (prisma && !actor.demo && artifact.id !== "demo") {
      await prisma.aIQuestion.create({
        data: {
          userId: actor.id,
          reportId: artifact.id,
          question: parsed.data.question,
          answer,
          model: process.env.GEMINI_MODEL ?? "stub",
          latencyMs: Date.now() - started,
          status: "COMPLETED",
        },
      });
    }
    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI interpretation is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
