import { z } from "zod";

export const evidenceSchema = z.object({
  type: z.enum(["dasha", "transit", "house", "planet", "yoga", "divisional-chart"]),
  reference: z.string(),
  explanation: z.string(),
});

export const periodSchema = z.object({
  label: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  reasoning: z.string(),
  evidence: z.array(evidenceSchema).max(8),
});

export const analysisSectionSchema = z.object({
  headline: z.string(),
  analysis: z.string(),
  strengths: z.array(z.string()).max(6),
  considerations: z.array(z.string()).max(6),
  supportivePeriods: z.array(periodSchema).max(6),
  cautionPeriods: z.array(periodSchema).max(6),
});

export const astrologyReportSchema = z.object({
  reportVersion: z.literal("1.0"),
  language: z.enum(["en", "hi", "mr"]),
  summary: z.string(),
  keyThemes: z.array(z.string()).min(3).max(8),
  sections: z.object({
    lagna: analysisSectionSchema,
    rashi: analysisSectionSchema,
    nakshatra: analysisSectionSchema,
    career: analysisSectionSchema,
    money: analysisSectionSchema,
    property: analysisSectionSchema,
    relationships: analysisSectionSchema,
    education: analysisSectionSchema,
    travel: analysisSectionSchema,
    health: analysisSectionSchema,
  }),
  importantPeriods: z.array(periodSchema).max(12),
  remedies: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      traditionLabel: z.literal("Traditional practice"),
      optional: z.literal(true),
    }),
  ).max(8),
  caveats: z.array(z.string()).min(2).max(10),
  disclaimer: z.string(),
});

export type AstrologyReport = z.infer<typeof astrologyReportSchema>;

export const kundliAnswerSchema = z.object({
  answer: z.string(),
  interpretationLabel: z.literal("Traditional Vedic astrology interpretation"),
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(evidenceSchema).min(1).max(10),
  assumptions: z.array(z.string()).max(5),
  caveats: z.array(z.string()).min(1).max(5),
  followUpSuggestions: z.array(z.string()).max(3),
});

export type KundliAnswer = z.infer<typeof kundliAnswerSchema>;

const extractedFieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  sourceText: z.string().nullable(),
});

export const kundliExtractionSchema = z.object({
  name: extractedFieldSchema,
  dateOfBirth: extractedFieldSchema,
  timeOfBirth: extractedFieldSchema,
  birthPlace: extractedFieldSchema,
  rashi: extractedFieldSchema,
  lagna: extractedFieldSchema,
  nakshatra: extractedFieldSchema,
  planetaryPositions: z.array(
    z.object({
      planet: z.string(),
      sign: z.string().nullable(),
      degree: z.string().nullable(),
      house: z.string().nullable(),
      confidence: z.number().min(0).max(1),
      sourceText: z.string().nullable(),
    }),
  ).max(20),
  dashaInformation: z.array(
    z.object({
      level: z.string(),
      lord: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      confidence: z.number().min(0).max(1),
      sourceText: z.string().nullable(),
    }),
  ).max(30),
  warnings: z.array(z.string()).max(15),
  extractionNotes: z.array(z.string()).max(10),
});

export type KundliExtraction = z.infer<typeof kundliExtractionSchema>;