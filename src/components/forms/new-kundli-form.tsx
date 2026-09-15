"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  WandSparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type { KundliExtraction } from "@/lib/ai/schemas";
import type { LocationResult } from "@/lib/location/provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, FieldLabel, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Mode = "manual" | "upload";

const REPORT_SECTIONS = [
  ["career", "Career"],
  ["money", "Money"],
  ["property", "Property"],
  ["relationships", "Marriage & relationships"],
  ["education", "Education"],
  ["travel", "Travel & foreign"],
  ["dashas", "Dashas"],
  ["transits", "Transits"],
  ["yogas", "Yogas"],
  ["doshas", "Doshas"],
  ["remedies", "Traditional remedies"],
  ["health", "General wellbeing"],
] as const;

const PROGRESS_STEPS = [
  [12, "Calculating birth chart"],
  [32, "Calculating divisional charts"],
  [44, "Analyzing dashas, yogas and doshas"],
  [58, "Analyzing actual transits"],
  [74, "Generating grounded AI interpretation"],
  [90, "Creating interactive report"],
] as const;

interface FormState {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  place: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
  timeAccuracy: "exact" | "approximate" | "unknown";
}

const EMPTY_FORM: FormState = {
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

function extractedValue(
  extraction: KundliExtraction | null,
  key: "name" | "dateOfBirth" | "timeOfBirth" | "birthPlace",
) {
  return extraction?.[key].value?.trim() ?? "";
}

export function NewKundliForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "upload" ? "upload" : "manual",
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [reportType, setReportType] = useState<
    "basic" | "detailed" | "premium"
  >("premium");
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");
  const [sections, setSections] = useState<string[]>(
    REPORT_SECTIONS.map(([key]) => key),
  );
  const [startDate, setStartDate] = useState("2026-09-14");
  const [endDate, setEndDate] = useState("2027-12-31");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extraction, setExtraction] = useState<KundliExtraction | null>(null);
  const [uploadedName, setUploadedName] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<{
    status: string;
    progress: number;
    currentStep: string;
    reportId: string | null;
    error: string | null;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form.place.trim().length < 2 || form.latitude) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLocationBusy(true);
      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(form.place)}&language=${language}`,
          { signal: controller.signal },
        );
        const result = await response.json();
        if (response.ok) {
          setLocations(result.results ?? []);
          setLocationOpen(true);
        }
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") setLocations([]);
      } finally {
        setLocationBusy(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.place, form.latitude, language]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setJob(data.job);
          if (data.job.status === "COMPLETED" && data.job.reportId) {
            router.push(`/reports/${data.job.reportId}`);
          }
        }
      } catch {
        // A later poll can recover from a transient network failure.
      }
    };
    void poll();
    const timer = window.setInterval(poll, 900);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [jobId, router]);

  const mismatches = useMemo(() => {
    if (!extraction) return [];
    const pairs = [
      ["Name", form.name, extractedValue(extraction, "name")],
      ["Date of birth", form.dateOfBirth, extractedValue(extraction, "dateOfBirth")],
      ["Time of birth", form.timeOfBirth, extractedValue(extraction, "timeOfBirth")],
      ["Birth place", form.place, extractedValue(extraction, "birthPlace")],
    ];
    return pairs
      .filter(([, entered, extracted]) => entered && extracted)
      .filter(
        ([, entered, extracted]) =>
          entered.toLowerCase().replace(/\s+/g, " ").trim() !==
          extracted.toLowerCase().replace(/\s+/g, " ").trim(),
      )
      .map(([label, entered, extracted]) => ({ label, entered, extracted }));
  }, [extraction, form]);

  function chooseLocation(location: LocationResult) {
    setForm((current) => ({
      ...current,
      place: location.displayName,
      country: location.country,
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: location.timezone,
    }));
    setLocationOpen(false);
  }

  function resetLocation(value: string) {
    setLocations([]);
    setLocationOpen(false);
    setForm((current) => ({
      ...current,
      place: value,
      country: "",
      latitude: "",
      longitude: "",
      timezone: "",
    }));
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    setExtraction(null);
    setUploadedName(file.name);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch("/api/uploads/extract", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Extraction failed.");
      setExtraction(data.extracted);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to process this file.",
      );
    } finally {
      setUploading(false);
    }
  }

  function applyExtraction() {
    if (!extraction) return;
    setForm((current) => ({
      ...current,
      name: extractedValue(extraction, "name") || current.name,
      dateOfBirth:
        extractedValue(extraction, "dateOfBirth") || current.dateOfBirth,
      timeOfBirth:
        extractedValue(extraction, "timeOfBirth") || current.timeOfBirth,
      place: extractedValue(extraction, "birthPlace") || current.place,
      country: "",
      latitude: "",
      longitude: "",
      timezone: "",
    }));
    setMode("manual");
  }

  function loadSample() {
    setLocations([]);
    setLocationOpen(false);
    setForm({
      name: "Aarav Sharma",
      dateOfBirth: "1992-11-08",
      timeOfBirth: "06:42:00",
      place: "Pune, Maharashtra, India",
      country: "India",
      latitude: "18.5204",
      longitude: "73.8567",
      timezone: "Asia/Kolkata",
      timeAccuracy: "exact",
    });
    setError("");
  }

  async function generate() {
    setError("");
    if (
      !form.name ||
      !form.dateOfBirth ||
      !form.timeOfBirth ||
      !form.place ||
      !form.country ||
      !form.latitude ||
      !form.longitude ||
      !form.timezone
    ) {
      setError(
        "Complete the required birth details and choose a verified place result.",
      );
      return;
    }
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth: {
            name: form.name,
            dateOfBirth: form.dateOfBirth,
            timeOfBirth: form.timeOfBirth,
            place: form.place,
            country: form.country,
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            timezone: form.timezone,
            timeAccuracy: form.timeAccuracy,
          },
          report: {
            type: reportType,
            language,
            sections,
            startDate,
            endDate,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Generation failed.");
      setJobId(data.jobId);
      setJob({
        status: data.status,
        progress: data.progress,
        currentStep: "Queued securely",
        reportId: null,
        error: null,
      });
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Could not start generation.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <div className="inline-flex rounded-[10px] border border-line bg-soft p-1">
          {(
            [
              ["manual", "Enter birth details"],
              ["upload", "Upload existing Kundli"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={cn(
                "min-h-10 rounded-[8px] px-4 text-sm font-semibold transition",
                mode === value
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "upload" && (
          <Card className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="primary">
                  <FileText className="size-3.5" />
                  Document extraction
                </Badge>
                <h2 className="mt-4 text-xl font-semibold">
                  Upload your Kundli for review
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Gemini extracts visible values only. You confirm every field;
                  the app recalculates the chart independently instead of
                  trusting uploaded planetary values.
                </p>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              className="sr-only"
              onChange={handleUpload}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-6 flex min-h-[190px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-primary/35 bg-primary-soft/35 p-6 text-center transition hover:border-primary hover:bg-primary-soft/65"
            >
              {uploading ? (
                <Loader2 className="size-8 animate-spin text-primary" />
              ) : (
                <UploadCloud className="size-9 text-primary" />
              )}
              <span className="mt-4 font-semibold">
                {uploading
                  ? "Validating and extracting securely…"
                  : "Choose a PDF or image"}
              </span>
              <span className="mt-1 text-sm text-muted">
                PDF, PNG, JPG or JPEG · maximum 10 MB
              </span>
              {uploadedName && (
                <Badge className="mt-3" tone="neutral">
                  {uploadedName}
                </Badge>
              )}
            </button>

            {extraction && (
              <div className="mt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Extracted information</h3>
                    <p className="mt-1 text-sm text-muted">
                      Confirm before using these values.
                    </p>
                  </div>
                  <Button variant="secondary" onClick={applyExtraction}>
                    Use extracted birth details
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="mt-4 overflow-hidden rounded-[10px] border border-line">
                  {[
                    ["Name", extraction.name],
                    ["Date of birth", extraction.dateOfBirth],
                    ["Birth time", extraction.timeOfBirth],
                    ["Birth place", extraction.birthPlace],
                    ["Rashi", extraction.rashi],
                    ["Lagna", extraction.lagna],
                    ["Nakshatra", extraction.nakshatra],
                  ].map(([label, field]) => {
                    const value = field as KundliExtraction["name"];
                    return (
                      <div
                        key={label as string}
                        className="grid gap-1 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[160px_1fr_90px]"
                      >
                        <span className="text-sm font-semibold">{label as string}</span>
                        <span className="text-sm text-muted">
                          {value.value ?? "Not found"}
                        </span>
                        <span className="text-xs text-muted sm:text-right">
                          {Math.round(value.confidence * 100)}% confidence
                        </span>
                      </div>
                    );
                  })}
                </div>
                {mismatches.length > 0 && (
                  <div className="mt-4 rounded-[10px] border border-attention/25 bg-attention-soft p-4">
                    <div className="flex items-center gap-2 font-semibold text-attention">
                      <AlertCircle className="size-5" />
                      Information mismatch detected
                    </div>
                    <div className="mt-3 space-y-3">
                      {mismatches.map((mismatch) => (
                        <div
                          key={mismatch.label}
                          className="grid gap-2 text-sm sm:grid-cols-[130px_1fr_1fr]"
                        >
                          <span className="font-semibold">{mismatch.label}</span>
                          <span>Entered: {mismatch.entered}</span>
                          <span>Uploaded: {mismatch.extracted}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        <Card className="p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge tone="gold">Personal information</Badge>
              <h2 className="mt-4 text-xl font-semibold">Birth details</h2>
              <p className="mt-1 text-sm text-muted">
                Use the most precise recorded time available.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={loadSample}>
              Load sample data
            </Button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="full-name">Full name</FieldLabel>
              <Input
                id="full-name"
                autoComplete="name"
                placeholder="e.g. Sagar Bagwe"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
              <Input
                id="dob"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={form.dateOfBirth}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                  }))
                }
              />
              <p className="mt-1.5 text-xs text-muted">Displayed in your locale; stored as YYYY-MM-DD.</p>
            </div>
            <div>
              <FieldLabel htmlFor="tob">Exact time of birth</FieldLabel>
              <Input
                id="tob"
                type="time"
                step="1"
                value={form.timeOfBirth}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    timeOfBirth: event.target.value,
                  }))
                }
              />
            </div>
            <div className="relative sm:col-span-2">
              <FieldLabel htmlFor="birth-place">Birth place</FieldLabel>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  id="birth-place"
                  className="pl-10 pr-10"
                  placeholder="Search city, state or country"
                  value={form.place}
                  onFocus={() => locations.length && setLocationOpen(true)}
                  onChange={(event) => resetLocation(event.target.value)}
                  autoComplete="off"
                />
                {locationBusy ? (
                  <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted" />
                ) : (
                  <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                )}
              </div>
              {locationOpen && locations.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-[10px] border border-line bg-surface p-1 shadow-[var(--shadow)]">
                  {locations.map((location) => (
                    <button
                      type="button"
                      key={location.id}
                      onClick={() => chooseLocation(location)}
                      className="flex min-h-12 w-full items-center gap-3 rounded-[8px] px-3 text-left text-sm transition hover:bg-soft"
                    >
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {location.displayName}
                        </span>
                        <span className="block text-xs text-muted">
                          {location.latitude.toFixed(4)},{" "}
                          {location.longitude.toFixed(4)} · {location.timezone}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <Input
                id="country"
                value={form.country}
                placeholder="Detected from place"
                disabled
              />
            </div>
            <div>
              <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
              <Input
                id="timezone"
                value={form.timezone}
                placeholder="Automatically detected"
                disabled
              />
            </div>
            <div>
              <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
              <Input
                id="latitude"
                value={form.latitude}
                placeholder="Automatically detected"
                disabled
              />
            </div>
            <div>
              <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
              <Input
                id="longitude"
                value={form.longitude}
                placeholder="Automatically detected"
                disabled
              />
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Birth time accuracy</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["exact", "Exact", "From a reliable record"],
                  ["approximate", "Approximate", "Within several minutes"],
                  ["unknown", "Unknown", "Time is uncertain"],
                ] as const
              ).map(([value, label, description]) => (
                <label
                  key={value}
                  className={cn(
                    "flex min-h-[76px] items-start gap-3 rounded-[10px] border p-3.5 transition",
                    form.timeAccuracy === value
                      ? "border-primary bg-primary-soft/50"
                      : "border-line hover:bg-soft",
                  )}
                >
                  <input
                    type="radio"
                    name="timeAccuracy"
                    value={value}
                    checked={form.timeAccuracy === value}
                    onChange={() =>
                      setForm((current) => ({
                        ...current,
                        timeAccuracy: value,
                      }))
                    }
                    className="mt-1 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {form.timeAccuracy !== "exact" && (
            <div className="mt-4 flex gap-3 rounded-[10px] border border-attention/25 bg-attention-soft p-4 text-sm leading-6 text-attention">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              Ascendant, houses and divisional charts may be sensitive to
              birth-time accuracy. Higher Vargas will be hidden unless the time
              is marked exact.
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-7">
          <Badge tone="primary">Report customization</Badge>
          <h2 className="mt-4 text-xl font-semibold">Choose depth and focus</h2>

          <div className="mt-6">
            <FieldLabel>Report type</FieldLabel>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["basic", "Basic", "Core chart + summary"],
                  ["detailed", "Detailed", "Full houses and timing"],
                  ["premium", "Premium deep", "All supported evidence"],
                ] as const
              ).map(([value, label, description]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setReportType(value)}
                  className={cn(
                    "min-h-[86px] rounded-[10px] border p-4 text-left transition",
                    reportType === value
                      ? "border-primary bg-primary-soft/55"
                      : "border-line hover:bg-soft",
                  )}
                >
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel>Sections</FieldLabel>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {REPORT_SECTIONS.map(([key, label]) => {
                const checked = sections.includes(key);
                return (
                  <label
                    key={key}
                    className="flex min-h-11 items-center gap-3 rounded-[9px] border border-line px-3 text-sm transition hover:bg-soft"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSections((current) =>
                          checked
                            ? current.filter((item) => item !== key)
                            : [...current, key],
                        )
                      }
                      className="accent-[var(--primary)]"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <FieldLabel htmlFor="language">Report language</FieldLabel>
              <Select
                id="language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as "en" | "hi" | "mr")
                }
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </Select>
            </div>
            <div>
              <FieldLabel htmlFor="range-start">Start date</FieldLabel>
              <Input
                id="range-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="range-end">End date</FieldLabel>
              <Input
                id="range-end"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-[10px] border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <FieldError>{error}</FieldError>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card className="surface-card p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[10px] bg-gold-soft text-gold">
              <WandSparkles className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Ready to calculate</p>
              <p className="text-xs text-muted">Usually 30–90 seconds</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              ["Birth details", Boolean(form.name && form.dateOfBirth && form.timeOfBirth)],
              ["Verified location", Boolean(form.latitude && form.timezone)],
              ["Report sections", sections.length > 0],
              ["Valid date range", Boolean(startDate && endDate && endDate > startDate)],
            ].map(([label, complete]) => (
              <div key={label as string} className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full",
                    complete
                      ? "bg-positive-soft text-positive"
                      : "bg-soft text-muted",
                  )}
                >
                  {complete ? <Check className="size-3" /> : <span className="size-1 rounded-full bg-current" />}
                </span>
                <span className={complete ? "" : "text-muted"}>
                  {label as string}
                </span>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={Boolean(jobId) || sections.length === 0}
            onClick={generate}
          >
            {jobId ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate Kundli
          </Button>
          <p className="mt-3 text-center text-xs leading-5 text-muted">
            By continuing, you acknowledge the educational and entertainment
            disclaimer.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-positive" />
            Privacy & calculation policy
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
            <li>• Gemini API keys never enter the browser.</li>
            <li>• Uploaded files are validated by content, not extension.</li>
            <li>• AI cannot change calculated planetary positions.</li>
            <li>• Reports remain private unless you explicitly share one.</li>
          </ul>
        </Card>
      </aside>

      {job && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
          <Card
            className="surface-card w-full max-w-[580px] p-6 sm:p-8"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
                {job.status === "FAILED" ? (
                  <AlertCircle className="size-6 text-danger" />
                ) : job.status === "COMPLETED" ? (
                  <CheckCircle2 className="size-6 text-positive" />
                ) : (
                  <Loader2 className="size-6 animate-spin" />
                )}
              </span>
              <div>
                <Badge tone={job.status === "FAILED" ? "danger" : "primary"}>
                  {job.status.replaceAll("_", " ")}
                </Badge>
                <h2 className="font-display mt-3 text-2xl font-semibold">
                  {job.status === "FAILED"
                    ? "Generation stopped"
                    : job.status === "COMPLETED"
                      ? "Report ready"
                      : "Building your Kundli report"}
                </h2>
                <p className="mt-1 text-sm text-muted">{job.currentStep}</p>
              </div>
            </div>

            <div className="mt-7 h-2 overflow-hidden rounded-full bg-soft">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  job.status === "FAILED" ? "bg-danger" : "bg-primary",
                )}
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>{job.progress}% complete</span>
              <span>Do not close this tab</span>
            </div>

            <div className="mt-6 space-y-2">
              {PROGRESS_STEPS.map(([threshold, label]) => {
                const complete = job.progress > threshold;
                const active =
                  job.progress <= threshold &&
                  (PROGRESS_STEPS.find(
                    ([candidate]) => candidate >= job.progress,
                  )?.[0] ?? 100) === threshold;
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex min-h-9 items-center gap-3 rounded-[8px] px-2 text-sm",
                      active && "bg-primary-soft/55",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-full",
                        complete
                          ? "bg-positive-soft text-positive"
                          : active
                            ? "bg-primary-soft text-primary"
                            : "bg-soft text-muted",
                      )}
                    >
                      {complete ? (
                        <Check className="size-3" />
                      ) : active ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <span className="size-1 rounded-full bg-current" />
                      )}
                    </span>
                    <span className={complete || active ? "" : "text-muted"}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {job.error && (
              <div className="mt-5 rounded-[9px] bg-danger-soft p-4 text-sm text-danger">
                {job.error}
              </div>
            )}
            {job.status === "FAILED" && (
              <Button
                variant="secondary"
                className="mt-5 w-full"
                onClick={() => {
                  setJobId(null);
                  setJob(null);
                }}
              >
                Review details and retry
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}