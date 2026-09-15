import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/app/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jyotira — AI Kundli & Vedic Astrology",
    template: "%s · Jyotira",
  },
  description:
    "Generate a Vedic astrology report from calculated Swiss Ephemeris birth-chart data and grounded Gemini interpretation.",
  applicationName: "Jyotira",
  keywords: [
    "Kundli",
    "Vedic astrology",
    "Jyotish",
    "Swiss Ephemeris",
    "Gemini AI",
  ],
  openGraph: {
    title: "Jyotira — Understand Your Kundli With AI",
    description:
      "Calculated birth-chart data. Grounded AI interpretation. Clear uncertainty labels.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#141418" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
