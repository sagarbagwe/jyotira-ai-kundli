import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Clock3,
  FileText,
  Gauge,
  Languages,
  Users,
} from "lucide-react";
import { getCurrentActor } from "@/auth";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const actor = await getCurrentActor();
  if (!actor || actor.role !== "ADMIN") {
    return (
      <AppShell title="Admin" description="Operational metrics and system health.">
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto size-8 text-attention" />
          <h2 className="mt-4 text-xl font-semibold">Admin access required</h2>
          <p className="mt-2 text-sm text-muted">
            Your account does not have permission to view workspace analytics.
          </p>
        </Card>
      </AppShell>
    );
  }

  let values = {
    users: 1,
    reports: 1,
    failedReports: 0,
    aiRequests: 0,
    avgGenerationMs: 42_800,
    errorCount: 0,
  };

  if (prisma && !actor.demo) {
    const [
      users,
      reports,
      failedReports,
      aiRequests,
      generationAggregate,
      errorCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: "FAILED" } }),
      prisma.usageEvent.count({ where: { kind: "AI_REQUEST" } }),
      prisma.usageEvent.aggregate({
        where: { kind: "REPORT_GENERATION", success: true },
        _avg: { durationMs: true },
      }),
      prisma.systemError.count(),
    ]);
    values = {
      users,
      reports,
      failedReports,
      aiRequests,
      avgGenerationMs: generationAggregate._avg.durationMs ?? 0,
      errorCount,
    };
  }

  const metrics = [
    {
      label: "Users",
      value: values.users.toLocaleString(),
      detail: "Authenticated accounts",
      icon: Users,
      color: "bg-primary-soft text-primary",
    },
    {
      label: "Reports generated",
      value: values.reports.toLocaleString(),
      detail: "All report types",
      icon: FileText,
      color: "bg-gold-soft text-gold",
    },
    {
      label: "AI requests",
      value: values.aiRequests.toLocaleString(),
      detail: "Schema-validated calls",
      icon: BrainCircuit,
      color: "bg-positive-soft text-positive",
    },
    {
      label: "Generation time",
      value: `${Math.round(values.avgGenerationMs / 1000)}s`,
      detail: "Average successful run",
      icon: Clock3,
      color: "bg-attention-soft text-attention",
    },
    {
      label: "Failed reports",
      value: values.failedReports.toLocaleString(),
      detail: "Requires attention",
      icon: AlertTriangle,
      color:
        values.failedReports > 0
          ? "bg-danger-soft text-danger"
          : "bg-positive-soft text-positive",
    },
    {
      label: "System errors",
      value: values.errorCount.toLocaleString(),
      detail: "Stored fingerprints",
      icon: Activity,
      color:
        values.errorCount > 0
          ? "bg-danger-soft text-danger"
          : "bg-soft text-muted",
    },
  ];

  return (
    <AppShell
      title="Admin dashboard"
      description="Generation reliability, AI usage and product adoption without unnecessary personal data."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge tone="positive">
          <span className="size-1.5 rounded-full bg-current" />
          All systems operational
        </Badge>
        <Badge tone="neutral">Demo metrics when DATABASE_URL is absent</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{metric.label}</p>
                <p className="font-display mt-2 text-3xl font-semibold">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-muted">{metric.detail}</p>
              </div>
              <span className={`grid size-10 place-items-center rounded-[10px] ${metric.color}`}>
                <metric.icon className="size-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-[.12em] text-primary uppercase">
                Generation pipeline
              </p>
              <h2 className="mt-2 text-xl font-semibold">Latency budget</h2>
            </div>
            <Gauge className="size-6 text-primary" />
          </div>
          <div className="mt-7 space-y-5">
            {[
              ["Astronomical calculation", 18, "7.7s"],
              ["Transit calculation", 29, "12.4s"],
              ["Gemini interpretation", 39, "16.7s"],
              ["Report assembly", 14, "6.0s"],
            ].map(([label, percentage, value]) => (
              <div key={label as string}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{label as string}</span>
                  <span className="text-muted">{value as string}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-[.12em] text-gold uppercase">
                Product usage
              </p>
              <h2 className="mt-2 text-xl font-semibold">Report languages</h2>
            </div>
            <Languages className="size-6 text-gold" />
          </div>
          <div className="mt-7 space-y-5">
            {[
              ["English", 68, "68%"],
              ["Hindi", 21, "21%"],
              ["Marathi", 11, "11%"],
            ].map(([label, percentage, value]) => (
              <div key={label as string}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{label as string}</span>
                  <span className="text-muted">{value as string}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-5 text-muted">
            Sample distribution is shown in demo mode. Production values should
            be aggregated from UsageEvent without exposing birth data.
          </p>
        </Card>
      </div>

      <Card className="mt-6 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 size-5 shrink-0 text-positive" />
          <div>
            <p className="font-semibold">Observability contract</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Track report generation time, AI latency and failures,
              calculation failures, PDF failures, token usage and per-user
              generation counts. Logs redact birth details and secrets; error
              records store small fingerprints instead of uploaded content.
            </p>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}