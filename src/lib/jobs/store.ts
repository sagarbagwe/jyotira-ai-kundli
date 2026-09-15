import type { AstrologyReport } from "@/lib/ai/schemas";
import type {
  CalculatedChart,
  ReportRequest,
} from "@/lib/astrology/types";
import type { z } from "zod";
import type { generationRequestSchema } from "@/lib/validation/schemas";

export type GenerationPayload = z.infer<typeof generationRequestSchema>;

export interface JobState {
  id: string;
  userId: string;
  status:
    | "QUEUED"
    | "CALCULATING"
    | "ANALYZING"
    | "GENERATING_REPORT"
    | "COMPLETED"
    | "FAILED";
  progress: number;
  currentStep: string;
  payload: GenerationPayload;
  reportId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportArtifact {
  id: string;
  userId: string;
  chart: CalculatedChart;
  request: ReportRequest;
  interpretation: AstrologyReport;
  createdAt: string;
}

const globalStore = globalThis as unknown as {
  jyotiraJobs?: Map<string, JobState>;
  jyotiraReports?: Map<string, ReportArtifact>;
};

export const demoJobs =
  globalStore.jyotiraJobs ?? (globalStore.jyotiraJobs = new Map());
export const demoReports =
  globalStore.jyotiraReports ?? (globalStore.jyotiraReports = new Map());