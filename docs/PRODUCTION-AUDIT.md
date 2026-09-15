# Production audit

This document records the implementation review performed before the first hosted release.

## Verified architecture

- Astronomical positions are calculated on the server with Swiss Ephemeris; Gemini receives structured calculated chart data and is not used as an ephemeris.
- Gemini output is constrained by JSON Schema and validated again with Zod before rendering.
- The Gemini key is referenced only from server-only modules.
- Uploads are checked by detected file type, size and checksum before extraction.
- Authenticated report queries are scoped to the current user; sharing is opt-in and token based.
- All calculation, PDF and AI routes use the Node.js runtime.
- The UI distinguishes calculated data, AI interpretation, traditional belief and uncertain prediction.

## Research decisions

1. `@swisseph/node` was retained because it provides native Swiss Ephemeris bindings and bundled ephemeris files. It is AGPL-3.0 unless a professional Swiss Ephemeris license is obtained.
2. Google GenAI structured output is used with `application/json` plus a JSON Schema, followed by local Zod parsing. The model remains configurable with `GEMINI_MODEL`.
3. Whole-sign houses and Lahiri/Chitrapaksha ayanamsa are explicit methodology choices. They must remain visible in reports and exports.
4. Higher Vargas remain gated when birth time is not marked exact. D60 and other sensitive charts must not be presented as reliable with approximate or unknown times.

## Release blockers

Before public production traffic:

- Resolve Swiss Ephemeris licensing for the intended commercial model.
- Compare a fixture set covering multiple dates, locations and DST boundaries with trusted desktop astrology software using the same ayanamsa, node and house settings.
- Run `npm run quality` and `npm run build` on the exact Linux/Node runtime used by Vercel.
- Create and commit a reviewed Prisma migration before using `prisma migrate deploy` on an empty production database.
- Configure a durable job runner for sustained traffic; `after()` is appropriate only for the initial low-volume deployment.
- Perform a privacy review for birth data, uploaded documents, log retention, deletion and account export.

## Vercel gate

Use Node.js, not Edge, for any route that imports Swiss Ephemeris or the PDF renderer. Confirm the native package is included in the function bundle and run a post-deploy calculation smoke test. Protect preview deployments because reports contain sensitive personal data.

## Safety gate

Astrology is not scientifically established as a predictive method. Do not ship features that provide death predictions, medical diagnosis, guaranteed financial returns, guaranteed marriage/pregnancy/employment outcomes, or fear-based Dosha claims. Predictions must remain probabilistic and evidence-labelled.
