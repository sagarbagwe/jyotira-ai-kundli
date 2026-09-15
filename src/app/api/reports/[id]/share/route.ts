import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { id } = await params;
  if (id === "demo") {
    return NextResponse.json({
      shareUrl: `${env.NEXT_PUBLIC_APP_URL}/share/demo`,
      expires: null,
    });
  }
  if (!prisma || actor.demo) {
    return NextResponse.json(
      { error: "Sharing requires a configured production database." },
      { status: 503 },
    );
  }
  const report = await prisma.report.findFirst({
    where: { id, userId: actor.id, status: "READY" },
  });
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  const shareToken = report.shareToken ?? randomBytes(24).toString("base64url");
  await prisma.report.update({
    where: { id: report.id },
    data: { shareEnabled: true, shareToken },
  });
  return NextResponse.json({
    shareUrl: `${env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
    expires: null,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { id } = await params;
  if (!prisma || actor.demo || id === "demo") {
    return NextResponse.json({ disabled: true });
  }
  const report = await prisma.report.findFirst({
    where: { id, userId: actor.id },
  });
  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  await prisma.report.update({
    where: { id },
    data: { shareEnabled: false },
  });
  return NextResponse.json({ disabled: true });
}