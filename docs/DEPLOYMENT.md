# Deployment

## Vercel + PostgreSQL + S3/R2

1. Create a PostgreSQL database (Neon, Supabase, Railway, Prisma Postgres, etc.).
2. Create a private S3-compatible bucket. Cloudflare R2 works with
   `S3_REGION=auto` and its account endpoint.
3. Configure Google/GitHub OAuth callbacks for:
   - `https://YOUR_DOMAIN/api/auth/callback/google`
   - `https://YOUR_DOMAIN/api/auth/callback/github`
4. Create a restricted Gemini API key and restrict it to the Gemini API.
5. Import the GitHub repository into Vercel.
6. Add all required variables from `.env.example`.
7. Set `DEMO_MODE=false`, `AI_MODE=gemini`, and `STORAGE_DRIVER=s3`.
8. Run `npx prisma migrate deploy` against production before first traffic.
9. Deploy using the Node.js runtime, not Edge, because Swiss Ephemeris uses a
   native Node add-on.

## Required production variables

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- at least one OAuth provider pair
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- all S3/R2 variables
- Upstash Redis variables for durable rate limits

## Swiss Ephemeris licensing

This repository uses the AGPL package by default. Before activating a public
network service, either:

- keep the complete service AGPL-compatible and provide corresponding source, or
- obtain a Swiss Ephemeris Professional License and adjust distribution terms.

Do not deploy a closed-source commercial SaaS with the AGPL dependency without
qualified legal review and the required license.

## Serverless limits

Calculation, PDF, job and AI routes explicitly use the Node.js runtime. Report
generation runs after the initial response using Next.js `after()`. For higher
volume, replace this adapter with a durable queue (QStash, Inngest, Trigger.dev
or a dedicated worker) while keeping the `GenerationJob` state machine.

## Post-deployment checklist

- Disable `DEMO_MODE`
- Verify authenticated redirects
- Verify private report ownership checks
- Upload PDF, PNG and JPEG fixtures; reject spoofed MIME types
- Generate a known chart and compare positions with trusted reference software
- Generate PDF and inspect every page
- Confirm share links are opt-in and can be disabled
- Test Gemini retry, invalid JSON and quota errors
- Confirm logs redact birth details and secrets
- Review Swiss Ephemeris and third-party API licenses