import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

export function angularDistance(a: number, b: number) {
  const delta = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(delta, 360 - delta);
}

export function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDegree(value: number) {
  const normalized = normalizeDegrees(value);
  const degree = Math.floor(normalized);
  const minuteFloat = (normalized - degree) * 60;
  const minute = Math.floor(minuteFloat);
  const second = Math.round((minuteFloat - minute) * 60);
  return `${degree}° ${String(minute).padStart(2, "0")}′ ${String(second).padStart(2, "0")}″`;
}

export function formatDate(
  value: Date | string,
  locale = "en-IN",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function safeJsonParse<T>(value: string): T {
  return JSON.parse(value.replace(/^```json\s*/i, "").replace(/\s*```$/, "")) as T;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}