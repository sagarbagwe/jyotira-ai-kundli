import {
  AlertTriangle,
  CheckCircle2,
  HeartHandshake,
  Info,
  Scale,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import { getDemoArtifact } from "@/lib/demo";
import { titleCase } from "@/lib/utils";

export const metadata = { title: "Compatibility" };

export default async function CompatibilityPage() {
  const first = (await getDemoArtifact()).chart;
  const second = await getAstrologyEngine().calculateNatal({
    name: "Mira Iyer",
    dateOfBirth: "1994-04-19",
    timeOfBirth: "14:18:00",
    place: "Bengaluru, Karnataka",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: "Asia/Kolkata",
    timeAccuracy: "exact",
  });

  const firstManglik = first.doshas.find((dosha) => dosha.id === "manglik");
  const secondManglik = second.doshas.find((dosha) => dosha.id === "manglik");
  const factors = [
    {
      label: "Moon signs",
      left: titleCase(first.rashi.moonSign),
      right: titleCase(second.rashi.moonSign),
      note: "Emotional-style comparison in traditional practice",
    },
    {
      label: "Nakshatras",
      left: first.rashi.nakshatra.name,
      right: second.rashi.nakshatra.name,
      note: "Foundation for a future full Ashtakoota module",
    },
    {
      label: "7th house lords",
      left: titleCase(first.houses[6].lord),
      right: titleCase(second.houses[6].lord),
      note: "Partnership significators; not an outcome guarantee",
    },
    {
      label: "Manglik screen",
      left: firstManglik?.detected ? "Matched" : "Not detected",
      right: secondManglik?.detected ? "Matched" : "Not detected",
      note: "Displayed calmly; exemptions and traditions vary",
    },
  ];

  return (
    <AppShell
      title="Compatibility"
      description="Compare calculated chart factors without reducing a relationship to a deterministic verdict."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {[first, second].map((chart, index) => (
          <Card key={chart.input.name} className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone={index === 0 ? "primary" : "gold"}>
                  Profile {index + 1}
                </Badge>
                <h2 className="font-display mt-4 text-2xl font-semibold">
                  {chart.input.name}
                </h2>
                <p className="mt-1 text-sm text-muted">{chart.input.place}</p>
              </div>
              <span className="grid size-11 place-items-center rounded-[11px] bg-primary-soft text-primary">
                <HeartHandshake className="size-5" />
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                ["Lagna", titleCase(chart.ascendant.sign)],
                ["Rashi", titleCase(chart.rashi.moonSign)],
                ["Nakshatra", chart.rashi.nakshatra.name],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-soft p-3">
                  <p className="text-[10px] font-bold text-muted uppercase">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold" title={value}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
          <div>
            <Badge tone="positive">
              <CheckCircle2 className="size-3.5" />
              Calculated comparison
            </Badge>
            <h2 className="mt-3 text-xl font-semibold">Traditional factor review</h2>
          </div>
          <Scale className="size-6 text-primary" />
        </div>
        <div className="divide-y divide-line">
          {factors.map((factor) => (
            <div
              key={factor.label}
              className="grid gap-3 p-5 sm:grid-cols-[180px_1fr_1fr] sm:items-center sm:p-6"
            >
              <div>
                <p className="font-semibold">{factor.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{factor.note}</p>
              </div>
              <div className="rounded-[9px] bg-primary-soft p-3 text-sm font-semibold">
                {factor.left}
              </div>
              <div className="rounded-[9px] bg-gold-soft p-3 text-sm font-semibold">
                {factor.right}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="border-attention/20 bg-attention-soft/55 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-attention" />
            <div>
              <p className="font-semibold">No compatibility verdict</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                A score or chart cannot establish relationship quality, safety
                or success. Communication, consent, values and lived experience
                matter more than traditional indicators.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Current module scope</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                This view compares transparent chart factors. It does not label
                itself as a full Ashtakoota/Guna Milan calculation until that
                deterministic ruleset and tradition options are implemented.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}