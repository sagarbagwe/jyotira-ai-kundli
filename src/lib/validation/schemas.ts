import { z } from "zod";
import { DateTime } from "luxon";
import { PLANET_NAMES } from "@/lib/astrology/types";
import {
  isDateRangeWithinDays,
  isValidCalendarDate,
  isValidClockTime,
  isValidIanaTimezone,
} from "./date-time";

const validTimezone = z.string().refine(isValidIanaTimezone, "Invalid IANA timezone");
const calendarDate = z.string().refine(isValidCalendarDate, "Invalid calendar date");

export const birthInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  dateOfBirth: calendarDate.refine(
    (date) => DateTime.fromISO(date, { zone: "utc" }) <= DateTime.now().toUTC().endOf("day"),
    "Date of birth cannot be in the future",
  ),
  timeOfBirth: z
    .string()
    .refine(isValidClockTime, "Time must be HH:MM or HH:MM:SS using a 24-hour clock"),
  place: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(120),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
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
    startDate: calendarDate,
    endDate: calendarDate,
  })
  .refine(
    ({ startDate, endDate }) => isDateRangeWithinDays(startDate, endDate, 730),
    { message: "End date must be after start date and no more than 730 days later", path: ["endDate"] },
  );

export const generationRequestSchema = z.object({
  birth: birthInputSchema,
  report: reportRequestSchema,
});

export const chatRequestSchema = z.object({
  reportId: z.string().min(1).max(100),
  question: z.string().trim().min(3).max(1200),
});

export const transitRequestSchema = z
  .object({
    reportId: z.string().min(1).max(100),
    startDate: calendarDate,
    endDate: calendarDate,
  })
  .refine(
    ({ startDate, endDate }) => isDateRangeWithinDays(startDate, endDate, 730),
    { message: "End date must be after start date and no more than 730 days later", path: ["endDate"] },
  );

export const extractedPlanetNameSchema = z.enum(PLANET_NAMES);
