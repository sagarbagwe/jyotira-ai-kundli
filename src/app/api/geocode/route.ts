import { NextResponse } from "next/server";
import { getLocationProvider } from "@/lib/location/provider";
import { rateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const limit = await rateLimit("geocode", requestIdentifier(request));
  if (!limit.success) {
    return NextResponse.json({ error: "Too many location searches. Please try again later." }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const language = searchParams.get("language")?.trim() || "en";
  if (query.length < 2 || query.length > 120) {
    return NextResponse.json({ error: "Enter at least two characters." }, { status: 400 });
  }
  try {
    const results = await getLocationProvider().search(query, language);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Location lookup is temporarily unavailable." }, { status: 503 });
  }
}
