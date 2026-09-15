import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { getCurrentActor } from "@/auth";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Reports" };

export default async function ReportsPage() {
  const actor = await getCurrentActor();
  const reports =
    prisma && actor && !actor.demo
      ? await prisma.report.findMany({
          where: { userId: actor.id },
          include: { chart: { include: { birthProfile: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
      : [];

  return (
    <AppShell
      title="My reports"
      description="Private interactive reports and downloadable PDFs."
      actions={
        <Link href="/new-kundli" className={buttonStyles()}>
          <Plus className="size-4" />
          New report
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total reports", reports.length || 1, "All time"],
          ["Ready", reports.filter((report) => report.status === "READY").length || 1, "Available now"],
          ["Languages", new Set(reports.map((report) => report.language)).size || 1, "English active"],
        ].map(([label, value, detail]) => (
          <Card key={label as string} className="p-5">
            <p className="text-sm text-muted">{label as string}</p>
            <p className="font-display mt-2 text-3xl font-semibold">{value as number}</p>
            <p className="mt-1 text-xs text-muted">{detail as string}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Report history</h2>
            <p className="mt-1 text-sm text-muted">
              Access is authenticated; shared links are opt-in.
            </p>
          </div>
          <BookOpenText className="size-5 text-primary" />
        </div>

        <div className="divide-y divide-line">
          <Link
            href="/reports/demo"
            className="group grid gap-4 p-5 transition hover:bg-soft sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6"
          >
            <span className="grid size-12 place-items-center rounded-[11px] bg-primary-soft text-primary">
              <FileText className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">Aarav Sharma — AI Vedic Astrology Report</p>
                <Badge tone="positive">Ready</Badge>
                <Badge tone="gold">Premium</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span>Sample profile</span>
                <span>English</span>
                <span>Sep 2026 – Dec 2027</span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary">
              Open report
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>

          {reports.map((report) => (
            <div
              key={report.id}
              className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6"
            >
              <span className="grid size-12 place-items-center rounded-[11px] bg-gold-soft text-gold">
                <FileText className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/reports/${report.id}`} className="font-semibold hover:text-primary">
                    {report.title}
                  </Link>
                  <Badge tone={report.status === "READY" ? "positive" : "attention"}>
                    {report.status}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {formatDate(report.createdAt)}
                  </span>
                  <span>{report.language.toUpperCase()}</span>
                  <span>{report.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`/api/reports/${report.id}/pdf`}
                  className="grid size-10 place-items-center rounded-[9px] text-muted transition hover:bg-soft hover:text-foreground"
                  aria-label="Download PDF"
                >
                  <Download className="size-4" />
                </a>
                <button
                  className="grid size-10 place-items-center rounded-[9px] text-muted transition hover:bg-soft hover:text-foreground"
                  aria-label="More report actions"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}