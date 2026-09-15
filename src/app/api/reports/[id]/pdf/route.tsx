import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getCurrentActor } from "@/auth";
import { getDemoArtifact } from "@/lib/demo";
import { loadReportArtifact } from "@/lib/jobs/processor";
import { ReportDocument } from "@/lib/pdf/report-document";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { id } = await params;
  const artifact =
    id === "demo"
      ? await getDemoArtifact()
      : await loadReportArtifact(id, actor);
  if (!artifact) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  try {
    const buffer = await renderToBuffer(
      <ReportDocument
        chart={artifact.chart}
        interpretation={artifact.interpretation}
      />,
    );
    const safeName = artifact.chart.input.name
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName || "kundli"}-vedic-report.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "PDF generation failed. The interactive report is still available." },
      { status: 500 },
    );
  }
}