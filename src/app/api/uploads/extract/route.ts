import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getAIProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/db/client";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import {
  uploadStorageKey,
  validateKundliUpload,
} from "@/lib/security/uploads";
import { getStorageProvider } from "@/lib/storage/provider";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const limit = await rateLimit(
    "upload",
    requestIdentifier(request, actor.id),
  );
  if (!limit.success) {
    return NextResponse.json(
      { error: "Upload limit reached. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    const validated = await validateKundliUpload(file);
    const storageKey = uploadStorageKey(actor.id, validated.extension);
    await getStorageProvider().put(
      storageKey,
      validated.bytes,
      validated.mimeType,
      validated.safeName,
    );

    let databaseId: string | null = null;
    if (prisma && !actor.demo) {
      const record = await prisma.uploadedFile.create({
        data: {
          userId: actor.id,
          storageKey,
          originalName: validated.safeName,
          mimeType: validated.mimeType,
          sizeBytes: validated.bytes.byteLength,
          sha256: validated.sha256,
          status: "EXTRACTING",
        },
      });
      databaseId = record.id;
    }

    try {
      const extracted = await getAIProvider().extractKundli(
        validated.bytes,
        validated.mimeType,
      );
      if (prisma && databaseId) {
        await prisma.uploadedFile.update({
          where: { id: databaseId },
          data: { status: "EXTRACTED", extractedData: extracted },
        });
      }
      return NextResponse.json({
        file: {
          id: databaseId,
          name: validated.safeName,
          mimeType: validated.mimeType,
          sizeBytes: validated.bytes.byteLength,
          sha256: validated.sha256,
        },
        extracted,
        requiresConfirmation: true,
      });
    } catch (error) {
      if (prisma && databaseId) {
        await prisma.uploadedFile.update({
          where: { id: databaseId },
          data: {
            status: "FAILED",
            errorCode: "EXTRACTION_FAILED",
          },
        });
      }
      throw error;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "File processing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}