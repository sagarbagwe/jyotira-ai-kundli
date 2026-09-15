"use client";

import { Check, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, Select } from "@/components/ui/field";

export function SettingsForm() {
  const [language, setLanguage] = useState("en");
  const [chartStyle, setChartStyle] = useState("north");
  const [saved, setSaved] = useState(false);

  function save() {
    localStorage.setItem("jyotira-language", language);
    localStorage.setItem("jyotira-chart-style", chartStyle);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <Badge tone="primary">Experience</Badge>
          <h2 className="mt-4 text-xl font-semibold">Language & display</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="setting-language">Default report language</FieldLabel>
              <Select
                id="setting-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </Select>
            </div>
            <div>
              <FieldLabel htmlFor="setting-chart">Default chart style</FieldLabel>
              <Select
                id="setting-chart"
                value={chartStyle}
                onChange={(event) => setChartStyle(event.target.value)}
              >
                <option value="north">North Indian</option>
                <option value="south">South Indian</option>
                <option value="east">East Indian</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <Badge tone="gold">Calculation tradition</Badge>
          <h2 className="mt-4 text-xl font-semibold">Methodology</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            These settings are deployment-level in this release so reports
            remain reproducible. The exact configuration is stored with every
            chart.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Zodiac", "Sidereal"],
              ["Ayanamsa", "Lahiri / Chitrapaksha"],
              ["House system", "Whole sign"],
              ["Lunar node", "True node"],
              ["Ephemeris", "Swiss Ephemeris"],
              ["Dasha year", "365.2425 days"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[9px] border border-line bg-soft p-4">
                <p className="text-xs font-semibold text-muted">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <Badge tone="positive">Privacy</Badge>
          <h2 className="mt-4 text-xl font-semibold">Report access</h2>
          <div className="mt-5 space-y-3">
            {[
              "Reports are private by default",
              "Share links require an explicit action",
              "Stored files use signed temporary URLs",
              "Gemini API keys remain server-side",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span className="grid size-5 place-items-center rounded-full bg-positive-soft text-positive">
                  <Check className="size-3" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Card className="surface-card p-5">
          <ShieldCheck className="size-7 text-positive" />
          <h2 className="mt-4 font-semibold">Reproducible by design</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            A methodology fingerprint and calculation checksum are persisted
            with each production report.
          </p>
          <Button className="mt-6 w-full" onClick={save}>
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved ? "Preferences saved" : "Save preferences"}
          </Button>
        </Card>
      </aside>
    </div>
  );
}