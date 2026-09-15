import type { AstrologyReport } from "@/lib/ai/schemas";
import type { CalculatedChart, ReportRequest } from "@/lib/astrology/types";

export const STATELESS_REPORT_KEY = "jyotira:stateless-report:v1";

export interface StatelessReportArtifact {
  id: string;
  userId: string;
  chart: CalculatedChart;
  request: ReportRequest;
  interpretation: AstrologyReport;
  createdAt: string;
}
