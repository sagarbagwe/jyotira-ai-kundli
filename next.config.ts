import type { NextConfig } from "next";

const swissEphemerisRuntimeFiles = [
  "./node_modules/@swisseph/node/**/*",
  "./node_modules/@swisseph/core/**/*",
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@swisseph/node", "@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/api/stateless/report": swissEphemerisRuntimeFiles,
    "/api/calculate": swissEphemerisRuntimeFiles,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;
