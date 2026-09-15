import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Jyotira"),
  DEMO_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(3),
  AI_MODE: z.enum(["gemini", "stub"]).default("gemini"),
  ASTRO_ENGINE: z.enum(["swiss"]).default("swiss"),
  AYANAMSA: z.enum(["lahiri"]).default("lahiri"),
  HOUSE_SYSTEM: z.enum(["whole-sign"]).default("whole-sign"),
  NODE_TYPE: z.enum(["true", "mean"]).default("true"),
  DASHA_YEAR_DAYS: z.coerce.number().min(360).max(366).default(365.2425),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: optionalUrl,
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(86400).default(900),
  MAX_UPLOAD_MB: z.coerce.number().min(1).max(25).default(10),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  AI_REQUESTS_PER_HOUR: z.coerce.number().int().min(1).default(20),
  REPORTS_PER_DAY: z.coerce.number().int().min(1).default(5),
  LOG_LEVEL: z.string().default("info"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export function assertProductionEnv() {
  if (env.NODE_ENV !== "production") return;

  const missing: string[] = [];
  if (!env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!env.AUTH_SECRET) missing.push("AUTH_SECRET");
  if (env.AI_MODE === "gemini" && !env.GEMINI_API_KEY) {
    missing.push("GEMINI_API_KEY");
  }
  if (env.STORAGE_DRIVER === "s3") {
    if (!env.S3_BUCKET) missing.push("S3_BUCKET");
    if (!env.S3_ACCESS_KEY_ID) missing.push("S3_ACCESS_KEY_ID");
    if (!env.S3_SECRET_ACCESS_KEY) missing.push("S3_SECRET_ACCESS_KEY");
  }

  if (missing.length) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
}