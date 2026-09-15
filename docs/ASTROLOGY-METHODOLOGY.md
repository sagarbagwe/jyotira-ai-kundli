# Astrology calculation methodology

Jyotira separates deterministic calculation from interpretation.

## Astronomical layer

- **Engine:** Swiss Ephemeris through `@swisseph/node`
- **Coordinates:** geocentric ecliptic longitudes in Universal Time
- **Ephemeris:** bundled Swiss Ephemeris files
- **Zodiac:** sidereal
- **Ayanamsa:** Lahiri / Chitrapaksha
- **Houses:** whole sign, beginning with the sidereal Ascendant sign
- **Nodes:** true node by default; Ketu is exactly opposite Rahu
- **Timezone:** IANA timezone resolved before converting the local birth time to UTC

Swiss Ephemeris is dual-licensed under AGPL-3.0 or a Professional License. The
developer must make that licensing choice before operating a public service:
<https://www.astro.com/swisseph/>.

## Derived data

The application derives these values from calculated sidereal longitude:

- Rashi and degree within sign
- 27-nakshatra index and four padas
- Whole-sign house placement
- Parashari graha drishti (universal 7th; special Mars, Jupiter and Saturn aspects)
- D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D30 and D60
- Vimshottari Mahadasha, Antardasha and Pratyantardasha
- Sign-ingress transits refined by bisection

Each higher Varga uses an explicit mapping in `src/lib/astrology/vargas.ts`.
The implementation hides D7 and higher when birth-time accuracy is not marked
exact. D30 is an unequal division and is labeled tradition-dependent. D60 is
especially birth-time-sensitive.

## Strength labels

Planet and house strength values in this release are transparent screening
heuristics. They combine disclosed factors such as dignity, kendra/trikona
placement, combustion, house lord condition, occupants and graha drishti.

They are **not Shadbala, Bhava Bala, empirical measurements or scientific
scores**. The UI and PDF label that limitation.

## Yoga and Dosha rules

Yoga and Dosha status is decided only by deterministic code in
`src/lib/astrology/rules.ts`. Gemini cannot create or override a finding.
Every result stores:

- rule identifier
- present/not-detected/tradition-dependent status
- exact calculation basis
- implemented rule
- caveat

The rule set is intentionally conservative. “Not detected” means only that the
implemented condition was not met; it is not a universal claim across all
Jyotish schools.

## Vimshottari dates

The starting lord comes from the Moon's calculated nakshatra. Balance at birth
is proportional to the remaining arc in that nakshatra. Period lengths use
`DASHA_YEAR_DAYS` (default `365.2425`) and are nested in the standard 120-year
order. Other schools use 360-day or different traditional year conventions,
which can shift dates.

## Interpretation boundary

Gemini receives structured calculated JSON. Its prompt prohibits it from
inventing or repairing positions, houses, dashas, transits, yogas or doshas.
Outputs must pass Zod schemas before rendering.

Astrology is not scientifically established as a predictive method. All
interpretations are educational/entertainment content and never substitute for
medical, financial, legal or other professional advice.