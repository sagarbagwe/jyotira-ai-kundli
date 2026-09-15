"use client";

import { CalendarDays, Clock3, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { ReportView } from "@/components/report/report-view";
import { StatelessAskKundli } from "@/components/report/stateless-ask-kundli";
import { StatelessReportActions } from "@/components/report/stateless-report-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  STATELESS_REPORT_KEY,
  type StatelessReportArtifact,
} from "@/lib/stateless-report";
import { formatDate } from "@/lib/utils";

export default function LocalReportPage() {
  const [artifact, setArtifact] = useState<StatelessReportArtifact | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STATELESS_REPORT_KEY);
      if (stored) setArtifact(JSON.parse(stored) as StatelessReportArtifact);
    } catch {
      window.sessionStorage.removeItem(STATELESS_REPORT_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <AppShell title="Loading report" description="Opening your private browser-session report.">
        <div className="h-96 animate-pulse rounded-[12px] border border-line bg-surface" />
      </AppShell>
    );
  }

  if (!artifact) {
    return (
      <AppShell title="Report unavailable" description="Stateless reports disappear when the browser session ends.">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <ShieldCheck className="mx-auto size-8 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">No report in this session</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Generate a new Kundli. Download or print it before closing the browser tab.
          </p>
          <Link href="/new-kundli" className="mt-6 inline-flex h-11 items-center rounded-[10px] bg-primary px-5 text-sm font-semibold text-white">
            Create a Kundli
          </Link>
        </Card>
      </AppShell>
    );
  }

  const { chart, interpretation } = artifact;
  return (
    <AppShell
      title={`${chart.input.name}'s Kundli`}
      description="Calculated Vedic astrology and Gemini interpretation, stored only in this browser session."
      actions={<StatelessReportActions />}
    >
      <Card className="mb-6 overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="positive"><ShieldCheck className="size-3.5" /> Astronomically calculated</Badge>
              <Badge tone="primary">Gemini interpretation</Badge>
              <Badge tone="gold">Session only</Badge>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /> {formatDate(chart.input.dateOfBirth)}</span>
              <span className="flex items-center gap-2"><Clock3 className="size-4 text-primary" /> {chart.input.timeOfBirth} · {chart.input.timezone}</span>
              <span className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> {chart.input.place}</span>
            </div>
          </div>
          <div className="border-t border-line bg-soft px-5 py-4 text-sm lg:border-l lg:border-t-0 lg:px-6">
            <p className="text-xs font-bold tracking-[.1em] text-muted uppercase">Calculation method</p>
            <p className="mt-2 font-semibold">{chart.methodology.ayanamsa} · {chart.methodology.houseSystem}</p>
            <p className="mt-1 text-xs text-muted">{chart.methodology.engine} · {chart.methodology.nodeType} node</p>
          </div>
        </div>
      </Card>

      {chart.methodology.warnings.map((warning) => (
        <div key={warning} className="mb-4 rounded-[10px] border border-attention/25 bg-attention-soft p-4 text-sm text-attention">
          {warning}
        </div>
      ))}

      <ReportView
        reportId="local"
        chart={chart}
        interpretation={interpretation}
        readOnly
      />
      <StatelessAskKundli chart={chart} />
    </AppShell>
  );
}
