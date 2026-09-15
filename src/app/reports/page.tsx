import { Download, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <AppShell
      title="Private session reports"
      description="Jyotira does not use a database, account, or permanent report history."
    >
      <Card className="mx-auto max-w-3xl p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
          <span className="grid size-12 place-items-center rounded-[12px] bg-primary-soft text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Nothing is stored permanently</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              A generated report remains in the current browser tab using session storage. It disappears when the session ends, so save a PDF or print it before closing the tab.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[10px] border border-line bg-soft p-4">
                <Sparkles className="size-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">Generate with Gemini</p>
                <p className="mt-1 text-xs leading-5 text-muted">Calculated chart data is interpreted without creating an account.</p>
              </div>
              <div className="rounded-[10px] border border-line bg-soft p-4">
                <Download className="size-5 text-positive" />
                <p className="mt-3 text-sm font-semibold">Save before leaving</p>
                <p className="mt-1 text-xs leading-5 text-muted">Use Save PDF or Print on the report screen.</p>
              </div>
            </div>
            <Link href="/new-kundli" className="mt-6 inline-flex h-11 items-center rounded-[10px] bg-primary px-5 text-sm font-semibold text-white">
              Create a new Kundli
            </Link>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
