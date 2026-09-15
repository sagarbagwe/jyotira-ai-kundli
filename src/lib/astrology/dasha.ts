import { DASHA_ORDER, DASHA_YEARS } from "./constants";
import { NAKSHATRA_SPAN } from "./core";
import type {
  DashaPeriod,
  NakshatraPosition,
  PlanetName,
  VimshottariDasha,
} from "./types";

const DAY_MS = 86_400_000;

function sequenceFrom(lord: PlanetName) {
  const start = DASHA_ORDER.indexOf(lord);
  return Array.from(
    { length: DASHA_ORDER.length },
    (_, index) => DASHA_ORDER[(start + index) % DASHA_ORDER.length],
  );
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function buildPratyantardashas(
  startDate: Date,
  antardashaLord: PlanetName,
  antardashaDurationDays: number,
  mahadashaLord: PlanetName,
): DashaPeriod[] {
  let cursor = startDate;
  return sequenceFrom(antardashaLord).map((lord) => {
    const durationDays =
      antardashaDurationDays * (DASHA_YEARS[lord] / 120);
    const end = addDays(cursor, durationDays);
    const period: DashaPeriod = {
      level: "pratyantardasha",
      lord,
      parentLord: mahadashaLord,
      start: cursor.toISOString(),
      end: end.toISOString(),
      durationDays,
    };
    cursor = end;
    return period;
  });
}

function buildAntardashas(
  startDate: Date,
  mahadashaLord: PlanetName,
  mahadashaYears: number,
  yearLengthDays: number,
): DashaPeriod[] {
  let cursor = startDate;
  return sequenceFrom(mahadashaLord).map((lord) => {
    const durationDays =
      mahadashaYears * (DASHA_YEARS[lord] / 120) * yearLengthDays;
    const end = addDays(cursor, durationDays);
    const period: DashaPeriod = {
      level: "antardasha",
      lord,
      parentLord: mahadashaLord,
      start: cursor.toISOString(),
      end: end.toISOString(),
      durationDays,
      subPeriods: buildPratyantardashas(
        cursor,
        lord,
        durationDays,
        mahadashaLord,
      ),
    };
    cursor = end;
    return period;
  });
}

function periodAt(
  periods: DashaPeriod[],
  instant: Date,
): DashaPeriod | null {
  const value = instant.getTime();
  return (
    periods.find(
      (period) =>
        new Date(period.start).getTime() <= value &&
        value < new Date(period.end).getTime(),
    ) ?? null
  );
}

export function calculateVimshottariDasha(
  moonNakshatra: NakshatraPosition,
  birthDateUtc: Date,
  yearLengthDays: number,
  referenceDate = new Date(),
): VimshottariDasha {
  const startingLord = moonNakshatra.lord;
  const elapsedFraction =
    moonNakshatra.longitudeWithinNakshatra / NAKSHATRA_SPAN;
  const balanceAtBirth = 1 - elapsedFraction;
  const startingYears = DASHA_YEARS[startingLord];
  const elapsedDays = startingYears * elapsedFraction * yearLengthDays;
  let cursor = addDays(birthDateUtc, -elapsedDays);

  const periods = sequenceFrom(startingLord).map((lord) => {
    const durationDays = DASHA_YEARS[lord] * yearLengthDays;
    const end = addDays(cursor, durationDays);
    const period: DashaPeriod = {
      level: "mahadasha",
      lord,
      start: cursor.toISOString(),
      end: end.toISOString(),
      durationDays,
      subPeriods: buildAntardashas(
        cursor,
        lord,
        DASHA_YEARS[lord],
        yearLengthDays,
      ),
    };
    cursor = end;
    return period;
  });

  const mahadasha = periodAt(periods, referenceDate);
  const antardasha = mahadasha?.subPeriods
    ? periodAt(mahadasha.subPeriods, referenceDate)
    : null;

  return {
    system: "Vimshottari",
    yearLengthDays,
    birthNakshatra: moonNakshatra.name,
    startingLord,
    balanceAtBirth,
    periods,
    current: { mahadasha, antardasha },
    caveat:
      "Vimshottari dates use the disclosed year length and Moon's sidereal nakshatra. Schools may use 360-day, savana, or civil-year conventions, producing small date differences.",
  };
}

export function getDashaAt(
  dasha: VimshottariDasha,
  date: Date,
) {
  const mahadasha = periodAt(dasha.periods, date);
  const antardasha = mahadasha?.subPeriods
    ? periodAt(mahadasha.subPeriods, date)
    : null;
  const pratyantardasha = antardasha?.subPeriods
    ? periodAt(antardasha.subPeriods, date)
    : null;
  return { mahadasha, antardasha, pratyantardasha };
}