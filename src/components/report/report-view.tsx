"use client";

import {
  AlertTriangle,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Compass,
  GraduationCap,
  Heart,
  Home,
  Info,
  Languages,
  Orbit,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AstrologyReport } from "@/lib/ai/schemas";
import type { CalculatedChart } from "@/lib/astrology/types";
import { KundliChart } from "@/components/charts/kundli-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatDate, formatDegree, titleCase } from "@/lib/utils";
import { AskKundli } from "./ask-kundli";
import { DashaTimeline } from "./dasha-timeline";

const TABS = [
  ["overview", "Overview"],
  ["charts", "Charts"],
  ["planets", "Planets"],
  ["houses", "12 Houses"],
  ["dashas", "Dashas"],
  ["timing", "Transits"],
  ["rules", "Yogas & Doshas"],
  ["life", "Life areas"],
] as const;

type Tab = (typeof TABS)[number][0];

function StrengthBar({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold">{titleCase(label)}</span>
        <span className="text-muted">{score}/100</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised">
        <div
          className={cn(
            "h-full rounded-full",
            score >= 68
              ? "bg-positive"
              : score >= 42
                ? "bg-gold"
                : "bg-attention",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function InterpretationSection({
  title,
  section,
  icon: Icon,
}: {
  title: string;
  section: AstrologyReport["sections"]["career"];
  icon: typeof BriefcaseBusiness;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <Badge tone="primary">Traditional interpretation</Badge>
            <h3 className="mt-3 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm font-medium text-muted">
              {section.headline}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted">{section.analysis}</p>
        {(section.strengths.length > 0 ||
          section.considerations.length > 0) && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-[.1em] text-positive uppercase">
                Potential strengths
              </p>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {section.strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[.1em] text-attention uppercase">
                Considerations
              </p>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {section.considerations.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Info className="mt-0.5 size-4 shrink-0 text-attention" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportView({
  reportId,
  chart,
  interpretation,
  readOnly = false,
}: {
  reportId: string;
  chart: CalculatedChart;
  interpretation: AstrologyReport;
  readOnly?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [vargaCode, setVargaCode] = useState("D9");
  const selectedVarga = chart.divisionalCharts.find(
    (varga) => varga.code === vargaCode,
  );
  const detectedYogas = chart.yogas.filter((yoga) => yoga.detected);
  const relevantDoshas = chart.doshas.filter(
    (dosha) => dosha.detected || dosha.status === "tradition-dependent",
  );

  const slowIngresses = useMemo(
    () =>
      (chart.transits?.ingresses ?? []).filter((event) =>
        ["saturn", "jupiter", "rahu", "ketu", "mars", "venus", "mercury"].includes(
          event.planet,
        ),
      ),
    [chart.transits?.ingresses],
  );

  return (
    <div>
      <div className="no-print scrollbar-thin -mx-4 mb-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="inline-flex min-w-max gap-1 rounded-[10px] border border-line bg-surface p-1">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn(
                "min-h-10 rounded-[8px] px-3.5 text-sm font-semibold transition",
                tab === key
                  ? "bg-primary-soft text-primary-strong"
                  : "text-muted hover:bg-soft hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              ["Lagna", titleCase(chart.ascendant.sign), `${chart.ascendant.degreeInSign.toFixed(2)}°`],
              ["Rashi", titleCase(chart.rashi.moonSign), "Moon sign"],
              ["Nakshatra", chart.rashi.nakshatra.name, `Pada ${chart.rashi.nakshatra.pada}`],
              ["Mahadasha", titleCase(chart.dashas.current.mahadasha?.lord ?? "—"), chart.dashas.current.mahadasha ? `to ${formatDate(chart.dashas.current.mahadasha.end)}` : "—"],
              ["Antardasha", titleCase(chart.dashas.current.antardasha?.lord ?? "—"), chart.dashas.current.antardasha ? `to ${formatDate(chart.dashas.current.antardasha.end)}` : "—"],
              ["Ayanamsa", `${chart.ayanamsa.toFixed(4)}°`, "Lahiri"],
            ].map(([label, value, detail]) => (
              <Card key={label} className="p-4">
                <p className="text-xs font-semibold text-muted">{label}</p>
                <p className="mt-2 truncate font-display text-xl font-semibold" title={value}>
                  {value}
                </p>
                <p className="mt-1 text-[11px] text-muted">{detail}</p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,.72fr)]">
              <div className="p-5 sm:p-7">
                <KundliChart chart={chart} />
              </div>
              <div className="border-t border-line bg-soft/55 p-5 sm:p-7 lg:border-l lg:border-t-0">
                <Badge tone="primary">
                  <Sparkles className="size-3.5" />
                  AI interpretation
                </Badge>
                <h2 className="font-display mt-4 text-3xl font-semibold">
                  Executive summary
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {interpretation.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {interpretation.keyThemes.map((theme) => (
                    <Badge key={theme} tone="neutral">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Calculated data", chart.dataLabels.calculations, "text-positive", BookOpenCheck],
              ["AI interpretation", chart.dataLabels.interpretation, "text-primary", Sparkles],
              ["Traditional belief", chart.dataLabels.belief, "text-gold", Star],
              ["Uncertain prediction", chart.dataLabels.uncertainty, "text-attention", AlertTriangle],
            ].map(([title, text, tone, Icon]) => (
              <Card key={title as string} className="p-5">
                <Icon className={`size-5 ${tone}`} />
                <h3 className="mt-4 text-sm font-semibold">{title as string}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{text as string}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <InterpretationSection
              title="Lagna"
              section={interpretation.sections.lagna}
              icon={Compass}
            />
            <InterpretationSection
              title="Rashi"
              section={interpretation.sections.rashi}
              icon={Orbit}
            />
            <InterpretationSection
              title="Nakshatra"
              section={interpretation.sections.nakshatra}
              icon={Star}
            />
          </div>
        </div>
      )}

      {tab === "charts" && (
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit p-4">
            <p className="px-2 text-xs font-bold tracking-[.12em] text-muted uppercase">
              Divisional charts
            </p>
            <div className="mt-3 space-y-1">
              {chart.divisionalCharts.map((varga) => (
                <button
                  key={varga.code}
                  type="button"
                  disabled={!varga.available}
                  onClick={() => setVargaCode(varga.code)}
                  className={cn(
                    "flex min-h-12 w-full items-center justify-between rounded-[9px] px-3 text-left transition",
                    vargaCode === varga.code
                      ? "bg-primary-soft text-primary-strong"
                      : "hover:bg-soft",
                    !varga.available && "cursor-not-allowed opacity-45",
                  )}
                  title={varga.unavailableReason}
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      {varga.code} · {varga.name}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {varga.purpose}
                    </span>
                  </span>
                  {!varga.available && <Badge tone="attention">Hidden</Badge>}
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-5 sm:p-7">
            {selectedVarga?.available ? (
              <>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Badge tone="positive">Deterministically calculated</Badge>
                  <Badge tone="neutral">{selectedVarga.reliability}</Badge>
                  <Badge tone="neutral">{selectedVarga.ruleSet}</Badge>
                </div>
                <KundliChart
                  chart={chart}
                  divisionalChart={selectedVarga}
                />
                <p className="mt-5 text-xs leading-5 text-muted">
                  Divisional charts are derived from sidereal longitudes. Higher
                  Vargas are birth-time-sensitive; this application hides them
                  when time accuracy is not marked exact.
                </p>
              </>
            ) : (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div className="max-w-md">
                  <AlertTriangle className="mx-auto size-8 text-attention" />
                  <h2 className="mt-4 text-lg font-semibold">Chart unavailable</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {selectedVarga?.unavailableReason}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "planets" && (
        <Card className="overflow-hidden">
          <CardHeader>
            <Badge tone="positive">Calculated astronomical data</Badge>
            <h2 className="mt-3 text-xl font-semibold">Planetary positions</h2>
            <p className="mt-1 text-sm text-muted">
              Sidereal Lahiri longitudes from Swiss Ephemeris. Strength is an
              explainable screen, not Shadbala.
            </p>
          </CardHeader>
          <CardContent className="px-0 sm:px-0">
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[1060px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-y border-line bg-soft text-xs text-muted">
                    {[
                      "Planet",
                      "Sign & degree",
                      "House",
                      "Nakshatra",
                      "Pada",
                      "Motion",
                      "Combust",
                      "Dignity",
                      "Lordship",
                      "Strength",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-3 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.planets.map((planet) => (
                    <tr key={planet.name} className="border-b border-line last:border-0">
                      <td className="px-4 py-4">
                        <span className="font-semibold">
                          {planet.glyph} {titleCase(planet.name)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold">{titleCase(planet.sign)}</span>
                        <span className="ml-2 text-xs text-muted">
                          {formatDegree(planet.degreeInSign)}
                        </span>
                      </td>
                      <td className="px-4 py-4">{planet.house}</td>
                      <td className="px-4 py-4">{planet.nakshatra.name}</td>
                      <td className="px-4 py-4">{planet.nakshatra.pada}</td>
                      <td className="px-4 py-4">
                        {planet.retrograde ? (
                          <Badge tone="attention">Retrograde ℞</Badge>
                        ) : (
                          <span className="text-muted">Direct</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {planet.combust ? (
                          <Badge tone="danger">Yes</Badge>
                        ) : (
                          <span className="text-muted">No</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={planet.dignity === "debilitated" ? "attention" : "neutral"}>
                          {titleCase(planet.dignity)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {planet.lordships.length
                          ? planet.lordships.map((house) => `H${house}`).join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <StrengthBar
                          score={planet.strength.score}
                          label={planet.strength.label}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "houses" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {chart.houses.map((house) => (
            <details
              key={house.number}
              className="group rounded-[12px] border border-line bg-surface"
            >
              <summary className="flex min-h-[108px] list-none items-center gap-4 p-5">
                <span className="font-display grid size-12 shrink-0 place-items-center rounded-[11px] bg-gold-soft text-xl font-semibold text-gold">
                  {house.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">House {house.number}</h3>
                    <Badge tone="neutral">{titleCase(house.sign)}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {house.significance}
                  </p>
                </div>
                <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-line p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[9px] bg-soft p-4">
                    <p className="text-xs font-bold text-muted uppercase">Calculated</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">House lord</dt>
                        <dd className="font-semibold">{titleCase(house.lord)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Planets present</dt>
                        <dd className="text-right font-semibold">
                          {house.planets.length
                            ? house.planets.map(titleCase).join(", ")
                            : "None"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Aspected by</dt>
                        <dd className="text-right font-semibold">
                          {house.aspectedBy.length
                            ? house.aspectedBy.map(titleCase).join(", ")
                            : "None"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="rounded-[9px] bg-primary-soft/45 p-4">
                    <p className="text-xs font-bold text-primary uppercase">
                      Transparent strength screen
                    </p>
                    <div className="mt-3">
                      <StrengthBar
                        score={house.strength.score}
                        label={house.strength.label}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted">
                      This is not a full Bhava Bala or scientific measurement.
                    </p>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}

      {tab === "dashas" && (
        <Card className="p-5 sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Vimshottari Dasha timeline</h2>
            <p className="mt-1 text-sm text-muted">
              Select a Mahadasha to inspect its Antardasha periods.
            </p>
          </div>
          <DashaTimeline dasha={chart.dashas} />
        </Card>
      )}

      {tab === "timing" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge tone="positive">Actual calculated positions</Badge>
                  <h2 className="mt-3 text-xl font-semibold">Transit ingresses</h2>
                  <p className="mt-1 text-sm text-muted">
                    {slowIngresses.length} sign changes in the selected range.
                  </p>
                </div>
                <CalendarClock className="size-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative ml-3 border-l border-line pl-6">
                {slowIngresses.slice(0, 30).map((event) => (
                  <div key={`${event.planet}-${event.at}`} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-[31px] top-1 size-2.5 rounded-full border-2 border-surface bg-primary" />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {titleCase(event.planet)} enters {titleCase(event.toSign)}
                          {event.retrograde ? " ℞" : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          From {titleCase(event.fromSign)}
                        </p>
                      </div>
                      <Badge tone="neutral">{formatDate(event.at)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {interpretation.importantPeriods.length > 0 && (
            <Card>
              <CardHeader>
                <Badge tone="attention">Uncertain prediction</Badge>
                <h2 className="mt-3 text-xl font-semibold">Important periods</h2>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {interpretation.importantPeriods.map((period) => (
                    <div key={`${period.label}-${period.startDate}`} className="rounded-[10px] border border-line bg-soft p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{period.label}</h3>
                        <Badge
                          tone={
                            period.confidence === "high"
                              ? "positive"
                              : period.confidence === "medium"
                                ? "gold"
                                : "attention"
                          }
                        >
                          {titleCase(period.confidence)} confidence
                        </Badge>
                      </div>
                      {(period.startDate || period.endDate) && (
                        <p className="mt-2 text-xs font-semibold text-primary">
                          {period.startDate ? formatDate(period.startDate) : "—"} –{" "}
                          {period.endDate ? formatDate(period.endDate) : "—"}
                        </p>
                      )}
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {period.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "rules" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge tone="positive">Deterministic rule engine</Badge>
              <h2 className="mt-3 text-xl font-semibold">Yoga detection</h2>
              <p className="mt-1 text-sm text-muted">
                Gemini does not decide whether a yoga exists.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {detectedYogas.length ? (
                detectedYogas.map((yoga) => (
                  <details key={yoga.id} className="group rounded-[10px] border border-line bg-soft">
                    <summary className="flex min-h-16 list-none items-center gap-3 p-4">
                      <CheckCircle2 className="size-5 shrink-0 text-positive" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{yoga.name}</p>
                        <p className="mt-1 truncate text-xs text-muted">{yoga.rule}</p>
                      </div>
                      <ChevronDown className="size-4 text-muted transition group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-line px-4 py-4">
                      <p className="text-xs font-bold text-muted uppercase">Calculation basis</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted">
                        {yoga.basis.map((basis) => (
                          <li key={basis}>• {basis}</li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs leading-5 text-muted">{yoga.caveat}</p>
                    </div>
                  </details>
                ))
              ) : (
                <p className="text-sm text-muted">No supported yoga rule matched.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge tone="gold">Calm, non-fear-based screening</Badge>
              <h2 className="mt-3 text-xl font-semibold">Dosha analysis</h2>
              <p className="mt-1 text-sm text-muted">
                Tradition-dependent checks never imply guaranteed harm.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {relevantDoshas.map((dosha) => (
                <details key={dosha.id} className="group rounded-[10px] border border-line bg-soft">
                  <summary className="flex min-h-16 list-none items-center gap-3 p-4">
                    <AlertTriangle className="size-5 shrink-0 text-attention" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{dosha.name}</p>
                      <div className="mt-1 flex gap-2">
                        <Badge tone="attention">{dosha.status}</Badge>
                        {dosha.severity && <Badge>{dosha.severity} screen</Badge>}
                      </div>
                    </div>
                    <ChevronDown className="size-4 text-muted transition group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-line px-4 py-4">
                    <p className="text-xs font-bold text-muted uppercase">Calculation basis</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted">
                      {dosha.basis.map((basis) => (
                        <li key={basis}>• {basis}</li>
                      ))}
                    </ul>
                    <p className="mt-4 rounded-[8px] bg-attention-soft p-3 text-xs leading-5 text-attention">
                      {dosha.caveat}
                    </p>
                  </div>
                </details>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "life" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <InterpretationSection
            title="Career"
            section={interpretation.sections.career}
            icon={BriefcaseBusiness}
          />
          <InterpretationSection
            title="Money"
            section={interpretation.sections.money}
            icon={CircleDollarSign}
          />
          <InterpretationSection
            title="Property & home"
            section={interpretation.sections.property}
            icon={Home}
          />
          <InterpretationSection
            title="Marriage & relationships"
            section={interpretation.sections.relationships}
            icon={Heart}
          />
          <InterpretationSection
            title="Education"
            section={interpretation.sections.education}
            icon={GraduationCap}
          />
          <InterpretationSection
            title="Travel & foreign"
            section={interpretation.sections.travel}
            icon={Compass}
          />
          <InterpretationSection
            title="General wellbeing"
            section={interpretation.sections.health}
            icon={ShieldCheck}
          />
          <Card className="border-attention/25 bg-attention-soft/55 p-5">
            <Languages className="size-5 text-attention" />
            <h3 className="mt-4 font-semibold">Interpretation boundary</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Life-area content reflects traditional astrology beliefs. Health
              content is general only; financial and legal decisions require
              qualified professional advice.
            </p>
          </Card>
        </div>
      )}

      {!readOnly && (
        <div className="mt-6">
          <AskKundli reportId={reportId} />
        </div>
      )}

      <Card className="mt-6 border-attention/20 bg-attention-soft/55 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-attention" />
          <div>
            <p className="text-sm font-semibold">Astrology disclaimer</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {interpretation.disclaimer}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}