import "server-only";

import { cache } from "react";
import { astrologyReportSchema } from "@/lib/ai/schemas";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import type { ReportArtifact } from "@/lib/jobs/store";
import { titleCase } from "@/lib/utils";

export const DEMO_REPORT_ID = "demo";

export const getDemoArtifact = cache(async (): Promise<ReportArtifact> => {
  const chart = await getAstrologyEngine().calculateNatal({
    name: "Aarav Sharma",
    dateOfBirth: "1992-11-08",
    timeOfBirth: "06:42:00",
    place: "Pune, Maharashtra",
    country: "India",
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: "Asia/Kolkata",
    timeAccuracy: "exact",
  });
  const request = {
    type: "premium" as const,
    language: "en" as const,
    sections: [
      "career",
      "money",
      "property",
      "relationships",
      "education",
      "travel",
      "dashas",
      "transits",
      "yogas",
      "doshas",
    ],
    startDate: "2026-09-01",
    endDate: "2027-12-31",
  };
  chart.transits = await getAstrologyEngine().calculateTransits(
    chart,
    request.startDate,
    request.endDate,
  );

  const currentMaha = chart.dashas.current.mahadasha?.lord ?? "unknown";
  const currentAntar = chart.dashas.current.antardasha?.lord ?? "unknown";
  const detectedYogas = chart.yogas.filter((yoga) => yoga.detected);

  const makeSection = (
    headline: string,
    analysis: string,
    strengths: string[] = [],
    considerations: string[] = [],
  ) => ({
    headline,
    analysis,
    strengths,
    considerations,
    supportivePeriods: [],
    cautionPeriods: [],
  });

  const traditional =
    "In the selected traditional Vedic framework, this is an interpretive theme rather than a scientifically established prediction.";
  const interpretation = astrologyReportSchema.parse({
    reportVersion: "1.0",
    language: "en",
    summary: `The calculated chart shows ${titleCase(chart.ascendant.sign)} Lagna, ${titleCase(chart.rashi.moonSign)} Moon and ${chart.rashi.nakshatra.name} nakshatra. The active Vimshottari sequence is ${titleCase(currentMaha)}–${titleCase(currentAntar)}. ${traditional}`,
    keyThemes: [
      `${titleCase(chart.ascendant.sign)} rising`,
      `${titleCase(chart.rashi.moonSign)} Moon`,
      `${chart.rashi.nakshatra.name}, pada ${chart.rashi.nakshatra.pada}`,
      `${titleCase(currentMaha)} Mahadasha`,
    ],
    sections: {
      lagna: makeSection(
        `${titleCase(chart.ascendant.sign)} Lagna`,
        `${traditional} The ascendant lord is ${titleCase(chart.ascendant.lord)}; its calculated placement and aspects shape the traditional reading of self-presentation and priorities.`,
        [
          `Ascendant ${chart.ascendant.degreeInSign.toFixed(2)}° ${titleCase(chart.ascendant.sign)}`,
          `Lagna lord: ${titleCase(chart.ascendant.lord)}`,
        ],
      ),
      rashi: makeSection(
        `${titleCase(chart.rashi.moonSign)} Rashi`,
        `${traditional} The Moon's sign and house are considered together for emotional habits and response patterns.`,
      ),
      nakshatra: makeSection(
        `${chart.rashi.nakshatra.name}, pada ${chart.rashi.nakshatra.pada}`,
        `${traditional} The configured metadata associates this nakshatra with ${chart.rashi.nakshatra.deity} and the symbol “${chart.rashi.nakshatra.symbol}.”`,
      ),
      career: makeSection(
        "Career: steady skill compounding",
        `${traditional} The 10th house, its lord, calculated D10 placements and current dasha suggest reading professional change as a process of skill consolidation rather than a guaranteed event.`,
        [
          `10th house: ${titleCase(chart.houses[9].sign)}`,
          `10th lord: ${titleCase(chart.houses[9].lord)}`,
        ],
        ["Avoid treating transit dates as job guarantees."],
      ),
      money: makeSection(
        "Money: structure before expansion",
        `${traditional} The 2nd and 11th house factors support reviewing savings discipline and income diversity. No investment return can be inferred or promised.`,
        [`2nd lord: ${titleCase(chart.houses[1].lord)}`],
      ),
      property: makeSection(
        "Property and home",
        `${traditional} The 4th house and D4 are the relevant references. Timing should be treated as a planning window, not certainty.`,
      ),
      relationships: makeSection(
        "Relationships: clarity and mutual expectations",
        `${traditional} The 7th house and D9 are read together. The chart cannot guarantee a marriage date or relationship outcome.`,
      ),
      education: makeSection(
        "Education: applied learning",
        `${traditional} The 4th and 5th houses, Mercury, Jupiter and available D24 placements provide the calculation basis.`,
      ),
      travel: makeSection(
        "Travel and foreign connections",
        `${traditional} The 9th and 12th houses and Rahu are considered. These are themes, not a promise of relocation.`,
      ),
      health: makeSection(
        "Wellbeing: general themes only",
        `${traditional} Astrology cannot diagnose disease. Seek a licensed clinician for symptoms, diagnosis or treatment.`,
      ),
    },
    importantPeriods: [
      {
        label: `${titleCase(currentMaha)}–${titleCase(currentAntar)}`,
        startDate: chart.dashas.current.antardasha?.start ?? null,
        endDate: chart.dashas.current.antardasha?.end ?? null,
        confidence: "medium",
        reasoning:
          "Dates are calculated from Vimshottari rules; life-area meaning is a traditional interpretation and depends on the full chart.",
        evidence: [
          {
            type: "dasha",
            reference: `${currentMaha}/${currentAntar}`,
            explanation: "Calculated active Mahadasha and Antardasha.",
          },
        ],
      },
    ],
    remedies: [],
    caveats: [
      "Astrology is not scientifically established as a predictive method.",
      "Timing language describes comparatively supportive or challenging traditional indicators, not certainty.",
      `${detectedYogas.length} yoga rule(s) matched the configured deterministic subset; each still requires full-chart judgment.`,
    ],
    disclaimer:
      "This report is provided for educational and entertainment purposes and reflects traditional astrological interpretations. Astrology is not scientifically established as a predictive method. Predictions should not be treated as certainty or as professional medical, financial, legal, or other expert advice.",
  });

  return {
    id: DEMO_REPORT_ID,
    userId: "demo-user",
    chart,
    request,
    interpretation,
    createdAt: new Date().toISOString(),
  };
});