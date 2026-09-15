import {
  ArrowRight,
  BrainCircuit,
  Calculator,
  Check,
  FileScan,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/app/brand";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { VedicWheel } from "@/components/landing/vedic-wheel";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  const features = [
    {
      icon: Calculator,
      title: "Real chart calculations",
      text: "Swiss Ephemeris positions, Lahiri ayanamsa, whole-sign houses and deterministic Vedic rules.",
    },
    {
      icon: BrainCircuit,
      title: "Grounded Gemini analysis",
      text: "Gemini receives structured calculations and returns schema-validated interpretations—never guessed planets.",
    },
    {
      icon: Orbit,
      title: "Dashas & transits",
      text: "Vimshottari timelines and actual gochar positions combine into transparent, evidence-linked periods.",
    },
    {
      icon: FileScan,
      title: "Kundli document import",
      text: "Upload a PDF or image, review extracted values and resolve mismatches before a report is generated.",
    },
    {
      icon: Globe2,
      title: "English, हिंदी, मराठी",
      text: "Choose a report language now; the localization architecture is ready for additional languages.",
    },
    {
      icon: LockKeyhole,
      title: "Private by design",
      text: "Server-side AI keys, authenticated access, validated uploads and expiring object-storage links.",
    },
  ];

  return (
    <div className="app-background min-h-screen overflow-hidden">
      <div className="hero-stars pointer-events-none absolute inset-x-0 top-0 h-[760px]" />

      <header className="relative z-20 px-4 pt-4 sm:px-6">
        <nav className="glass mx-auto flex h-16 max-w-[1180px] items-center rounded-[12px] px-3 sm:px-5">
          <Brand />
          <div className="ml-auto hidden items-center gap-7 text-sm font-semibold text-muted md:flex">
            <a href="#method" className="transition hover:text-foreground">
              Method
            </a>
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#safety" className="transition hover:text-foreground">
              Safety
            </a>
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-7">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                buttonStyles({ variant: "secondary", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/new-kundli"
              className={buttonStyles({ size: "sm" })}
            >
              Create Kundli
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative">
        <section className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.04fr_.96fr] lg:pb-28">
          <div className="animate-fade-up">
            <Badge tone="gold">
              <Sparkles className="size-3.5" />
              Calculations first. Interpretation second.
            </Badge>
            <h1 className="font-display text-balance mt-6 max-w-[720px] text-[48px] leading-[1.02] font-semibold sm:text-[64px] lg:text-[70px]">
              Understand Your Kundli With AI
            </h1>
            <p className="mt-6 max-w-[650px] text-lg leading-8 text-muted">
              Generate a detailed Vedic astrology report using calculated
              birth-chart data and AI-assisted interpretation—clearly labeled,
              grounded and never presented as certainty.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/new-kundli"
                className={buttonStyles({ size: "lg" })}
              >
                Create Your Kundli
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/new-kundli?mode=upload"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                <FileScan className="size-4" />
                Upload Existing Kundli
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
              {[
                "Swiss Ephemeris",
                "Gemini via backend",
                "Private reports",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-positive-soft text-positive">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
            <div className="animate-float relative">
              <VedicWheel className="mx-auto w-[92%] max-w-[500px] drop-shadow-[0_28px_50px_rgba(46,37,91,.12)]" />
              <Card className="surface-card absolute right-0 top-[12%] w-[196px] p-4">
                <p className="text-[11px] font-bold tracking-[.12em] text-muted uppercase">
                  Calculated
                </p>
                <p className="mt-2 font-display text-xl font-semibold">
                  Lahiri sidereal
                </p>
                <p className="mt-1 text-xs text-muted">
                  Longitudes, houses & nodes
                </p>
              </Card>
              <Card className="surface-card absolute bottom-[8%] left-0 w-[210px] p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-positive" />
                  <p className="font-semibold">Evidence attached</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Dasha · transit · house · planet
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section id="method" className="border-y border-line bg-surface/72">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-bold tracking-[.15em] text-gold uppercase">
                The integrity pipeline
              </p>
              <h2 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">
                The model explains the math. It does not invent it.
              </h2>
            </div>
            <div className="mt-10 grid gap-3 lg:grid-cols-5">
              {[
                ["01", "Birth information", "Validated time, place and accuracy"],
                ["02", "Location resolution", "Coordinates and IANA timezone"],
                ["03", "Astronomical engine", "Ephemeris, ascendant and houses"],
                ["04", "Vedic rule engine", "Vargas, dashas, yogas and doshas"],
                ["05", "Gemini analysis", "Schema-validated interpretation"],
              ].map(([step, title, text]) => (
                <div
                  key={step}
                  className="relative rounded-[12px] border border-line bg-background p-5"
                >
                  <span className="font-mono text-xs font-bold text-gold">
                    {step}
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[.15em] text-primary uppercase">
              A complete analysis workspace
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">
              From birth details to an interactive, inspectable report
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
              >
                <span className="grid size-11 place-items-center rounded-[10px] bg-primary-soft text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {feature.text}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8 sm:pb-28">
          <Card className="overflow-hidden border-primary/15 bg-primary-soft/60">
            <div className="grid lg:grid-cols-[.9fr_1.1fr]">
              <div className="p-7 sm:p-10 lg:p-12">
                <Fingerprint className="size-9 text-primary" />
                <h2 className="font-display mt-6 text-4xl font-semibold">
                  Four labels. No blurred claims.
                </h2>
                <p className="mt-4 leading-7 text-muted">
                  Every report keeps observation, interpretation, tradition and
                  uncertainty visibly separate.
                </p>
              </div>
              <div className="grid gap-px bg-line sm:grid-cols-2">
                {[
                  ["Calculated data", "Ephemeris values and deterministic rules", "positive"],
                  ["AI interpretation", "Gemini explanation of supplied JSON", "primary"],
                  ["Traditional belief", "Lineage-dependent Jyotish meanings", "gold"],
                  ["Uncertain prediction", "Probabilistic timing with evidence", "attention"],
                ].map(([title, text, tone]) => (
                  <div key={title} className="bg-surface p-6 sm:p-7">
                    <Badge
                      tone={
                        tone as
                          | "positive"
                          | "primary"
                          | "gold"
                          | "attention"
                      }
                    >
                      {title}
                    </Badge>
                    <p className="mt-4 text-sm leading-6 text-muted">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section id="safety" className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <ShieldCheck className="size-10 text-positive" />
              <h2 className="font-display mt-5 text-4xl font-semibold">
                Careful by default
              </h2>
            </div>
            <div>
              <p className="text-lg leading-8 text-muted">
                No death predictions, disease diagnosis, guaranteed wealth,
                marriage, employment, pregnancy or fear-based dosha claims.
                Sensitive topics use calm, probabilistic language and direct
                users to qualified professionals when appropriate.
              </p>
              <div className="mt-6 rounded-[10px] border border-attention/20 bg-attention-soft p-4 text-sm leading-6 text-attention">
                This product is for educational and entertainment purposes.
                Astrology is not scientifically established as a predictive
                method and is not medical, financial, legal or other expert
                advice.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[900px] px-5 py-24 text-center sm:px-8 sm:py-32">
          <h2 className="font-display text-balance text-4xl font-semibold sm:text-6xl">
            Your chart, calculated carefully and explained clearly.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Start with exact birth details, or import an existing Kundli and
            confirm every extracted value before analysis.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/new-kundli"
              className={buttonStyles({ size: "lg" })}
            >
              Create Your Kundli
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/reports/demo"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              Explore sample report
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Brand />
          <p>© 2026 Jyotira. Traditional interpretations, transparently labeled.</p>
        </div>
      </footer>
    </div>
  );
}