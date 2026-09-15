import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getJob } from "@/lib/jobs/processor";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { id } = await params;
  const job = await getJob(id, actor);
  if (!job) {
    return NextResponse.json({ error: "Generation job not found." }, { status: 404 });
  }
  return NextResponse.json({ job });
}