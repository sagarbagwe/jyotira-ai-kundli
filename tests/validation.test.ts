import { describe, expect, it } from "vitest";
import {
  birthInputSchema,
  reportRequestSchema,
  transitRequestSchema,
} from "@/lib/validation/schemas";

const validBirth = {
  name: "Validation fixture",
  dateOfBirth: "1990-05-15",
  timeOfBirth: "14:30:00",
  place: "Mumbai",
  country: "India",
  latitude: 19.076,
  longitude: 72.8777,
  timezone: "Asia/Kolkata",
  timeAccuracy: "exact" as const,
};

describe("birth input validation", () => {
  it("accepts a valid birth record", () => {
    expect(birthInputSchema.safeParse(validBirth).success).toBe(true);
  });

  it.each(["24:00", "23:60", "12:30:60", "9:30", "noon"])(
    "rejects invalid clock time %s",
    (timeOfBirth) => {
      expect(
        birthInputSchema.safeParse({ ...validBirth, timeOfBirth }).success,
      ).toBe(false);
    },
  );

  it.each(["2025-02-29", "2026-13-01", "2026-00-10", "15/05/1990"])(
    "rejects invalid or non-ISO date %s",
    (dateOfBirth) => {
      expect(
        birthInputSchema.safeParse({ ...validBirth, dateOfBirth }).success,
      ).toBe(false);
    },
  );

  it("rejects non-finite coordinates and invalid timezones", () => {
    expect(
      birthInputSchema.safeParse({ ...validBirth, latitude: Number.NaN }).success,
    ).toBe(false);
    expect(
      birthInputSchema.safeParse({
        ...validBirth,
        timezone: "Not/A_Real_Zone",
      }).success,
    ).toBe(false);
  });
});

describe("report and transit range validation", () => {
  const range = {
    startDate: "2026-09-01",
    endDate: "2027-12-31",
  };

  it("accepts a valid report range", () => {
    expect(
      reportRequestSchema.safeParse({
        ...range,
        type: "premium",
        language: "en",
        sections: ["career", "transits"],
      }).success,
    ).toBe(true);
  });

  it("rejects reversed and over-two-year ranges consistently", () => {
    expect(
      transitRequestSchema.safeParse({
        reportId: "report-1",
        startDate: "2027-01-01",
        endDate: "2026-01-01",
      }).success,
    ).toBe(false);
    expect(
      transitRequestSchema.safeParse({
        reportId: "report-1",
        startDate: "2026-01-01",
        endDate: "2028-01-02",
      }).success,
    ).toBe(false);
  });
});
