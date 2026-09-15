import { CalendarDays, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentActor } from "@/auth";
import { AppShell } from "@/components/app/app-shell";
import { ReportActions } from "@/components/report/report-actions";
import { ReportView } from "@/components/report/report-view";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDemoArtifact } from "@/lib/demo";
import { loadReportArtifact } from "@/lib/jobs/processor";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Kundli Report" };

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getCurrentActor();
  const artifact =
    id === "demo"
      ? await getDemoArtifact()
      : await loadReportArtifact(id, actor);
  if (!artifact) notFound();

  const { chart, interpretation } = artifact;

  return (
    <AppShell
      title={`${chart.input.name}'s Kundli`}
      description="Interactive Vedic astrology report with calculated evidence and clearly labeled interpretation."
      actions={<ReportActions reportId={id} />}
    >
      <Card className="mb-6 overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="positive">
                <ShieldCheck className="size-3.5" />
                Astronomically calculated
              </Badge>
              <Badge tone="primary">AI-assisted interpretation</Badge>
              <Badge tone="gold">{artifact.request.type} report</Badge>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                {formatDate(chart.input.dateOfBirth)}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="size-4 text-primary" />
                {chart.input.timeOfBirth} · {chart.input.timezone}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {chart.input.place}
              </span>
            </div>
          </div>
          <div className="border-t border-line bg-soft px-5 py-4 text-sm lg:border-l lg:border-t-0 lg:px-6">
            <p className="text-xs font-bold tracking-[.1em] text-muted uppercase">
              Calculation method
            </p>
            <p className="mt-2 font-semibold">
              {chart.methodology.ayanamsa} · {chart.methodology.houseSystem}
            </p>
            <p className="mt-1 text-xs text-muted">
              {chart.methodology.engine} · {chart.methodology.nodeType} node
            </p>
          </div>
        </div>
      </Card>

      {chart.methodology.warnings.map((warning) => (
        <div
          key={warning}
          className="mb-4 rounded-[10px] border border-attention/25 bg-attention-soft p-4 text-sm text-attention"
        >
          {warning}
        </div>
      ))}

      <ReportView
        reportId={id}
        chart={chart}
        interpretation={interpretation}
      />
    </AppShell>
  );
}