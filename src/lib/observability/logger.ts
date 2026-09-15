import "server-only";

import pino from "pino";
import { env } from "@/lib/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "jyotira-web",
    environment: env.NODE_ENV,
  },
  redact: {
    paths: [
      "email",
      "*.email",
      "birth",
      "*.birth",
      "dateOfBirth",
      "timeOfBirth",
      "place",
      "latitude",
      "longitude",
      "req.headers.authorization",
      "GEMINI_API_KEY",
    ],
    censor: "[REDACTED]",
  },
});