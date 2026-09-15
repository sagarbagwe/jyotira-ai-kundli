import { SIGNS, VARGA_META } from "./constants";
import type {
  BirthTimeAccuracy,
  DivisionalChart,
  DivisionalPlacement,
  PlanetPosition,
} from "./types";
import { normalizeDegrees } from "@/lib/utils";

function signType(signIndex: number) {
  return SIGNS[signIndex].modality;
}

function expandEqualPart(
  degreeInSign: number,
  division: number,
  resultSign: number,
) {
  const size = 30 / division;
  const degreeWithin = degreeInSign % size;
  return normalizeDegrees(resultSign * 30 + degreeWithin * division);
}

export function calculateVargaLongitude(
  longitude: number,
  division: number,
) {
  const normalized = normalizeDegrees(longitude);
  const sign = Math.floor(normalized / 30);
  const degree = normalized % 30;
  const oddSign = sign % 2 === 0;

  if (division === 1) return normalized;

  if (division === 2) {
    const firstHalf = degree < 15;
    const resultSign = oddSign
      ? firstHalf
        ? 4
        : 3
      : firstHalf
        ? 3
        : 4;
    return expandEqualPart(degree, 2, resultSign);
  }

  if (division === 3) {
    const part = Math.floor(degree / 10);
    return expandEqualPart(degree, 3, (sign + part * 4) % 12);
  }

  if (division === 4) {
    const part = Math.floor(degree / 7.5);
    return expandEqualPart(degree, 4, (sign + part * 3) % 12);
  }

  if (division === 7) {
    const part = Math.min(6, Math.floor(degree / (30 / 7)));
    const start = oddSign ? sign : (sign + 6) % 12;
    return expandEqualPart(degree, 7, (start + part) % 12);
  }

  if (division === 9) {
    const part = Math.min(8, Math.floor(degree / (30 / 9)));
    const offset =
      signType(sign) === "movable"
        ? 0
        : signType(sign) === "fixed"
          ? 8
          : 4;
    return expandEqualPart(degree, 9, (sign + offset + part) % 12);
  }

  if (division === 10) {
    const part = Math.min(9, Math.floor(degree / 3));
    const start = oddSign ? sign : (sign + 8) % 12;
    return expandEqualPart(degree, 10, (start + part) % 12);
  }

  if (division === 12) {
    const part = Math.min(11, Math.floor(degree / 2.5));
    return expandEqualPart(degree, 12, (sign + part) % 12);
  }

  if (division === 16) {
    const part = Math.min(15, Math.floor(degree / (30 / 16)));
    const start =
      signType(sign) === "movable"
        ? 0
        : signType(sign) === "fixed"
          ? 4
          : 8;
    return expandEqualPart(degree, 16, (start + part) % 12);
  }

  if (division === 20) {
    const part = Math.min(19, Math.floor(degree / 1.5));
    const start =
      signType(sign) === "movable"
        ? 0
        : signType(sign) === "fixed"
          ? 8
          : 4;
    return expandEqualPart(degree, 20, (start + part) % 12);
  }

  if (division === 24) {
    const part = Math.min(23, Math.floor(degree / 1.25));
    const start = oddSign ? 4 : 3;
    return expandEqualPart(degree, 24, (start + part) % 12);
  }

  if (division === 30) {
    let resultSign: number;
    let segmentStart: number;
    let segmentSize: number;

    if (oddSign) {
      if (degree < 5) [resultSign, segmentStart, segmentSize] = [0, 0, 5];
      else if (degree < 10)
        [resultSign, segmentStart, segmentSize] = [10, 5, 5];
      else if (degree < 18)
        [resultSign, segmentStart, segmentSize] = [8, 10, 8];
      else if (degree < 25)
        [resultSign, segmentStart, segmentSize] = [2, 18, 7];
      else [resultSign, segmentStart, segmentSize] = [6, 25, 5];
    } else {
      if (degree < 5) [resultSign, segmentStart, segmentSize] = [1, 0, 5];
      else if (degree < 12)
        [resultSign, segmentStart, segmentSize] = [5, 5, 7];
      else if (degree < 20)
        [resultSign, segmentStart, segmentSize] = [11, 12, 8];
      else if (degree < 25)
        [resultSign, segmentStart, segmentSize] = [9, 20, 5];
      else [resultSign, segmentStart, segmentSize] = [7, 25, 5];
    }

    return normalizeDegrees(
      resultSign * 30 + ((degree - segmentStart) / segmentSize) * 30,
    );
  }

  if (division === 60) {
    const part = Math.min(59, Math.floor(degree / 0.5));
    return expandEqualPart(degree, 60, (sign + part) % 12);
  }

  throw new Error(`Unsupported divisional chart D${division}`);
}

function placement(
  name: DivisionalPlacement["name"],
  sourceLongitude: number,
  division: number,
): DivisionalPlacement {
  const longitude = calculateVargaLongitude(sourceLongitude, division);
  const signIndex = Math.floor(longitude / 30);
  return {
    name,
    signIndex,
    sign: SIGNS[signIndex].key,
    degreeInDivision: longitude % 30,
  };
}

export function calculateDivisionalCharts(
  planets: PlanetPosition[],
  ascendantLongitude: number,
  timeAccuracy: BirthTimeAccuracy,
): DivisionalChart[] {
  return Object.keys(VARGA_META)
    .map(Number)
    .sort((a, b) => a - b)
    .map((division) => {
      const meta = VARGA_META[division];
      const needsExactTime = division >= 7;
      const available = !needsExactTime || timeAccuracy === "exact";
      const unavailableReason = available
        ? undefined
        : `D${division} is hidden because this implementation requires an exact birth time for higher, birth-time-sensitive Vargas.`;

      return {
        ...meta,
        division,
        available,
        unavailableReason,
        ascendant: available
          ? placement("ascendant", ascendantLongitude, division)
          : null,
        placements: available
          ? planets.map((planet) =>
              placement(planet.name, planet.siderealLongitude, division),
            )
          : [],
        ruleSet:
          division === 30
            ? "Parashari unequal Trimsamsa rulership segments"
            : `Parashari Shodashavarga mapping, D${division}`,
      };
    });
}