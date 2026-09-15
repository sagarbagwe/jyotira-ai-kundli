import { describe, expect, it } from "vitest";
import { calculateVimshottariDasha } from "@/lib/astrology/dasha";
import {
  getNakshatra,
  signFromLongitude,
  wholeSignHouse,
} from "@/lib/astrology/core";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import { calculateVargaLongitude } from "@/lib/astrology/vargas";

describe("zodiac and nakshatra utilities", () => {
  it("normalizes longitudes and maps signs", () => {
    expect(signFromLongitude(0)).toBe("aries");
    expect(signFromLongitude(359.999)).toBe("pisces");
    expect(signFromLongitude(-1)).toBe("pisces");
  });

  it("maps nakshatra boundaries and padas deterministically", () => {
    expect(getNakshatra(0)).toMatchObject({
      name: "Ashwini",
      pada: 1,
      lord: "ketu",
    });
    expect(getNakshatra(13.3333333334)).toMatchObject({
      name: "Bharani",
      pada: 1,
      lord: "venus",
    });
    expect(getNakshatra(359.999)).toMatchObject({
      name: "Revati",
      pada: 4,
      lord: "mercury",
    });
  });

  it("uses whole sign house offsets", () => {
    expect(wholeSignHouse(4, 4)).toBe(1);
    expect(wholeSignHouse(10, 4)).toBe(7);
    expect(wholeSignHouse(3, 4)).toBe(12);
  });
});

describe("Parashari varga mappings", () => {
  it("maps odd and even Hora halves", () => {
    expect(signFromLongitude(calculateVargaLongitude(4, 2))).toBe("leo");
    expect(signFromLongitude(calculateVargaLongitude(20, 2))).toBe("cancer");
    expect(signFromLongitude(calculateVargaLongitude(34, 2))).toBe("cancer");
    expect(signFromLongitude(calculateVargaLongitude(50, 2))).toBe("leo");
  });

  it("maps Drekkana and Navamsa reference positions", () => {
    expect(signFromLongitude(calculateVargaLongitude(15, 3))).toBe("leo");
    expect(signFromLongitude(calculateVargaLongitude(1, 9))).toBe("aries");
    expect(signFromLongitude(calculateVargaLongitude(31, 9))).toBe("capricorn");
  });

  it("uses unequal Trimsamsa segments", () => {
    expect(signFromLongitude(calculateVargaLongitude(2, 30))).toBe("aries");
    expect(signFromLongitude(calculateVargaLongitude(7, 30))).toBe("aquarius");
    expect(signFromLongitude(calculateVargaLongitude(36, 30))).toBe("virgo");
  });
});

describe("Vimshottari dasha", () => {
  it("builds contiguous 120-year Maha periods with nested periods", () => {
    const nakshatra = getNakshatra(2);
    const dasha = calculateVimshottariDasha(
      nakshatra,
      new Date("1990-01-01T00:00:00Z"),
      365.2425,
      new Date("2026-09-14T00:00:00Z"),
    );
    expect(dasha.periods).toHaveLength(9);
    expect(
      dasha.periods.reduce(
        (total, period) => total + period.durationDays,
        0,
      ),
    ).toBeCloseTo(120 * 365.2425, 5);
    dasha.periods.forEach((period, index) => {
      expect(period.subPeriods).toHaveLength(9);
      if (index > 0) {
        expect(period.start).toBe(dasha.periods[index - 1].end);
      }
    });
  });
});

describe("Swiss Ephemeris integration", () => {
  it("calculates a reproducible sidereal chart without AI", async () => {
    const chart = await getAstrologyEngine().calculateNatal({
      name: "Synthetic test",
      dateOfBirth: "1990-05-15",
      timeOfBirth: "14:30:00",
      place: "Mumbai",
      country: "India",
      latitude: 19.076,
      longitude: 72.8777,
      timezone: "Asia/Kolkata",
      timeAccuracy: "exact",
    });
    expect(chart.ascendant.sign).toBe("leo");
    expect(chart.rashi.moonSign).toBe("capricorn");
    expect(chart.rashi.nakshatra.name).toBe("Uttara Ashadha");
    expect(chart.rashi.nakshatra.pada).toBe(2);
    expect(chart.planets).toHaveLength(9);
    expect(chart.houses).toHaveLength(12);
    expect(chart.divisionalCharts.filter((item) => item.available)).toHaveLength(
      13,
    );
  });
});