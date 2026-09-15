function text(name: string, fallback?: string) {
  const value = process.env[name]?.trim();
  return value || fallback;
}

function integer(name: string, fallback: number, min: number, max: number) {
  const value = Number(text(name));
  return Number.isInteger(value) && value >= min && value <= max
    ? value
    : fallback;
}

const nodeType = text("NODE_TYPE", "true");

export const env = {
  NODE_ENV: text("NODE_ENV", "development") as
    | "development"
    | "test"
    | "production",
  GEMINI_API_KEY: text("GEMINI_API_KEY"),
  GEMINI_MODEL: text("GEMINI_MODEL", "gemini-2.5-flash")!,
  GEMINI_MAX_RETRIES: integer("GEMINI_MAX_RETRIES", 3, 0, 5),
  AI_MODE: "gemini" as const,
  ASTRO_ENGINE: "swiss" as const,
  AYANAMSA: "lahiri" as const,
  HOUSE_SYSTEM: "whole-sign" as const,
  NODE_TYPE: (nodeType === "mean" ? "mean" : "true") as "true" | "mean",
  DASHA_YEAR_DAYS: Number(text("DASHA_YEAR_DAYS", "365.2425")),
  MAX_UPLOAD_MB: integer("MAX_UPLOAD_MB", 10, 1, 25),
  AI_REQUESTS_PER_HOUR: integer("AI_REQUESTS_PER_HOUR", 20, 1, 1000),
  REPORTS_PER_DAY: integer("REPORTS_PER_DAY", 5, 1, 1000),
  LOG_LEVEL: text("LOG_LEVEL", "info")!,
};

export function assertGeminiConfigured() {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required.");
  }
}
