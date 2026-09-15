import { z } from "zod";
import { DateTime } from "luxon";
import { PLANET_NAMES } from "@/lib/astrology/types";

const validTimezone = z.string().refine(
  (timezone) => DateTime.local().setZone(timezone).isValid,
  "Invalid IANA timezone",
);

export const birthInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((date) => DateTime.fromISO(date).isValid, "Invalid date")
    .refine(
      (date) => DateTime.fromISO(date) <= DateTime.now().endOf("day"),
      "Date of birth cannot be in the future",
    ),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  place: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: validTimezone,
  timeAccuracy: z.enum(["exact", "approximate", "unknown"]),
});

export const reportRequestSchema = z
  .object({
    type: z.enum(["basic", "detailed", "premium"]),
    language: z.enum(["en", "hi", "mr"]),
    sections: z
      .array(
        z.enum([
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
          "remedies",
          "health",
        ]),
      )
      .min(1),
    startDate: z.string().date(),
    endDate: z.string().date(),
  })
  .refine(
    ({ startDate, endDate }) =>
      DateTime.fromISO(endDate) > DateTime.fromISO(startDate),
    { message: "End date must be after start date", path: ["endDate"] },
  )
  .refine(
    ({ startDate, endDate }) =>
      DateTime.fromISO(endDate).diff(DateTime.fromISO(startDate), "days").days <=
      730,
    {
      message: "Date range cannot exceed 730 days",
      path: ["endDate"],
    },
  );

export const generationRequestSchema = z.object({
  birth: birthInputSchema,
  report: reportRequestSchema,
});

export const chatRequestSchema = z.object({
  reportId: z.string().min(1).max(100),
  question: z.string().trim().min(3).max(1200),
});

export const transitRequestSchema = z.object({
  chart: z.unknown(),
  startDate: z.string().date(),
  endDate: z.string().date(),
});

export const extractedPlanetNameSchema = z.enum(PLANET_NAMES);