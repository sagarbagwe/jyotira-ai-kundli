"use client";

import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Loader2,
  Orbit,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { KundliAnswer } from "@/lib/ai/schemas";
import type {
  CalculatedChart,
  TransitIngress,
  TransitSnapshot,
} from "@/lib/astrology/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, Input } from "@/components/ui/field";
import { cn, formatDate, titleCase } from "@/lib/utils";

export function TransitPlanner({
  reportId,
  chart,
}: {
  reportId: string;
  chart: CalculatedChart;
}) {
  const [startDate, setStartDate] = useState("2026-09-14");
  const [endDate, setEndDate] = useState("2027-12-31");
  const [snapshots, setSnapshots] = useState<TransitSnapshot[]>(
    chart.transits?.snapshots ?? [],
  );
  const [ingresses, setIngresses] = useState<TransitIngress[]>(
    chart.transits?.ingresses ?? [],
  );
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [answer, setAnswer] = useState<KundliAnswer | null>(null);
  const [error, setError] = useState("");

  const snapshot = snapshots[selected] ?? snapshots[0];
  const activeDasha = useMemo(() => {
    if (!snapshot) return null;
    const instant = new Date(snapshot.date).getTime();
    const maha = chart.dashas.periods.find(
      (period) =>
        new Date(period.start).getTime() <= instant &&
        instant < new Date(period.end).getTime(),
    );
    const antar = maha?.subPeriods?.find(
      (period) =>
        new Date(period.start).getTime() <= instant &&
        instant < new Date(period.end).getTime(),
    );
    return { maha, antar };
  }, [chart.dashas.periods, snapshot]);

  async function calculate() {
    setBusy(true);
    setError("");
    setAnswer(null);
    try {
      const response = await fetch("/api/transits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, startDate, endDate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Calculation failed.");
      setSnapshots(data.transits.snapshots);
      setIngresses(data.transits.ingresses);
      setSelected(0);
    } catch (calculationError) {
      setError(
        calculationError instanceof Error
          ? calculationError.message
          : "Transit calculation failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function interpretMonth() {
    if (!snapshot) return;
    setInterpreting(true);
    setError("");
    try {
      const label = formatDate(snapshot.date, "en-IN", {
        month: "long",
        year: "numeric",
      });
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          question: `Using only my calculated chart and transits, what does ${label} traditionally indicate? Compare the active Vimshottari dasha with the transit positions. Include confidence and evidence.`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Interpretation failed.");
      setAnswer(data.answer);
    } catch (interpretError) {
      setError(
        interpretError instanceof Error
          ? interpretError.message
          : "Interpretation failed.",
      );
    } finally {
      setInterpreting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="transit-start">Start date</FieldLabel>
              <Input
                id="transit-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="transit-end">End date</FieldLabel>
              <Input
                id="transit-end"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <Button onClick={calculate} disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Orbit className="size-4" />
            )}
            Calculate actual transits
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Ranges are limited to two years per calculation. Positions come from
          Swiss Ephemeris; no AI is used in this step.
        </p>
        {error && (
          <div className="mt-4 rounded-[9px] bg-danger-soft p-3 text-sm text-danger">
            {error}
          </div>
        )}
      </Card>

      {snapshots.length > 0 && snapshot && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden">
            <div className="border-b border-line p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge tone="positive">
                    <CheckCircle2 className="size-3.5" />
                    Calculated monthly snapshot
                  </Badge>
                  <h2 className="font-display mt-3 text-2xl font-semibold">
                    {formatDate(snapshot.date, "en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                </div>
                <Button
                  variant="secondary"
                  onClick={interpretMonth}
                  disabled={interpreting}
                >
                  {interpreting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Interpret this month
                </Button>
              </div>
              <div className="scrollbar-thin -mx-5 mt-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
                <div className="flex min-w-max gap-2 pb-1">
                  {snapshots.map((item, index) => (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => {
                        setSelected(index);
                        setAnswer(null);
                      }}
                      className={cn(
                        "min-h-10 rounded-[8px] border px-3 text-xs font-semibold transition",
                        selected === index
                          ? "border-primary bg-primary-soft text-primary-strong"
                          : "border-line bg-surface text-muted hover:bg-soft",
                      )}
                    >
                      {formatDate(item.date, "en-IN", {
                        month: "short",
                        year: "2-digit",
                      })}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
              {snapshot.positions.map((position) => (
                <div key={position.planet} className="bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {titleCase(position.planet)}
                    </span>
                    {position.retrograde && (
                      <Badge tone="attention">℞</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {titleCase(position.sign)} {position.degreeInSign.toFixed(2)}°
                  </p>
                  <p className="mt-2 text-xs font-semibold text-primary">
                    Natal house {position.natalHouse}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <p className="text-xs font-bold tracking-[.12em] text-gold uppercase">
                Dasha at selected month
              </p>
              <p className="font-display mt-3 text-2xl font-semibold">
                {titleCase(activeDasha?.maha?.lord ?? "—")} /{" "}
                {titleCase(activeDasha?.antar?.lord ?? "—")}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">
                Calculated period dates. Traditional meaning requires combined
                chart judgment.
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-5 text-primary" />
                <h3 className="font-semibold">Nearby ingresses</h3>
              </div>
              <div className="mt-4 space-y-3">
                {ingresses
                  .filter((event) => {
                    const difference = Math.abs(
                      new Date(event.at).getTime() -
                        new Date(snapshot.date).getTime(),
                    );
                    return difference <= 45 * 86_400_000;
                  })
                  .filter((event) => event.planet !== "moon")
                  .slice(0, 7)
                  .map((event) => (
                    <div
                      key={`${event.planet}-${event.at}`}
                      className="rounded-[8px] bg-soft p-3"
                    >
                      <p className="text-sm font-semibold">
                        {titleCase(event.planet)} → {titleCase(event.toSign)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(event.at)}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {answer && (
        <Card className="border-primary/20 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">Traditional interpretation</Badge>
            <Badge tone={answer.confidence === "high" ? "positive" : "gold"}>
              {titleCase(answer.confidence)} confidence
            </Badge>
          </div>
          <p className="mt-4 text-[15px] leading-7">{answer.answer}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {answer.evidence.map((evidence) => (
              <div
                key={`${evidence.type}-${evidence.reference}`}
                className="rounded-[9px] border border-line bg-soft p-3"
              >
                <p className="text-xs font-semibold">
                  {titleCase(evidence.type)} · {evidence.reference}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {evidence.explanation}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted">
        Select a month, then request interpretation
        <ArrowRight className="size-3.5" />
      </div>
    </div>
  );
}