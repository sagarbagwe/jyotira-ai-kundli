import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { KundliChart } from "@/components/charts/kundli-chart";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDemoArtifact } from "@/lib/demo";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const artifact = await getDemoArtifact();
  const { chart } = artifact;
  const currentMaha = chart.dashas.current.mahadasha;
  const currentAntar = chart.dashas.current.antardasha;
  const nextIngresses = (chart.transits?.ingresses ?? [])
    .filter((event) => new Date(event.at) >= new Date("2026-09-14"))
    .filter((event) =>
      ["jupiter", "saturn", "rahu", "ketu", "mars"].includes(event.planet),
    )
    .slice(0, 4);

  return (
    <AppShell
      title="Good evening"
      description="Your calculated charts, reports and active traditional timing periods."
      actions={
        <Link href="/new-kundli" className={buttonStyles()}>
          <Plus className="size-4" />
          New Kundli
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Saved reports",
            value: "1",
            detail: "Sample workspace",
            icon: BookOpenText,
            color: "bg-primary-soft text-primary",
          },
          {
            label: "Current Mahadasha",
            value: titleCase(currentMaha?.lord ?? "—"),
            detail: currentMaha
              ? `Ends ${formatDate(currentMaha.end)}`
              : "Not available",
            icon: Clock3,
            color: "bg-gold-soft text-gold",
          },
          {
            label: "Detected yoga rules",
            value: String(chart.yogas.filter((yoga) => yoga.detected).length),
            detail: `${chart.yogas.length} supported checks`,
            icon: Sparkles,
            color: "bg-positive-soft text-positive",
          },
          {
            label: "Analysis range",
            value: "16 mo",
            detail: "Sep 2026 – Dec 2027",
            icon: CalendarClock,
            color: "bg-attention-soft text-attention",
          },
        ].map((metric) => (
          <Card key={metric.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">{metric.label}</p>
                <p className="font-display mt-2 text-3xl font-semibold">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-muted">{metric.detail}</p>
              </div>
              <span
                className={`grid size-10 place-items-center rounded-[10px] ${metric.color}`}
              >
                <metric.icon className="size-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="positive">
                  <CheckCircle2 className="size-3.5" />
                  Calculated
                </Badge>
                <Badge tone="neutral">Sample profile</Badge>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{chart.input.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {formatDate(chart.input.dateOfBirth)} · {chart.input.timeOfBirth} ·{" "}
                {chart.input.place}
              </p>
            </div>
            <Link
              href="/reports/demo"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Full report
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <KundliChart chart={chart} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge tone="primary">AI interpretation</Badge>
                  <h2 className="mt-3 text-lg font-semibold">Chart snapshot</h2>
                </div>
                <Sparkles className="size-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted">
                {artifact.interpretation.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {artifact.interpretation.keyThemes.map((theme) => (
                  <Badge key={theme}>{theme}</Badge>
                ))}
              </div>
              <Link
                href="/reports/demo#ask"
                className={`${buttonStyles({ variant: "secondary" })} mt-6 w-full`}
              >
                Ask this Kundli
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[.12em] text-gold uppercase">
                    Active sequence
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">
                    Vimshottari Dasha
                  </h2>
                </div>
                <TrendingUp className="size-5 text-gold" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-[10px] bg-gold-soft p-4">
                <p className="text-sm font-semibold text-gold">
                  {titleCase(currentMaha?.lord ?? "Unavailable")} Mahadasha
                </p>
                <p className="mt-1 text-xs text-muted">
                  {titleCase(currentAntar?.lord ?? "Unavailable")} Antardasha ·{" "}
                  {currentAntar ? `until ${formatDate(currentAntar.end)}` : "—"}
                </p>
              </div>
              <p className="mt-4 text-xs leading-5 text-muted">
                Period dates are calculated. Their meaning is a traditional
                interpretation, not a guarantee of events.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[.12em] text-primary uppercase">
                Actual ephemeris events
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Upcoming slow-planet transits
              </h2>
            </div>
            <Link
              href="/predictions"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Open timeline
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {nextIngresses.map((event) => (
              <div
                key={`${event.planet}-${event.at}`}
                className="rounded-[10px] border border-line bg-soft p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{titleCase(event.planet)}</span>
                  {event.retrograde && <Badge tone="attention">℞</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted">
                  {titleCase(event.fromSign)} → {titleCase(event.toSign)}
                </p>
                <p className="mt-3 text-xs font-semibold text-primary">
                  {formatDate(event.at)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}