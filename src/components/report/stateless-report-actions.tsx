"use client";

import { Download, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STATELESS_REPORT_KEY } from "@/lib/stateless-report";

export function StatelessReportActions() {
  function clearReport() {
    window.sessionStorage.removeItem(STATELESS_REPORT_KEY);
  }

  return (
    <>
      <Button variant="secondary" onClick={() => window.print()}>
        <Download className="size-4" /> Save PDF
      </Button>
      <Button variant="secondary" onClick={() => window.print()}>
        <Printer className="size-4" /> Print
      </Button>
      <Link
        href="/new-kundli"
        onClick={clearReport}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95"
      >
        <Plus className="size-4" /> New Kundli
      </Link>
    </>
  );
}
