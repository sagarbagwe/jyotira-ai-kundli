import { describe, expect, it } from "vitest";
import {
  kundliAnswerSchema,
  kundliExtractionSchema,
} from "@/lib/ai/schemas";

describe("AI output schemas", () => {
  it("rejects free-form Kundli answers without evidence", () => {
    const result = kundliAnswerSchema.safeParse({
      answer: "You will definitely get rich.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null extraction fields instead of invented values", () => {
    const empty = {
      value: null,
      confidence: 0,
      sourceText: null,
    };
    const result = kundliExtractionSchema.safeParse({
      name: empty,
      dateOfBirth: empty,
      timeOfBirth: empty,
      birthPlace: empty,
      rashi: empty,
      lagna: empty,
      nakshatra: empty,
      planetaryPositions: [],
      dashaInformation: [],
      warnings: ["Birth time not visible"],
      extractionNotes: [],
    });
    expect(result.success).toBe(true);
  });
});