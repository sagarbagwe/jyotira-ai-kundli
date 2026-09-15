import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import { birthInputSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const parsed = birthInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid birth information.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const chart = await getAstrologyEngine().calculateNatal(parsed.data);
    return NextResponse.json({ chart });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Astronomical calculation failed.",
      },
      { status: 422 },
    );
  }
}