import { after, NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import {
  createGenerationJob,
  runGenerationJob,
} from "@/lib/jobs/processor";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import { generationRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const limit = await rateLimit(
    "report",
    requestIdentifier(request, actor.id),
  );
  if (!limit.success) {
    return NextResponse.json(
      { error: "Daily report limit reached. Please try again after reset." },
      { status: 429 },
    );
  }

  const parsed = generationRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please correct the highlighted birth and report details.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const jobId = await createGenerationJob(actor, parsed.data);
  after(() => runGenerationJob(jobId, actor, parsed.data));

  return NextResponse.json(
    { jobId, status: "QUEUED", progress: 2 },
    { status: 202 },
  );
}