# Stateless Gemini-only Vercel deployment

This is the recommended deployment for Jyotira when you do not want a database, authentication, object storage, Redis, or permanent user accounts.

## What this mode does

- Swiss Ephemeris calculates the natal chart, divisional charts, Vimshottari dashas, yogas, doshas, and transits.
- Gemini receives calculated chart data and produces the interpretation.
- Gemini API calls run only on the server. The API key is never sent to the browser.
- The completed report is returned directly to the browser and kept in `sessionStorage` for the current tab.
- Uploaded PDF and image bytes are validated, sent to Gemini for extraction, and discarded without storage.
- Kundli chat sends the calculated chart with each question and does not save the conversation.

## What this mode intentionally does not provide

- account login or authentication
- PostgreSQL or another database
- Redis or durable rate limiting
- S3, R2, or permanent file storage
- permanent report history
- public sharing links
- persistent admin analytics

A report disappears when the browser tab or session is closed. The interface tells users to use **Save PDF** or **Print** first.

## 1. Import the repository into Vercel

1. Open Vercel and choose **Add New → Project**.
2. Import `sagarbagwe/jyotira-ai-kundli` from GitHub.
3. Keep the detected framework as **Next.js**.
4. Do not add a database or storage integration.

## 2. Add environment variables

In **Project Settings → Environment Variables**, add these values for Production, Preview, and Development:

```dotenv
GEMINI_API_KEY=your-real-secret-key
AI_MODE=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_RETRIES=3
DEMO_MODE=true
```

`GEMINI_API_KEY` is the only secret. Do not use `NEXT_PUBLIC_GEMINI_API_KEY`; any variable with `NEXT_PUBLIC_` can be bundled into browser code.

You do not need `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, OAuth credentials, S3/R2 credentials, or Upstash variables in this mode.

## 3. Deploy

Select **Deploy**. `vercel.json` configures the longer function duration needed for report generation. The package build command runs Prisma code generation for compilation, but stateless mode does not connect to or migrate a database.

After the first deployment, test:

1. `/api/health` reports the AI and astrology engine as available.
2. `/new-kundli` resolves a place and generates a report.
3. Refreshing `/reports/local` in the same tab retains the report.
4. Closing the tab removes the report.
5. **Save PDF** opens the browser print dialog, where the report can be saved as a PDF.
6. A Kundli PDF or image can be extracted without leaving a retained upload.
7. **Ask Your Kundli AI** answers from the calculated chart.

## Operational limits

This design is deliberately stateless, but Gemini usage still has cost and quota implications. The built-in fallback limiter is process-local on serverless infrastructure and is not a durable abuse-prevention control. For a private or low-volume launch this is usually acceptable. A high-traffic public launch should add a durable rate limiter or another edge-level abuse control even if report storage remains stateless.

Swiss Ephemeris licensing and independent calculation-fixture validation remain release gates for commercial production use.
