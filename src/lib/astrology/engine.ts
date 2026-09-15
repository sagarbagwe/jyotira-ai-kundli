import {
  CalculationFlag,
  HouseSystem,
  LunarPoint,
  Planet,
  SiderealMode,
  calculateHouses,
  calculatePosition,
  dateToJulianDay,
  getAyanamsaExUt,
  setSiderealMode,
} from "@swisseph/node";
import { DateTime } from "luxon";
import { env } from "@/lib/env";
import { normalizeDegrees } from "@/lib/utils";
import {
  birthInputToUtc,
  buildAspects,
  buildHouses,
  degreeInSign,
  getDignity,
  getLordships,
  getNakshatra,
  isCombust,
  scorePlanetStrength,
  signFromLongitude,
  signIndexFromLongitude,
  wholeSignHouse,
} from "./core";
import { PLANET_GLYPHS, SIGNS } from "./constants";
import { calculateVimshottariDasha } from "./dasha";
import { detectDoshas, detectYogas } from "./rules";
import type {
  BirthInput,
  CalculatedChart,
  PlanetName,
  PlanetPosition,
  TransitIngress,
  TransitPosition,
  TransitSnapshot,
} from "./types";
import { PLANET_NAMES } from "./types";
import { calculateDivisionalCharts } from "./vargas";

const FLAGS = CalculationFlag.SwissEphemeris | CalculationFlag.Speed;

const BODY_MAP: Record<
  Exclude<PlanetName, "ketu">,
  Planet | LunarPoint
> = {
  sun: Planet.Sun,
  moon: Planet.Moon,
  mars: Planet.Mars,
  mercury: Planet.Mercury,
  jupiter: Planet.Jupiter,
  venus: Planet.Venus,
  saturn: Planet.Saturn,
  rahu: env.NODE_TYPE === "true" ? LunarPoint.TrueNode : LunarPoint.MeanNode,
};

export interface AstrologyEngine {
  calculateNatal(input: BirthInput): Promise<CalculatedChart>;
  calculateTransits(
    chart: CalculatedChart,
    startDate: string,
    endDate: string,
  ): Promise<{ snapshots: TransitSnapshot[]; ingresses: TransitIngress[] }>;
}

function validateBirthInput(input: BirthInput) {
  if (!input.name.trim()) throw new Error("Full name is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) {
    throw new Error("Date of birth must use YYYY-MM-DD.");
  }
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(input.timeOfBirth)) {
    throw new Error("Time of birth must use HH:MM or HH:MM:SS.");
  }
  if (!input.place.trim()) throw new Error("Birth place is required.");
  if (
    !Number.isFinite(input.latitude) ||
    input.latitude < -90 ||
    input.latitude > 90
  ) {
    throw new Error("Latitude must be between -90 and 90.");
  }
  if (
    !Number.isFinite(input.longitude) ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    throw new Error("Longitude must be between -180 and 180.");
  }
  if (!DateTime.local().setZone(input.timezone).isValid) {
    throw new Error("Timezone must be a valid IANA timezone.");
  }
}

function rawPlanetAt(
  name: PlanetName,
  julianDay: number,
  ayanamsa: number,
) {
  if (name === "ketu") {
    const rahu = calculatePosition(julianDay, BODY_MAP.rahu, FLAGS);
    return {
      tropicalLongitude: normalizeDegrees(rahu.longitude + 180),
      siderealLongitude: normalizeDegrees(rahu.longitude - ayanamsa + 180),
      latitude: -rahu.latitude,
      speed: rahu.longitudeSpeed,
    };
  }
  const raw = calculatePosition(julianDay, BODY_MAP[name], FLAGS);
  return {
    tropicalLongitude: normalizeDegrees(raw.longitude),
    siderealLongitude: normalizeDegrees(raw.longitude - ayanamsa),
    latitude: raw.latitude,
    speed: raw.longitudeSpeed,
  };
}

function asUtcNoon(isoDate: string) {
  const date = DateTime.fromISO(isoDate, { zone: "utc" }).startOf("day").set({
    hour: 12,
  });
  if (!date.isValid) throw new Error(`Invalid date: ${isoDate}`);
  return date;
}

export class SwissVedicEngine implements AstrologyEngine {
  constructor() {
    setSiderealMode(SiderealMode.Lahiri);
  }

  async calculateNatal(input: BirthInput): Promise<CalculatedChart> {
    validateBirthInput(input);

    const birthUtc = birthInputToUtc(input);
    const julianDayUt = dateToJulianDay(birthUtc);
    const ayanamsa = getAyanamsaExUt(
      julianDayUt,
      CalculationFlag.SwissEphemeris,
    );
    const tropicalHouses = calculateHouses(
      julianDayUt,
      input.latitude,
      input.longitude,
      HouseSystem.WholeSign,
    );
    const ascendantLongitude = normalizeDegrees(
      tropicalHouses.ascendant - ayanamsa,
    );
    const ascendantSignIndex = signIndexFromLongitude(ascendantLongitude);

    const raw = Object.fromEntries(
      PLANET_NAMES.map((name) => [
        name,
        rawPlanetAt(name, julianDayUt, ayanamsa),
      ]),
    ) as Record<PlanetName, ReturnType<typeof rawPlanetAt>>;

    const sunLongitude = raw.sun.siderealLongitude;
    let planets: PlanetPosition[] = PLANET_NAMES.map((name) => {
      const position = raw[name];
      const signIndex = signIndexFromLongitude(position.siderealLongitude);
      const sign = signFromLongitude(position.siderealLongitude);
      const combustion = isCombust(
        name,
        position.siderealLongitude,
        sunLongitude,
      );
      const base = {
        name,
        glyph: PLANET_GLYPHS[name],
        tropicalLongitude: position.tropicalLongitude,
        siderealLongitude: position.siderealLongitude,
        latitude: position.latitude,
        speed: position.speed,
        sign,
        signIndex,
        degreeInSign: degreeInSign(position.siderealLongitude),
        house: wholeSignHouse(signIndex, ascendantSignIndex),
        nakshatra: getNakshatra(position.siderealLongitude),
        retrograde:
          name === "rahu" || name === "ketu" || position.speed < 0,
        combust: combustion.combust,
        combustionOrb: combustion.orb,
        dignity: getDignity(name, sign),
        lordships: getLordships(name, ascendantSignIndex),
        aspects: [],
      } satisfies Omit<PlanetPosition, "strength">;

      return {
        ...base,
        strength: scorePlanetStrength(base),
      };
    });

    planets = planets.map((planet) => ({
      ...planet,
      aspects: buildAspects(planet, planets),
    }));

    const houses = buildHouses(ascendantSignIndex, planets);
    const moon = planets.find((planet) => planet.name === "moon")!;
    const sun = planets.find((planet) => planet.name === "sun")!;
    const warnings: string[] = [];
    if (input.timeAccuracy !== "exact") {
      warnings.push(
        "Birth time is not marked exact. Ascendant, houses and higher divisional charts may change with small time corrections.",
      );
    }
    if (input.timeAccuracy === "unknown") {
      warnings.push(
        "Time-dependent findings should be treated as provisional until the birth time is rectified or confirmed.",
      );
    }

    const chart: CalculatedChart = {
      version: "1.0",
      input,
      birthUtc: birthUtc.toISOString(),
      julianDayUt,
      ayanamsa,
      methodology: {
        engine: "Swiss Ephemeris",
        engineVersion: "@swisseph/node 1.3.x",
        ephemeris: "Swiss Ephemeris files",
        zodiac: "sidereal",
        ayanamsa: "Lahiri / Chitrapaksha",
        houseSystem: "Whole sign",
        nodeType: env.NODE_TYPE,
        dashaYearDays: env.DASHA_YEAR_DAYS,
        calculatedAt: new Date().toISOString(),
        warnings,
      },
      ascendant: {
        siderealLongitude: ascendantLongitude,
        sign: signFromLongitude(ascendantLongitude),
        degreeInSign: degreeInSign(ascendantLongitude),
        nakshatra: getNakshatra(ascendantLongitude),
        lord: SIGNS[ascendantSignIndex].lord,
      },
      rashi: {
        moonSign: moon.sign,
        lord: SIGNS[moon.signIndex].lord,
        nakshatra: moon.nakshatra,
      },
      suryaRashi: sun.sign,
      planets,
      houses,
      divisionalCharts: calculateDivisionalCharts(
        planets,
        ascendantLongitude,
        input.timeAccuracy,
      ),
      dashas: calculateVimshottariDasha(
        moon.nakshatra,
        birthUtc,
        env.DASHA_YEAR_DAYS,
      ),
      yogas: [],
      doshas: [],
      dataLabels: {
        calculations:
          "Calculated data — deterministic output from Swiss Ephemeris and disclosed rules.",
        interpretation:
          "AI interpretation — Gemini explains the supplied calculated JSON; it does not calculate positions.",
        belief:
          "Traditional belief — interpretive statements reflect selected Vedic astrology traditions, not established science.",
        uncertainty:
          "Uncertain prediction — timing statements are probabilistic and include basis and confidence.",
      },
    };

    chart.yogas = detectYogas(planets, houses);
    chart.doshas = detectDoshas(planets);
    return chart;
  }

  private transitPositionAt(
    planet: PlanetName,
    date: Date,
    natalAscendantSignIndex: number,
  ): TransitPosition {
    const jd = dateToJulianDay(date);
    const ayanamsa = getAyanamsaExUt(jd, CalculationFlag.SwissEphemeris);
    const position = rawPlanetAt(planet, jd, ayanamsa);
    const signIndex = signIndexFromLongitude(position.siderealLongitude);
    return {
      planet,
      siderealLongitude: position.siderealLongitude,
      sign: SIGNS[signIndex].key,
      degreeInSign: degreeInSign(position.siderealLongitude),
      retrograde:
        planet === "rahu" || planet === "ketu" || position.speed < 0,
      natalHouse: wholeSignHouse(signIndex, natalAscendantSignIndex),
    };
  }

  private refineIngress(
    planet: PlanetName,
    lowDate: Date,
    highDate: Date,
    fromSign: string,
    ascendantSignIndex: number,
  ) {
    let low = lowDate.getTime();
    let high = highDate.getTime();
    for (let iteration = 0; iteration < 22; iteration += 1) {
      const middle = Math.floor((low + high) / 2);
      const position = this.transitPositionAt(
        planet,
        new Date(middle),
        ascendantSignIndex,
      );
      if (position.sign === fromSign) low = middle;
      else high = middle;
    }
    return new Date(high);
  }

  async calculateTransits(
    chart: CalculatedChart,
    startDate: string,
    endDate: string,
  ) {
    const start = asUtcNoon(startDate);
    const end = asUtcNoon(endDate);
    if (end <= start) throw new Error("Transit end date must be after start date.");
    if (end.diff(start, "days").days > 730) {
      throw new Error("Transit ranges are limited to 730 days per request.");
    }

    const ascendantSignIndex = signIndexFromLongitude(
      chart.ascendant.siderealLongitude,
    );
    const snapshots: TransitSnapshot[] = [];
    let monthCursor = start;
    while (monthCursor <= end) {
      const date = monthCursor.toJSDate();
      snapshots.push({
        date: date.toISOString(),
        positions: PLANET_NAMES.map((planet) =>
          this.transitPositionAt(planet, date, ascendantSignIndex),
        ),
      });
      monthCursor = monthCursor.plus({ months: 1 });
    }

    const ingresses: TransitIngress[] = [];
    const previous = new Map<
      PlanetName,
      { position: TransitPosition; date: Date }
    >();
    let dayCursor = start;
    while (dayCursor <= end) {
      const date = dayCursor.toJSDate();
      for (const planet of PLANET_NAMES) {
        const position = this.transitPositionAt(
          planet,
          date,
          ascendantSignIndex,
        );
        const prior = previous.get(planet);
        if (prior && prior.position.sign !== position.sign) {
          const ingressDate = this.refineIngress(
            planet,
            prior.date,
            date,
            prior.position.sign,
            ascendantSignIndex,
          );
          const exact = this.transitPositionAt(
            planet,
            ingressDate,
            ascendantSignIndex,
          );
          ingresses.push({
            planet,
            fromSign: prior.position.sign,
            toSign: exact.sign,
            at: ingressDate.toISOString(),
            retrograde: exact.retrograde,
          });
        }
        previous.set(planet, { position, date });
      }
      dayCursor = dayCursor.plus({ days: 1 });
    }

    return {
      snapshots,
      ingresses: ingresses.sort(
        (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
      ),
    };
  }
}

let engine: AstrologyEngine | undefined;

export function getAstrologyEngine() {
  engine ??= new SwissVedicEngine();
  return engine;
}