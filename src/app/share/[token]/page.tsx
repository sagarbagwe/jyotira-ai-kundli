import { CalendarDays, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Brand } from "@/components/app/brand";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { ReportView } from "@/components/report/report-view";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { loadSharedReportArtifact } from "@/lib/jobs/processor";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Shared Kundli Report",
  robots: { index: false, follow: false },
};

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const artifact = await loadSharedReportArtifact(token);
  if (!artifact) notFound();
  const { chart, interpretation } = artifact;

  return (
    <div className="app-background min-h-screen">
      <header className="no-print border-b border-line bg-surface/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center px-4 sm:px-6">
          <Brand />
          <div className="ml-auto flex items-center gap-2">
            <Badge tone="primary" className="hidden sm:inline-flex">
              Read-only shared report
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7">
          <Badge tone="positive">
            <ShieldCheck className="size-3.5" />
            Explicitly shared
          </Badge>
          <h1 className="font-display mt-4 text-4xl font-semibold">
            {chart.input.name}&apos;s Kundli
          </h1>
          <p className="mt-2 text-sm text-muted">
            Calculated data and clearly labeled traditional interpretation.
          </p>
        </div>
        <Card className="mb-6 p-5 sm:p-6">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {formatDate(chart.input.dateOfBirth)}
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="size-4 text-primary" />
              {chart.input.timeOfBirth}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {chart.input.place}
            </span>
          </div>
        </Card>
        <ReportView
          reportId={artifact.id}
          chart={chart}
          interpretation={interpretation}
          readOnly
        />
      </main>
    </div>
  );
}