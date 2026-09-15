import "server-only";

import { z } from "zod";

export interface LocationResult {
  id: string;
  name: string;
  admin1: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  displayName: string;
}

export interface LocationProvider {
  search(query: string, language?: string): Promise<LocationResult[]>;
}

const responseSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        country: z.string(),
        country_code: z.string(),
        timezone: z.string(),
        admin1: z.string().optional(),
      }),
    )
    .optional(),
});

class OpenMeteoLocationProvider implements LocationProvider {
  async search(query: string, language = "en") {
    const params = new URLSearchParams({
      name: query,
      count: "7",
      language,
      format: "json",
    });
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${params}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Jyotira/1.0",
        },
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(7_000),
      },
    );
    if (!response.ok) {
      throw new Error(`Location provider returned ${response.status}.`);
    }
    const parsed = responseSchema.parse(await response.json());
    return (parsed.results ?? []).map((item) => {
      const admin = item.admin1?.trim() || null;
      return {
        id: String(item.id),
        name: item.name,
        admin1: admin,
        country: item.country,
        countryCode: item.country_code,
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone,
        displayName: [item.name, admin, item.country].filter(Boolean).join(", "),
      };
    });
  }
}

let provider: LocationProvider | undefined;

export function getLocationProvider() {
  provider ??= new OpenMeteoLocationProvider();
  return provider;
}