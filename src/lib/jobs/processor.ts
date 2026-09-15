import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getAIProvider } from "@/lib/ai/provider";
import { getAstrologyEngine } from "@/lib/astrology/engine";
import type {
  CalculatedChart,
  DashaPeriod,
  ReportRequest,
} from "@/lib/astrology/types";
import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/observability/logger";
import { sleep } from "@/lib/utils";
import {
  demoJobs,
  demoReports,
  type GenerationPayload,
  type JobState,
  type ReportArtifact,
} from "./store";

interface Actor {
  id: string;
  name: string;
  demo: boolean;
}

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function flattenDashas(
  periods: DashaPeriod[],
  path: string[] = [],
): Array<{
  system: string;
  level: string;
  lord: string;
  parentLord: string | null;
  startDate: Date;
  endDate: Date;
  path: string;
  details: Prisma.InputJsonValue;
}> {
  return periods.flatMap((period) => {
    const currentPath = [...path, period.lord];
    return [
      {
        system: "Vimshottari",
        level: period.level,
        lord: period.lord,
        parentLord: period.parentLord ?? null,
        startDate: new Date(period.start),
        endDate: new Date(period.end),
        path: currentPath.join("/"),
        details: asJson({ durationDays: period.durationDays }),
      },
      ...flattenDashas(period.subPeriods ?? [], currentPath),
    ];
  });
}

async function updateJob(
  jobId: string,
  actor: Actor,
  patch: Partial<JobState>,
) {
  const now = new Date().toISOString();
  if (actor.demo || !prisma) {
    const current = demoJobs.get(jobId);
    if (!current) throw new Error("Generation job not found.");
    demoJobs.set(jobId, { ...current, ...patch, updatedAt: now });
    await sleep(220);
    return;
  }
  await prisma.generationJob.update({
    where: { id: jobId, userId: actor.id },
    data: {
      status: patch.status,
      progress: patch.progress,
      currentStep: patch.currentStep,
      errorMessage: patch.error,
      ...(patch.status === "CALCULATING"
        ? { startedAt: new Date() }
        : {}),
      ...(patch.status === "COMPLETED" || patch.status === "FAILED"
        ? { completedAt: new Date() }
        : {}),
    },
  });
}

async function persistReport(
  actor: Actor,
  chart: CalculatedChart,
  request: ReportRequest,
  interpretation: ReportArtifact["interpretation"],
) {
  if (actor.demo || !prisma) {
    const id = `demo-${randomUUID()}`;
    demoReports.set(id, {
      id,
      userId: actor.id,
      chart,
      request,
      interpretation,
      createdAt: new Date().toISOString(),
    });
    return id;
  }

  const checksum = createHash("sha256")
    .update(JSON.stringify(chart))
    .digest("hex");

  const profile = await prisma.birthProfile.create({
    data: {
      userId: actor.id,
      name: chart.input.name,
      dateOfBirth: new Date(`${chart.input.dateOfBirth}T00:00:00.000Z`),
      timeOfBirth: chart.input.timeOfBirth,
      place: chart.input.place,
      country: chart.input.country,
      latitude: chart.input.latitude,
      longitude: chart.input.longitude,
      timezone: chart.input.timezone,
      timeAccuracy: chart.input.timeAccuracy.toUpperCase() as
        | "EXACT"
        | "APPROXIMATE"
        | "UNKNOWN",
    },
  });

  const kundliChart = await prisma.kundliChart.create({
    data: {
      birthProfileId: profile.id,
      engine: chart.methodology.engine,
      engineVersion: chart.methodology.engineVersion,
      ayanamsa: chart.methodology.ayanamsa,
      houseSystem: chart.methodology.houseSystem,
      nodeType: chart.methodology.nodeType,
      julianDayUt: chart.julianDayUt,
      calculatedData: asJson(chart),
      checksum,
      planetaryPositions: {
        create: chart.planets.map((planet) => ({
          planet: planet.name,
          tropicalLongitude: planet.tropicalLongitude,
          siderealLongitude: planet.siderealLongitude,
          latitude: planet.latitude,
          speed: planet.speed,
          sign: planet.sign,
          degreeInSign: planet.degreeInSign,
          house: planet.house,
          nakshatra: planet.nakshatra.name,
          pada: planet.nakshatra.pada,
          retrograde: planet.retrograde,
          combust: planet.combust,
          dignity: planet.dignity,
          strengthScore: planet.strength.score,
          details: asJson(planet),
        })),
      },
      houses: {
        create: chart.houses.map((house) => ({
          number: house.number,
          sign: house.sign,
          lord: house.lord,
          cuspSidereal: house.cuspSidereal,
          strengthScore: house.strength.score,
          details: asJson(house),
        })),
      },
      divisionalCharts: {
        create: chart.divisionalCharts.map((varga) => ({
          code: varga.code,
          name: varga.name,
          division: varga.division,
          purpose: varga.purpose,
          reliability: varga.reliability,
          available: varga.available,
          ruleSet: varga.ruleSet,
          placements: asJson({
            ascendant: varga.ascendant,
            placements: varga.placements,
            unavailableReason: varga.unavailableReason,
          }),
        })),
      },
      dashas: {
        create: flattenDashas(chart.dashas.periods),
      },
      transits: {
        create: (chart.transits?.ingresses ?? []).map((transit) => ({
          planet: transit.planet,
          eventType: "SIGN_INGRESS",
          eventDate: new Date(transit.at),
          fromSign: transit.fromSign,
          toSign: transit.toSign,
          retrograde: transit.retrograde,
          details: asJson(transit),
        })),
      },
      yogas: {
        create: chart.yogas.map((yoga) => ({
          ruleId: yoga.id,
          name: yoga.name,
          detected: yoga.detected,
          status: yoga.status,
          basis: asJson(yoga.basis),
          rule: yoga.rule,
          caveat: yoga.caveat,
        })),
      },
      doshas: {
        create: chart.doshas.map((dosha) => ({
          ruleId: dosha.id,
          name: dosha.name,
          detected: dosha.detected,
          status: dosha.status,
          severity: dosha.severity,
          basis: asJson(dosha.basis),
          rule: dosha.rule,
          caveat: dosha.caveat,
        })),
      },
    },
  });

  const report = await prisma.report.create({
    data: {
      userId: actor.id,
      chartId: kundliChart.id,
      status: "READY",
      type: request.type.toUpperCase() as "BASIC" | "DETAILED" | "PREMIUM",
      language: request.language,
      selectedSections: request.sections,
      rangeStart: new Date(`${request.startDate}T00:00:00.000Z`),
      rangeEnd: new Date(`${request.endDate}T23:59:59.999Z`),
      title: `${chart.input.name} — AI Vedic Astrology Report`,
      summary: interpretation.summary,
      interpretation: asJson(interpretation),
      sections: {
        create: Object.entries(interpretation.sections).map(
          ([key, value], index) => ({
            key,
            title: value.headline,
            sortOrder: index,
            content: asJson(value),
            model: process.env.GEMINI_MODEL ?? "stub",
          }),
        ),
      },
    },
  });

  return report.id;
}

export async function createGenerationJob(
  actor: Actor,
  payload: GenerationPayload,
) {
  if (actor.demo || !prisma) {
    const id = `job-${randomUUID()}`;
    const now = new Date().toISOString();
    demoJobs.set(id, {
      id,
      userId: actor.id,
      status: "QUEUED",
      progress: 2,
      currentStep: "Queued securely",
      payload,
      reportId: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }

  const job = await prisma.generationJob.create({
    data: {
      userId: actor.id,
      status: "QUEUED",
      progress: 2,
      currentStep: "Queued securely",
      payload: asJson(payload),
    },
  });
  return job.id;
}

export async function runGenerationJob(
  jobId: string,
  actor: Actor,
  payload: GenerationPayload,
) {
  const started = Date.now();
  try {
    await updateJob(jobId, actor, {
      status: "CALCULATING",
      progress: 14,
      currentStep: "Calculating sidereal birth chart",
    });
    const chart = await getAstrologyEngine().calculateNatal(payload.birth);

    await updateJob(jobId, actor, {
      status: "CALCULATING",
      progress: 36,
      currentStep: "Validating divisional charts, dashas, yogas and doshas",
    });

    await updateJob(jobId, actor, {
      status: "CALCULATING",
      progress: 51,
      currentStep: "Calculating actual planetary transits",
    });
    chart.transits = await getAstrologyEngine().calculateTransits(
      chart,
      payload.report.startDate,
      payload.report.endDate,
    );

    await updateJob(jobId, actor, {
      status: "ANALYZING",
      progress: 70,
      currentStep: "Generating grounded Gemini interpretation",
    });
    const interpretation = await getAIProvider().interpretReport(
      chart,
      payload.report,
    );

    await updateJob(jobId, actor, {
      status: "GENERATING_REPORT",
      progress: 88,
      currentStep: "Assembling interactive report",
    });
    const reportId = await persistReport(
      actor,
      chart,
      payload.report,
      interpretation,
    );

    if (!actor.demo && prisma) {
      await prisma.generationJob.update({
        where: { id: jobId, userId: actor.id },
        data: {
          reportId,
          result: asJson({ reportId }),
        },
      });
      await prisma.usageEvent.create({
        data: {
          userId: actor.id,
          kind: "REPORT_GENERATION",
          durationMs: Date.now() - started,
          success: true,
          metadata: asJson({ reportType: payload.report.type }),
        },
      });
    }

    await updateJob(jobId, actor, {
      status: "COMPLETED",
      progress: 100,
      currentStep: "Report ready",
      reportId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Report generation failed.";
    logger.error({ jobId, userId: actor.id, error }, "generation_job_failed");
    await updateJob(jobId, actor, {
      status: "FAILED",
      progress: 100,
      currentStep: "Generation failed",
      error: message,
    });
    if (!actor.demo && prisma) {
      await prisma.usageEvent.create({
        data: {
          userId: actor.id,
          kind: "REPORT_GENERATION",
          durationMs: Date.now() - started,
          success: false,
          metadata: asJson({ errorCode: "GENERATION_FAILED" }),
        },
      });
    }
  }
}

export async function getJob(jobId: string, actor: Actor) {
  if (actor.demo || !prisma) {
    const job = demoJobs.get(jobId);
    return job?.userId === actor.id ? job : null;
  }
  const job = await prisma.generationJob.findFirst({
    where: { id: jobId, userId: actor.id },
  });
  if (!job) return null;
  const result = job.result as { reportId?: string } | null;
  return {
    id: job.id,
    userId: job.userId,
    status: job.status,
    progress: job.progress,
    currentStep: job.currentStep,
    payload: job.payload,
    reportId: job.reportId ?? result?.reportId ?? null,
    error: job.errorMessage,
    createdAt: job.queuedAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export async function loadReportArtifact(
  reportId: string,
  actor: Actor | null,
): Promise<ReportArtifact | null> {
  const demo = demoReports.get(reportId);
  if (demo) {
    if (!actor || (demo.userId !== actor.id && !reportId.startsWith("demo-"))) {
      return null;
    }
    return demo;
  }

  if (!prisma || !actor || actor.demo) return null;
  const report = await prisma.report.findFirst({
    where: { id: reportId, userId: actor.id },
    include: { chart: true },
  });
  if (!report?.interpretation) return null;
  return {
    id: report.id,
    userId: report.userId,
    chart: report.chart.calculatedData as unknown as CalculatedChart,
    request: {
      type: report.type.toLowerCase() as ReportRequest["type"],
      language: report.language as ReportRequest["language"],
      sections: report.selectedSections,
      startDate:
        report.rangeStart?.toISOString().slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
      endDate:
        report.rangeEnd?.toISOString().slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
    },
    interpretation:
      report.interpretation as unknown as ReportArtifact["interpretation"],
    createdAt: report.createdAt.toISOString(),
  };
}

export async function loadSharedReportArtifact(
  token: string,
): Promise<ReportArtifact | null> {
  if (token === "demo") return getDemoSharedArtifact();
  if (!prisma) return null;
  const report = await prisma.report.findFirst({
    where: { shareToken: token, shareEnabled: true, status: "READY" },
    include: { chart: true },
  });
  if (!report?.interpretation) return null;
  return {
    id: report.id,
    userId: report.userId,
    chart: report.chart.calculatedData as unknown as CalculatedChart,
    request: {
      type: report.type.toLowerCase() as ReportRequest["type"],
      language: report.language as ReportRequest["language"],
      sections: report.selectedSections,
      startDate:
        report.rangeStart?.toISOString().slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
      endDate:
        report.rangeEnd?.toISOString().slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
    },
    interpretation:
      report.interpretation as unknown as ReportArtifact["interpretation"],
    createdAt: report.createdAt.toISOString(),
  };
}

async function getDemoSharedArtifact() {
  const { getDemoArtifact } = await import("@/lib/demo");
  return getDemoArtifact();
}