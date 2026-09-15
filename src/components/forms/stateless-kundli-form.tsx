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
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import type { KundliExtraction } from "@/lib/ai/schemas";
import type { LocationResult } from "@/lib/location/provider";
import { STATELESS_REPORT_KEY } from "@/lib/stateless-report";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabel, Input, Select } from "@/components/ui/field";

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
] as const;

const PROGRESS_LABELS = [
  "Calculating the sidereal birth chart",
  "Deriving divisional charts and Vimshottari dashas",
  "Evaluating deterministic yogas and doshas",
  "Calculating transits",
  "Generating grounded Gemini interpretation",
  "Preparing your private browser-session report",
];

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

function fieldValue(
  extraction: KundliExtraction,
  key: "name" | "dateOfBirth" | "timeOfBirth" | "birthPlace",
) {
  return extraction[key].value?.trim() ?? "";
}

export function StatelessKundliForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [birth, setBirth] = useState<BirthState>(EMPTY_BIRTH);
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [locationBusy, setLocationBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadedName, setUploadedName] = useState("");
  const [extraction, setExtraction] = useState<KundliExtraction | null>(null);
  const [reportType, setReportType] = useState<"basic" | "detailed" | "premium">("premium");
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const nextYear = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
  }, []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextYear);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

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
    if (birth.place.trim().length < 2) return;
    setLocationBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(birth.place)}&language=${language}`,
      );
      const data = (await response.json()) as {
        results?: LocationResult[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Place search failed.");
      setLocations(data.results ?? []);
      if (!data.results?.length) setError("No matching place found. Try adding the state or country.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Place search failed.");
    } finally {
      setLocationBusy(false);
    }
  }

  function selectLocation(location: LocationResult) {
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

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    setUploadedName(file.name);
    setExtraction(null);
    setError("");
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch("/api/uploads/extract", {
        method: "POST",
        body: payload,
      });
      const data = (await response.json()) as {
        extracted?: KundliExtraction;
        error?: string;
      };
      if (!response.ok || !data.extracted) {
        throw new Error(data.error ?? "Kundli extraction failed.");
      }
      setExtraction(data.extracted);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kundli extraction failed.");
    } finally {
      setUploadBusy(false);
    }
  }

  function useExtraction() {
    if (!extraction) return;
    setBirth((current) => ({
      ...current,
      name: fieldValue(extraction, "name") || current.name,
      dateOfBirth: fieldValue(extraction, "dateOfBirth") || current.dateOfBirth,
      timeOfBirth: fieldValue(extraction, "timeOfBirth") || current.timeOfBirth,
      place: fieldValue(extraction, "birthPlace") || current.place,
      country: "",
      latitude: "",
      longitude: "",
      timezone: "",
    }));
    setLocations([]);
  }

  async function generate() {
    if (!complete || busy) {
      setError("Complete the birth details and select a verified place first.");
      return;
    }
    setBusy(true);
    setProgress(8);
    setError("");
    const timer = window.setInterval(
      () => setProgress((current) => Math.min(current + Math.max(1, Math.round((94 - current) / 12)), 94)),
      900,
    );
    try {
      const response = await fetch("/api/stateless/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth: {
            ...birth,
            latitude: Number(birth.latitude),
            longitude: Number(birth.longitude),
          },
          report: {
            type: reportType,
            language,
            sections: [...REPORT_SECTIONS],
            startDate,
            endDate,
          },
        }),
      });
      const data = (await response.json()) as {
        artifact?: unknown;
        error?: string;
      };
      if (!response.ok || !data.artifact) {
        throw new Error(data.error ?? "Report generation failed.");
      }
      setProgress(100);
      window.sessionStorage.setItem(
        STATELESS_REPORT_KEY,
        JSON.stringify(data.artifact),
      );
      router.push("/reports/local");
    } catch (cause) {
      setError(
        cause instanceof DOMException && cause.name === "QuotaExceededError"
          ? "The generated report is too large for this browser session. Try a shorter transit range."
          : cause instanceof Error
            ? cause.message
            : "Report generation failed.",
      );
      setBusy(false);
      setProgress(0);
    } finally {
      window.clearInterval(timer);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card className="p-5 sm:p-7">
          <Badge tone="gold">Birth information</Badge>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Create a calculated Kundli</h2>
              <p className="mt-1 text-sm text-muted">
                Nothing is saved to an account or database.
              </p>
            </div>
            <Badge tone="positive">
              <ShieldCheck className="size-3.5" /> Browser session only
            </Badge>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                value={birth.name}
                onChange={(event) => setBirth((current) => ({ ...current, name: event.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
              <Input
                id="dob"
                type="date"
                max={today}
                value={birth.dateOfBirth}
                onChange={(event) => setBirth((current) => ({ ...current, dateOfBirth: event.target.value }))}
              />
            </div>
            <div>
              <FieldLabel htmlFor="tob">Time of birth</FieldLabel>
              <Input
                id="tob"
                type="time"
                step="1"
                value={birth.timeOfBirth}
                onChange={(event) => setBirth((current) => ({ ...current, timeOfBirth: event.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="place">Birth place</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="place"
                  value={birth.place}
                  onChange={(event) => {
                    setBirth((current) => ({
                      ...current,
                      place: event.target.value,
                      country: "",
                      latitude: "",
                      longitude: "",
                      timezone: "",
                    }));
                    setLocations([]);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void searchPlace();
                    }
                  }}
                  placeholder="City, state, country"
                />
                <Button variant="secondary" onClick={searchPlace} disabled={locationBusy}>
                  {locationBusy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  Search
                </Button>
              </div>
              {locations.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-[10px] border border-line">
                  {locations.slice(0, 6).map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => selectLocation(location)}
                      className="flex min-h-12 w-full items-center gap-3 border-b border-line px-3 text-left text-sm last:border-0 hover:bg-soft"
                    >
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <span>
                        <span className="block font-semibold">{location.displayName}</span>
                        <span className="text-xs text-muted">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} · {location.timezone}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {[
              ["Country", birth.country],
              ["Timezone", birth.timezone],
              ["Latitude", birth.latitude],
              ["Longitude", birth.longitude],
            ].map(([label, value]) => (
              <div key={label}>
                <FieldLabel>{label}</FieldLabel>
                <Input value={value} disabled placeholder="Detected from place" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="accuracy">Birth time accuracy</FieldLabel>
              <Select
                id="accuracy"
                value={birth.timeAccuracy}
                onChange={(event) => setBirth((current) => ({
                  ...current,
                  timeAccuracy: event.target.value as BirthState["timeAccuracy"],
                }))}
              >
                <option value="exact">Exact</option>
                <option value="approximate">Approximate</option>
                <option value="unknown">Unknown</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <FileText className="mt-1 size-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Upload an existing Kundli</h2>
              <p className="mt-1 text-sm text-muted">
                Gemini extracts visible birth details for confirmation. The file is processed in memory and is not retained.
              </p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="sr-only"
            onChange={upload}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-5 flex min-h-32 w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-primary/35 bg-primary-soft/35 p-5 hover:bg-primary-soft/60"
          >
            {uploadBusy ? <Loader2 className="size-7 animate-spin text-primary" /> : <UploadCloud className="size-7 text-primary" />}
            <span className="mt-3 text-sm font-semibold">
              {uploadBusy ? "Extracting securely…" : "Choose PDF or image"}
            </span>
            <span className="mt-1 text-xs text-muted">PDF, PNG or JPEG · maximum 10 MB</span>
          </button>
          {uploadedName && <p className="mt-3 text-xs text-muted">Selected: {uploadedName}</p>}
          {extraction && (
            <div className="mt-4 rounded-[10px] border border-line bg-soft p-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><b>Name:</b> {extraction.name.value ?? "Not found"}</p>
                <p><b>DOB:</b> {extraction.dateOfBirth.value ?? "Not found"}</p>
                <p><b>Time:</b> {extraction.timeOfBirth.value ?? "Not found"}</p>
                <p><b>Place:</b> {extraction.birthPlace.value ?? "Not found"}</p>
              </div>
              <Button className="mt-4" variant="secondary" onClick={useExtraction}>
                <Check className="size-4" /> Use extracted details
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-7">
          <Badge tone="primary">Report options</Badge>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="type">Depth</FieldLabel>
              <Select id="type" value={reportType} onChange={(event) => setReportType(event.target.value as typeof reportType)}>
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="premium">Premium deep analysis</option>
              </Select>
            </div>
            <div>
              <FieldLabel htmlFor="language">Language</FieldLabel>
              <Select id="language" value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </Select>
            </div>
            <div>
              <FieldLabel htmlFor="start">Transit start</FieldLabel>
              <Input id="start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="end">Transit end</FieldLabel>
              <Input id="end" type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
          </div>
        </Card>

        {error && (
          <div className="flex gap-3 rounded-[10px] border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
            <AlertCircle className="size-5 shrink-0" /> {error}
          </div>
        )}
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Card className="surface-card p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[10px] bg-gold-soft text-gold">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Gemini-only analysis</p>
              <p className="text-xs text-muted">No account or database required</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-muted">
            <li>• Swiss Ephemeris performs all chart calculations.</li>
            <li>• Gemini interprets calculated structured data.</li>
            <li>• The completed report stays in this browser tab.</li>
            <li>• Download or print before closing the session.</li>
          </ul>
          <Button className="mt-6 w-full" size="lg" disabled={!complete || busy} onClick={generate}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {busy ? "Generating…" : "Generate Kundli"}
          </Button>
        </Card>
      </aside>

      {busy && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl p-6 sm:p-8" role="status" aria-live="polite">
            <div className="flex items-start gap-4">
              <span className="grid size-12 place-items-center rounded-[12px] bg-primary-soft text-primary">
                <Loader2 className="size-6 animate-spin" />
              </span>
              <div>
                <Badge tone="primary">Gemini + calculated astrology</Badge>
                <h2 className="mt-3 text-2xl font-semibold">Building your report</h2>
                <p className="mt-1 text-sm text-muted">Keep this tab open until the report appears.</p>
              </div>
            </div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>{progress}%</span>
              <span>{PROGRESS_LABELS[Math.min(PROGRESS_LABELS.length - 1, Math.floor(progress / 17))]}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
