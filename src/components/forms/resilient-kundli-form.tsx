"use client";

import {
  AlertCircle,
  Check,
  FileText,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import type { KundliExtraction } from "@/lib/ai/schemas";
import { STATELESS_REPORT_KEY } from "@/lib/stateless-report";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, Input, Select } from "@/components/ui/field";

type LocationResult = {
  id: string;
  displayName: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type BirthState = {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  place: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
  timeAccuracy: "exact" | "approximate" | "unknown";
};

const TODAY = new Date().toISOString().slice(0, 10);
const NEXT_YEAR = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
})();

const REPORT_SECTIONS = [
  "career",
  "money",
  "property",
  "relationships",
  "education",
  "travel",
  "dashas",
  "transits",
  "yogas",
  "doshas",
  "remedies",
  "health",
];

const EMPTY_BIRTH: BirthState = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  place: "",
  country: "",
  latitude: "",
  longitude: "",
  timezone: "",
  timeAccuracy: "exact",
};

async function readApiJson<T>(response: Response, operation: string): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(
      `${operation} returned an empty response (HTTP ${response.status || "network failure"}). Open Vercel → Logs → Functions for the server error.`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `${operation} returned a non-JSON response (HTTP ${response.status}). Please redeploy the latest main branch.`,
    );
  }
}

function extractedValue(
  extraction: KundliExtraction,
  key: "name" | "dateOfBirth" | "timeOfBirth" | "birthPlace",
) {
  return extraction[key].value?.trim() ?? "";
}

export function ResilientKundliForm() {
  const router = useRouter();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [birth, setBirth] = useState<BirthState>(EMPTY_BIRTH);
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");
  const [reportType, setReportType] = useState<"basic" | "detailed" | "premium">("premium");
  const [startDate, setStartDate] = useState(TODAY);
  const [endDate, setEndDate] = useState(NEXT_YEAR);
  const [error, setError] = useState("");
  const [placeBusy, setPlaceBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [generationBusy, setGenerationBusy] = useState(false);
  const [extraction, setExtraction] = useState<KundliExtraction | null>(null);

  const complete = Boolean(
    birth.name &&
      birth.dateOfBirth &&
      birth.timeOfBirth &&
      birth.place &&
      birth.country &&
      birth.latitude &&
      birth.longitude &&
      birth.timezone &&
      startDate &&
      endDate,
  );

  async function searchPlace() {
    if (birth.place.trim().length < 2 || placeBusy) return;
    setPlaceBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(birth.place.trim())}&language=${language}`,
        { headers: { Accept: "application/json" }, cache: "no-store" },
      );
      const data = await readApiJson<{ results?: LocationResult[]; error?: string }>(
        response,
        "Birth-place search",
      );
      if (!response.ok) throw new Error(data.error ?? `Birth-place search failed (HTTP ${response.status}).`);
      const results = data.results ?? [];
      setLocations(results);
      if (!results.length) setError("No matching place found. Add the state or country and search again.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Birth-place search failed.");
    } finally {
      setPlaceBusy(false);
    }
  }

  function chooseLocation(location: LocationResult) {
    setBirth((current) => ({
      ...current,
      place: location.displayName,
      country: location.country,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: location.timezone,
    }));
    setLocations([]);
  }

  async function uploadKundli(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    setExtraction(null);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/uploads/extract", { method: "POST", body });
      const data = await readApiJson<{ extracted?: KundliExtraction; error?: string }>(
        response,
        "Kundli extraction",
      );
      if (!response.ok || !data.extracted) {
        throw new Error(data.error ?? `Kundli extraction failed (HTTP ${response.status}).`);
      }
      setExtraction(data.extracted);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kundli extraction failed.");
    } finally {
      setUploadBusy(false);
      event.target.value = "";
    }
  }

  function applyExtraction() {
    if (!extraction) return;
    setBirth((current) => ({
      ...current,
      name: extractedValue(extraction, "name") || current.name,
      dateOfBirth: extractedValue(extraction, "dateOfBirth") || current.dateOfBirth,
      timeOfBirth: extractedValue(extraction, "timeOfBirth") || current.timeOfBirth,
      place: extractedValue(extraction, "birthPlace") || current.place,
      country: "",
      latitude: "",
      longitude: "",
      timezone: "",
    }));
    setExtraction(null);
  }

  async function generateReport() {
    if (!complete || generationBusy) {
      setError("Complete the birth details and choose a verified place first.");
      return;
    }
    setGenerationBusy(true);
    setError("");
    try {
      const response = await fetch("/api/stateless/report", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          birth: {
            ...birth,
            latitude: Number(birth.latitude),
            longitude: Number(birth.longitude),
          },
          report: {
            type: reportType,
            language,
            sections: REPORT_SECTIONS,
            startDate,
            endDate,
          },
        }),
      });
      const data = await readApiJson<{ artifact?: unknown; error?: string }>(
        response,
        "Kundli generation",
      );
      if (!response.ok || !data.artifact) {
        throw new Error(data.error ?? `Kundli generation failed (HTTP ${response.status}).`);
      }
      window.sessionStorage.setItem(STATELESS_REPORT_KEY, JSON.stringify(data.artifact));
      router.push("/reports/local");
    } catch (cause) {
      setError(
        cause instanceof DOMException && cause.name === "QuotaExceededError"
          ? "The report is too large for browser session storage. Use a shorter transit range."
          : cause instanceof Error
            ? cause.message
            : "Kundli generation failed.",
      );
      setGenerationBusy(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge tone="gold">Birth information</Badge>
              <h2 className="mt-3 text-xl font-semibold">Create a calculated Kundli</h2>
              <p className="mt-1 text-sm text-muted">Nothing is saved to an account or database.</p>
            </div>
            <Badge tone="positive"><ShieldCheck className="size-3.5" /> Browser session only</Badge>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" value={birth.name} placeholder="Full name" onChange={(event) => setBirth((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div>
              <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
              <Input id="dob" type="date" max={TODAY} value={birth.dateOfBirth} onChange={(event) => setBirth((current) => ({ ...current, dateOfBirth: event.target.value }))} />
            </div>
            <div>
              <FieldLabel htmlFor="tob">Time of birth</FieldLabel>
              <Input id="tob" type="time" step="1" value={birth.timeOfBirth} onChange={(event) => setBirth((current) => ({ ...current, timeOfBirth: event.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="place">Birth place</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="place"
                  value={birth.place}
                  placeholder="City, state, country"
                  onChange={(event) => {
                    setBirth((current) => ({ ...current, place: event.target.value, country: "", latitude: "", longitude: "", timezone: "" }));
                    setLocations([]);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void searchPlace();
                    }
                  }}
                />
                <Button variant="secondary" disabled={placeBusy} onClick={() => void searchPlace()}>
                  {placeBusy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Search
                </Button>
              </div>
              {locations.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-[10px] border border-line">
                  {locations.map((location) => (
                    <button key={location.id} type="button" onClick={() => chooseLocation(location)} className="flex min-h-12 w-full items-center gap-3 border-b border-line px-3 text-left text-sm last:border-0 hover:bg-soft">
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <span><span className="block font-semibold">{location.displayName}</span><span className="text-xs text-muted">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} · {location.timezone}</span></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {[["Country", birth.country], ["Timezone", birth.timezone], ["Latitude", birth.latitude], ["Longitude", birth.longitude]].map(([label, value]) => (
              <div key={label}><FieldLabel>{label}</FieldLabel><Input value={value} disabled placeholder="Detected from place" /></div>
            ))}
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="accuracy">Birth time accuracy</FieldLabel>
              <Select id="accuracy" value={birth.timeAccuracy} onChange={(event) => setBirth((current) => ({ ...current, timeAccuracy: event.target.value as BirthState["timeAccuracy"] }))}>
                <option value="exact">Exact</option><option value="approximate">Approximate</option><option value="unknown">Unknown</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-7">
          <div className="flex gap-3"><FileText className="mt-1 size-5 text-primary" /><div><h2 className="text-lg font-semibold">Upload an existing Kundli</h2><p className="mt-1 text-sm text-muted">Processed in memory and never retained.</p></div></div>
          <input ref={uploadRef} className="sr-only" type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={uploadKundli} />
          <button type="button" onClick={() => uploadRef.current?.click()} className="mt-5 flex min-h-28 w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-primary/35 bg-primary-soft/35 p-5 hover:bg-primary-soft/60">
            {uploadBusy ? <Loader2 className="size-7 animate-spin text-primary" /> : <UploadCloud className="size-7 text-primary" />}
            <span className="mt-2 text-sm font-semibold">{uploadBusy ? "Extracting…" : "Choose PDF or image"}</span>
          </button>
          {extraction && <div className="mt-4 rounded-[10px] border border-line bg-soft p-4 text-sm"><p>Name: {extraction.name.value ?? "Not found"}</p><p>DOB: {extraction.dateOfBirth.value ?? "Not found"}</p><p>Time: {extraction.timeOfBirth.value ?? "Not found"}</p><p>Place: {extraction.birthPlace.value ?? "Not found"}</p><Button className="mt-4" variant="secondary" onClick={applyExtraction}><Check className="size-4" /> Use details</Button></div>}
        </Card>

        <Card className="p-5 sm:p-7">
          <Badge tone="primary">Report options</Badge>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><FieldLabel htmlFor="depth">Depth</FieldLabel><Select id="depth" value={reportType} onChange={(event) => setReportType(event.target.value as typeof reportType)}><option value="basic">Basic</option><option value="detailed">Detailed</option><option value="premium">Premium deep analysis</option></Select></div>
            <div><FieldLabel htmlFor="language">Language</FieldLabel><Select id="language" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}><option value="en">English</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></Select></div>
            <div><FieldLabel htmlFor="start">Transit start</FieldLabel><Input id="start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div>
            <div><FieldLabel htmlFor="end">Transit end</FieldLabel><Input id="end" type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div>
          </div>
        </Card>

        {error && <div className="flex gap-3 rounded-[10px] border border-danger/25 bg-danger-soft p-4 text-sm text-danger"><AlertCircle className="size-5 shrink-0" /><span>{error}</span></div>}
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Card className="p-5">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[10px] bg-gold-soft text-gold"><Sparkles className="size-5" /></span><div><p className="font-semibold">Gemini-only analysis</p><p className="text-xs text-muted">No database or account</p></div></div>
          <ul className="mt-5 space-y-3 text-sm text-muted"><li>• Swiss Ephemeris calculates the chart.</li><li>• Gemini interprets calculated data.</li><li>• Your report stays in this browser tab.</li><li>• Save or print before closing it.</li></ul>
          <Button className="mt-6 w-full" size="lg" disabled={!complete || generationBusy} onClick={() => void generateReport()}>{generationBusy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{generationBusy ? "Generating…" : "Generate Kundli"}</Button>
        </Card>
      </aside>
    </div>
  );
}
