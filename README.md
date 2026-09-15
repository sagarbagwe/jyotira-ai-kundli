# Jyotira — AI Kundli & Vedic Astrology SaaS

Jyotira is a production-oriented Next.js application that calculates a
sidereal Vedic birth chart with Swiss Ephemeris, applies deterministic
Jyotish rules, and sends only structured calculated data to Google Gemini for
schema-validated interpretation.

> **Core integrity rule:** Gemini explains calculations. It never invents
> planetary positions, ascendants, houses, dashas, transits, yogas or doshas.

## What is implemented

- Premium responsive landing page and authenticated dashboard shell
- Manual birth details with city search, coordinates and IANA timezone
- PDF/PNG/JPEG Kundli upload with content-based file validation
- Gemini multimodal extraction with field-level confidence and source excerpts
- Explicit mismatch review before uploaded data can be used
- Swiss Ephemeris planetary longitude, speed, true/mean node and Ascendant
- Lahiri sidereal conversion and whole-sign houses
- Rashi, Surya Rashi, Nakshatra and Pada
- Planet condition, combustion, retrograde, lordship and transparent strength screen
- Twelve-house data, occupants, lords and Parashari graha drishti
- D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D30 and D60
- Higher-Varga birth-time accuracy gating
- Complete Vimshottari Maha/Antar/Pratyantar timeline
- Actual transit snapshots and sign-ingress search with bisection refinement
- Deterministic Yoga and Dosha rule engine with calculation basis and caveats
- Grounded Gemini report and Kundli chat with Zod validation
- English/Hindi/Marathi report-language architecture
- Interactive North, South and East Indian chart presentations
- Interactive report tabs, planet/house details, Dasha and transit timelines
- Server-rendered downloadable PDF report
- Auth.js with Google/GitHub OAuth and PostgreSQL sessions
- PostgreSQL/Prisma schema for every requested domain model
- Private S3/R2-compatible object storage abstraction and signed downloads
- Async `GenerationJob` state machine and progress polling
- Rate limiting with Upstash Redis and local development fallback
- Report history, opt-in share links, settings, compatibility comparison and admin metrics
- Error boundaries, calculation errors, Gemini retries and safe fallback behavior
- Unit/integration tests, ESLint, TypeScript and GitHub Actions

## Technology

| Layer | Choice |
| --- | --- |
| Web | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, responsive accessible components |
| Database | PostgreSQL + Prisma |
| Authentication | Auth.js |
| AI | Google GenAI SDK / Gemini, server only |
| Astronomy | Swiss Ephemeris via `@swisseph/node` |
| Location | Open-Meteo geocoding provider abstraction |
| Storage | AWS S3 / Cloudflare R2 / MinIO abstraction |
| Rate limits | Upstash Redis |
| PDF | `@react-pdf/renderer` |
| Validation | Zod |

## Run locally

The visual product and complete calculation engine run in local demo mode
without accounts, PostgreSQL, Gemini or S3.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Use **Load sample data** on the New Kundli page.
When `GEMINI_API_KEY` is absent, report text uses a clearly marked local stub;
all chart calculations still use Swiss Ephemeris.

### Full local stack

```bash
cp .env.example .env.local
docker compose up -d
npm run db:generate
npm run db:push
npm run dev
```

Add a Gemini API key and set:

```dotenv
AI_MODE=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

The key is imported only by modules marked `server-only` and is never exposed
to client components.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run quality
```

## Environment variables

See [`.env.example`](./.env.example). Production needs:

- PostgreSQL `DATABASE_URL` and `DIRECT_URL`
- `AUTH_SECRET` and at least one OAuth provider
- restricted `GEMINI_API_KEY`
- S3/R2 bucket credentials
- Upstash Redis credentials
- public application URL

`GEMINI_MODEL` changes the model without source changes. `AIProvider` has
`GeminiProvider` and a local-only deterministic stub, so future providers can
implement the same interface.

## Architecture

```text
Birth information / uploaded Kundli
                │
                ▼
Location provider ──► latitude, longitude, IANA timezone
                │
                ▼
Swiss Ephemeris ──► tropical astronomical data
                │
                ▼
Lahiri sidereal + whole-sign chart
                │
                ├──► Vargas / aspects / strengths
                ├──► Vimshottari Dasha
                ├──► Yoga & Dosha deterministic rules
                └──► actual transit engine
                         │
                         ▼
               versioned CalculatedChart JSON
                         │
                         ▼
        Gemini structured output + Zod validation
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
      Interactive report        PDF report
```

Important source locations:

```text
src/lib/astrology/engine.ts    Swiss Ephemeris integration
src/lib/astrology/vargas.ts    Divisional-chart mappings
src/lib/astrology/dasha.ts     Vimshottari periods
src/lib/astrology/rules.ts     Yoga and Dosha checks
src/lib/ai/provider.ts         AIProvider / GeminiProvider
src/lib/ai/prompts.ts          Grounding and safety prompt
src/lib/ai/schemas.ts          Required structured outputs
src/lib/jobs/processor.ts      Async generation state machine
prisma/schema.prisma           Production data model
```

## Database models

The Prisma schema includes:

`users`, `birth_profiles`, `kundli_charts`, `planetary_positions`, `houses`,
`divisional_charts`, `dashas`, `transits`, `yogas`, `doshas`, `reports`,
`report_sections`, `ai_questions`, `uploaded_files`, `generation_jobs`,
`usage_events` and `system_errors`, plus Auth.js tables.

## Calculation and interpretation labels

The UI and PDF keep four categories separate:

1. **Calculated data** — Swiss Ephemeris or deterministic rules
2. **AI interpretation** — schema-validated Gemini explanation
3. **Traditional belief** — lineage-dependent Jyotish meaning
4. **Uncertain prediction** — probabilistic timing with evidence and confidence

Strength scores are transparent screening heuristics, **not** Shadbala, Bhava
Bala or scientific measurements. See
[`docs/ASTROLOGY-METHODOLOGY.md`](./docs/ASTROLOGY-METHODOLOGY.md).

## Safety

The system prompt and schemas prohibit:

- guaranteed wealth, marriage, employment, pregnancy or health outcomes
- death predictions
- disease diagnosis
- fear-based Dosha language
- invented chart facts
- professional medical, financial or legal advice

Health text remains general. Predictions must include confidence, basis and
reasoning. Missing data is reported as unavailable instead of guessed.

## Security

- Gemini credentials stay server-side
- Production routes enforce authenticated ownership
- Reports are private until sharing is explicitly enabled
- Uploads are limited by size and validated by magic bytes
- Object names are randomized; downloads use expiring URLs
- AI/report/upload/geocode routes are rate-limited
- Logs redact birth data, coordinates, emails and secrets
- Gemini document extraction treats document text as untrusted input

Run GitHub secret scanning before release and keep Vercel preview deployments
protected.

## Production queue

The included adapter uses Next.js `after()` and persists progress in
`GenerationJob`:

```text
QUEUED → CALCULATING → ANALYZING → GENERATING_REPORT → COMPLETED
                                                        ↘ FAILED
```

For sustained traffic, move `runGenerationJob` behind a durable queue such as
QStash, Inngest, Trigger.dev or a dedicated worker. The data model and UI do
not need to change.

## Vercel deployment

Follow [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md). The short version:

1. Import this repository into Vercel.
2. Add PostgreSQL, S3/R2, OAuth, Gemini and Upstash variables.
3. Set `DEMO_MODE=false`, `AI_MODE=gemini`, `STORAGE_DRIVER=s3`.
4. Run `npx prisma migrate deploy`.
5. Deploy on the **Node.js** runtime. Do not move Swiss Ephemeris routes to Edge.

## Swiss Ephemeris licensing — read before deployment

Swiss Ephemeris uses dual licensing. This repository includes its AGPL package
and is therefore AGPL-3.0 by default. Before operating a public network
service, choose one:

1. comply with AGPL-3.0 and make corresponding source available; or
2. obtain a Swiss Ephemeris Professional License for a proprietary/commercial
   deployment.

Review <https://www.astro.com/swisseph/> and obtain qualified legal advice.
Do not make a closed-source commercial deployment without resolving this.

## Disclaimer

This application and its generated reports are provided for educational and
entertainment purposes and reflect traditional astrological interpretations.
Astrology is not scientifically established as a predictive method.
Predictions must not be treated as certainty or as professional medical,
financial, legal or other expert advice.

## License

AGPL-3.0. See [`LICENSE`](./LICENSE) and the Swiss Ephemeris licensing note
above.