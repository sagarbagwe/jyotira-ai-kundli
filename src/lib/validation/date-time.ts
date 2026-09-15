import { DateTime } from "luxon";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export function isValidCalendarDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = DateTime.fromISO(value, { zone: "utc" });
  return parsed.isValid && parsed.toISODate() === value;
}

export function isValidClockTime(value: string) {
  return CLOCK_PATTERN.test(value);
}

export function isValidIanaTimezone(value: string) {
  return DateTime.local().setZone(value).isValid;
}

export function isDateRangeWithinDays(
  startDate: string,
  endDate: string,
  maximumDays: number,
) {
  const start = DateTime.fromISO(startDate, { zone: "utc" }).startOf("day");
  const end = DateTime.fromISO(endDate, { zone: "utc" }).startOf("day");
  if (!start.isValid || !end.isValid || end <= start) return false;
  return end.diff(start, "days").days <= maximumDays;
}
