import { z } from "zod";

function blankToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

function normalizePublicUrl(value: unknown) {
  const normalized = blankToUndefined(value);
  if (
    typeof normalized === "string" &&
    !/^https?:\/\//i.test(normalized)
  ) {
    return "https:" + "//" + normalized;
  }
  return normalized;
}

const optionalString = z
  .preprocess(blankToUndefined, z.string().optional())
  .catch(undefined);
const optionalUrl = z
  .preprocess(blankToUndefined, z.string().url().optional())
  .catch(undefined);

const schema = z.object({
  NODE_ENV: z
    .preprocess(
      blankToUndefined,
      z.enum(["development", "test", "production"]).default("development"),
    )
    .catch("development"),
  NEXT_PUBLIC_APP_URL: z
    .preprocess(
      normalizePublicUrl,
      z.string().url().default("http://localhost:3000"),
    )
    .catch("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z
    .preprocess(blankToUndefined, z.string().default("Jyotira"))
    .catch("Jyotira"),
  DEMO_MODE: z
    .preprocess(
      blankToUndefined,
      z.enum(["true", "false"]).default("true"),
    )
    .catch("true")
    .transform((value) => value === "true"),
  DATABASE_URL: optionalString,
  DIRECT_URL: optionalString,
  AUTH_SECRET: z
    .preprocess(blankToUndefined, z.string().min(16).optional())
    .catch(undefined),
  AUTH_GOOGLE_ID: optionalString,
  AUTH_GOOGLE_SECRET: optionalString,
  AUTH_GITHUB_ID: optionalString,
  AUTH_GITHUB_SECRET: optionalString,
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: z
    .preprocess(
      blankToUndefined,
      z.string().default("gemini-2.5-flash"),
    )
    .catch("gemini-2.5-flash"),
  GEMINI_MAX_RETRIES: z
    .preprocess(
      blankToUndefined,
      z.coerce.number().int().min(0).max(5).default(3),
    )
    .catch(3),
  AI_MODE: z
    .preprocess(
      blankToUndefined,
      z.enum(["gemini", "stub"]).default("gemini"),
    )
    .catch("gemini"),
  ASTRO_ENGINE: z
    .preprocess(blankToUndefined, z.enum(["swiss"]).default("swiss"))
    .catch("swiss"),
  AYANAMSA: z
    .preprocess(blankToUndefined, z.enum(["lahiri"]).default("lahiri"))
    .catch("lahiri"),
  HOUSE_SYSTEM: z
    .preprocess(
      blankToUndefined,
      z.enum(["whole-sign"]).default("whole-sign"),
    )
    .catch("whole-sign"),
  NODE_TYPE: z
    .preprocess(
      blankToUndefined,
      z.enum(["true", "mean"]).default("true"),
    )
    .catch("true"),
  DASHA_YEAR_DAYS: z
    .preprocess(
      blankToUndefined,
      z.coerce.number().min(360).max(366).default(365.2425),
    )
    .catch(365.2425),
  STORAGE_DRIVER: z
    .preprocess(
      blankToUndefined,
      z.enum(["local", "s3"]).default("local"),
    )
    .catch("local"),
  S3_ENDPOINT: optionalUrl,
  S3_REGION: z
    .preprocess(blankToUndefined, z.string().default("auto"))
    .catch("auto"),
  S3_BUCKET: optionalString,
  S3_ACCESS_KEY_ID: optionalString,
  S3_SECRET_ACCESS_KEY: optionalString,
  S3_FORCE_PATH_STYLE: z
    .preprocess(
      blankToUndefined,
      z.enum(["true", "false"]).default("false"),
    )
    .catch("false")
    .transform((value) => value === "true"),
  SIGNED_URL_TTL_SECONDS: z
    .preprocess(
      blankToUndefined,
      z.coerce.number().int().min(60).max(86400).default(900),
    )
    .catch(900),
  MAX_UPLOAD_MB: z
    .preprocess(
      blankToUndefined,
      z.coerce.number().min(1).max(25).default(10),
    )
    .catch(10),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
  AI_REQUESTS_PER_HOUR: z
    .preprocess(
      blankToUndefined,
      z.coerce.number().int().min(1).default(20),
    )
    .catch(20),
  REPORTS_PER_DAY: z
    .preprocess(
      blankToUndefined,
      z.coerce.number().int().min(1).default(5),
    )
    .catch(5),
  LOG_LEVEL: z
    .preprocess(blankToUndefined, z.string().default("info"))
    .catch("info"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export function assertProductionEnv() {
  if (env.NODE_ENV !== "production" || env.DEMO_MODE) return;

  const missing: string[] = [];
  if (!env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!env.DIRECT_URL) missing.push("DIRECT_URL");
  if (!env.AUTH_SECRET) missing.push("AUTH_SECRET");
  const hasGoogle = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
  const hasGitHub = Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
  if (!hasGoogle && !hasGitHub) {
    missing.push(
      "AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET or AUTH_GITHUB_ID/AUTH_GITHUB_SECRET",
    );
  }
  if (env.AI_MODE === "gemini" && !env.GEMINI_API_KEY) {
    missing.push("GEMINI_API_KEY");
  }
  if (env.STORAGE_DRIVER !== "s3") {
    missing.push("STORAGE_DRIVER=s3");
  } else {
    if (!env.S3_BUCKET) missing.push("S3_BUCKET");
    if (!env.S3_ACCESS_KEY_ID) missing.push("S3_ACCESS_KEY_ID");
    if (!env.S3_SECRET_ACCESS_KEY) missing.push("S3_SECRET_ACCESS_KEY");
  }
  if (!env.UPSTASH_REDIS_REST_URL) missing.push("UPSTASH_REDIS_REST_URL");
  if (!env.UPSTASH_REDIS_REST_TOKEN) missing.push("UPSTASH_REDIS_REST_TOKEN");
  if (env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    missing.push("NEXT_PUBLIC_APP_URL (public production URL)");
  }

  if (missing.length) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
}
