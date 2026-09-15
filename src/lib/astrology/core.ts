import { DateTime } from "luxon";
import {
  BENEFICS,
  COMBUSTION_ORBS,
  DEBILITATION,
  EXALTATION,
  HOUSE_SIGNIFICATIONS,
  MALEFICS,
  MOOLATRIKONA,
  NAKSHATRAS,
  OWN_SIGNS,
  SIGNS,
} from "./constants";
import type {
  Aspect,
  BirthInput,
  Dignity,
  HousePosition,
  NakshatraPosition,
  PlanetName,
  PlanetPosition,
  StrengthEvidence,
  ZodiacSign,
} from "./types";
import { angularDistance, normalizeDegrees } from "@/lib/utils";

export const NAKSHATRA_SPAN = 360 / 27;
export const PADA_SPAN = NAKSHATRA_SPAN / 4;

export function birthInputToUtc(input: BirthInput) {
  const local = DateTime.fromISO(`${input.dateOfBirth}T${input.timeOfBirth}`, {
    zone: input.timezone,
    setZone: true,
  });

  if (!local.isValid) {
    throw new Error(`Invalid birth date, time, or timezone: ${local.invalidExplanation ?? "unknown error"}`);
  }

  return local.toUTC().toJSDate();
}

export function signIndexFromLongitude(longitude: number) {
  return Math.floor(normalizeDegrees(longitude) / 30) % 12;
}

export function signFromLongitude(longitude: number): ZodiacSign {
  return SIGNS[signIndexFromLongitude(longitude)].key;
}

export function degreeInSign(longitude: number) {
  return normalizeDegrees(longitude) % 30;
}

export function getNakshatra(longitude: number): NakshatraPosition {
  const normalized = normalizeDegrees(longitude);
  const index = Math.min(26, Math.floor(normalized / NAKSHATRA_SPAN));
  const within = normalized - index * NAKSHATRA_SPAN;
  const pada = (Math.floor(within / PADA_SPAN) + 1) as 1 | 2 | 3 | 4;
  const metadata = NAKSHATRAS[index];

  return {
    index,
    name: metadata.name,
    pada,
    lord: metadata.lord,
    deity: metadata.deity,
    symbol: metadata.symbol,
    longitudeWithinNakshatra: within,
  };
}

export function wholeSignHouse(planetSignIndex: number, ascendantSignIndex: number) {
  return ((planetSignIndex - ascendantSignIndex + 12) % 12) + 1;
}

export function getLordships(planet: PlanetName, ascendantSignIndex: number) {
  const houses: number[] = [];
  for (let house = 1; house <= 12; house += 1) {
    const signIndex = (ascendantSignIndex + house - 1) % 12;
    if (SIGNS[signIndex].lord === planet) houses.push(house);
  }
  return houses;
}

export function getDignity(planet: PlanetName, sign: ZodiacSign): Dignity {
  if (EXALTATION[planet] === sign) return "exalted";
  if (DEBILITATION[planet] === sign) return "debilitated";
  if (MOOLATRIKONA[planet] === sign) return "moolatrikona";
  if (OWN_SIGNS[planet]?.includes(sign)) return "own-sign";
  return "neutral";
}

export function isCombust(
  planet: PlanetName,
  longitude: number,
  sunLongitude: number,
) {
  const orb = COMBUSTION_ORBS[planet];
  if (!orb || planet === "rahu" || planet === "ketu") {
    return { combust: false, orb: null };
  }
  const separation = angularDistance(longitude, sunLongitude);
  return { combust: separation <= orb, orb };
}

export function aspectDistances(planet: PlanetName) {
  const distances = new Set<number>([7]);
  if (planet === "mars") {
    distances.add(4);
    distances.add(8);
  }
  if (planet === "jupiter") {
    distances.add(5);
    distances.add(9);
  }
  if (planet === "saturn") {
    distances.add(3);
    distances.add(10);
  }
  return [...distances].sort((a, b) => a - b);
}

export function buildAspects(
  planet: PlanetPosition,
  planets: PlanetPosition[],
): Aspect[] {
  return aspectDistances(planet.name).map((distance) => {
    const toHouse = ((planet.house + distance - 2) % 12) + 1;
    return {
      from: planet.name,
      toHouse,
      toPlanets: planets
        .filter((candidate) => candidate.house === toHouse)
        .map((candidate) => candidate.name),
      distance,
      tradition:
        "Parashari graha drishti; sign/house-based special aspects are used without degree-based orb.",
    };
  });
}

function labelStrength(score: number): StrengthEvidence["label"] {
  if (score >= 68) return "strong";
  if (score >= 42) return "moderate";
  return "low";
}

export function scorePlanetStrength(
  planet: Pick<
    PlanetPosition,
    "name" | "dignity" | "house" | "retrograde" | "combust"
  >,
): StrengthEvidence {
  const factors: StrengthEvidence["factors"] = [];
  let score = 50;

  const dignityPoints: Partial<Record<Dignity, number>> = {
    exalted: 24,
    moolatrikona: 20,
    "own-sign": 16,
    debilitated: -24,
    challenging: -10,
    friendly: 7,
  };
  const dignityDelta = dignityPoints[planet.dignity] ?? 0;
  factors.push({
    factor: "Sign dignity",
    points: dignityDelta,
    detail: `Classified as ${planet.dignity} under the configured dignity table.`,
  });
  score += dignityDelta;

  if ([1, 4, 7, 10].includes(planet.house)) {
    score += 10;
    factors.push({
      factor: "Kendra placement",
      points: 10,
      detail: `Placed in whole-sign house ${planet.house}.`,
    });
  } else if ([5, 9].includes(planet.house)) {
    score += 8;
    factors.push({
      factor: "Trikona placement",
      points: 8,
      detail: `Placed in whole-sign house ${planet.house}.`,
    });
  } else if ([6, 8, 12].includes(planet.house)) {
    score -= 5;
    factors.push({
      factor: "Dusthana placement",
      points: -5,
      detail: `Placed in whole-sign house ${planet.house}.`,
    });
  }

  if (planet.retrograde && !["rahu", "ketu"].includes(planet.name)) {
    score += 4;
    factors.push({
      factor: "Retrograde motion",
      points: 4,
      detail: "Traditional systems sometimes treat retrograde motion as added cheshta bala; interpretations vary.",
    });
  }

  if (planet.combust) {
    score -= 12;
    factors.push({
      factor: "Combustion",
      points: -12,
      detail: "Within the configured traditional combustion orb of the Sun.",
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score,
    label: labelStrength(score),
    method: "transparent-traditional-heuristic",
    factors,
    caveat:
      "This is an explainable screening score, not a full Shadbala calculation. It should not be represented as scientific measurement.",
  };
}

export function buildHouses(
  ascendantSignIndex: number,
  planets: PlanetPosition[],
): HousePosition[] {
  return Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const signIndex = (ascendantSignIndex + index) % 12;
    const sign = SIGNS[signIndex];
    const occupants = planets
      .filter((planet) => planet.house === number)
      .map((planet) => planet.name);
    const aspectedBy = planets
      .filter((planet) =>
        aspectDistances(planet.name).some(
          (distance) => ((planet.house + distance - 2) % 12) + 1 === number,
        ),
      )
      .map((planet) => planet.name);
    const lord = planets.find((planet) => planet.name === sign.lord);
    const factors: StrengthEvidence["factors"] = [];
    let score = 50;

    if (lord) {
      const delta = Math.round((lord.strength.score - 50) * 0.35);
      score += delta;
      factors.push({
        factor: "House lord condition",
        points: delta,
        detail: `${sign.lord} has a ${lord.strength.label} screening score in house ${lord.house}.`,
      });
    }

    const beneficCount = occupants.filter((planet) => BENEFICS.includes(planet)).length;
    const maleficCount = occupants.filter((planet) => MALEFICS.includes(planet)).length;
    const occupancyDelta = beneficCount * 5 - maleficCount * 3;
    if (occupants.length) {
      score += occupancyDelta;
      factors.push({
        factor: "Occupants",
        points: occupancyDelta,
        detail: `Contains ${occupants.join(", ")} under the configured natural-benefic/malefic convention.`,
      });
    }

    const beneficAspects = aspectedBy.filter((planet) => BENEFICS.includes(planet)).length;
    const maleficAspects = aspectedBy.filter((planet) => MALEFICS.includes(planet)).length;
    const aspectDelta = beneficAspects * 4 - maleficAspects * 2;
    if (aspectedBy.length) {
      score += aspectDelta;
      factors.push({
        factor: "Graha drishti",
        points: aspectDelta,
        detail: `Traditionally aspected by ${aspectedBy.join(", ")}.`,
      });
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    return {
      number,
      sign: sign.key,
      signIndex,
      lord: sign.lord,
      planets: occupants,
      aspectedBy,
      cuspSidereal: signIndex * 30,
      significance: HOUSE_SIGNIFICATIONS[index],
      strength: {
        score,
        label: labelStrength(score),
        method: "transparent-traditional-heuristic",
        factors,
        caveat:
          "This screening score is not Bhava Bala or Shadbala. It combines disclosed traditional factors for comparison only.",
      },
    };
  });
}

export function signDistance(fromSignIndex: number, toSignIndex: number) {
  return ((toSignIndex - fromSignIndex + 12) % 12) + 1;
}