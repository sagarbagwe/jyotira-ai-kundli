import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import { validateKundliUpload } from "@/lib/security/uploads";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = await rateLimit("upload", requestIdentifier(request));
  if (!limit.success) {
    return NextResponse.json({ error: "Upload limit reached. Please try again later." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }
    const validated = await validateKundliUpload(file);
    const extracted = await getAIProvider().extractKundli(validated.bytes, validated.mimeType);
    return NextResponse.json(
      {
        file: {
          name: validated.safeName,
          mimeType: validated.mimeType,
          sizeBytes: validated.bytes.byteLength,
          sha256: validated.sha256,
          retained: false,
        },
        extracted,
        requiresConfirmation: true,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File processing failed." },
      { status: 400 },
    );
  }
}
