"use client";

import {
  Check,
  Download,
  MessageCircleMore,
  Printer,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string }) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    setSharing(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/share`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to share report.");
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    } finally {
      setSharing(false);
    }
  }

  return (
    <>
      <a href="#ask" className="no-print">
        <Button variant="secondary">
          <MessageCircleMore className="size-4" />
          Ask AI
        </Button>
      </a>
      <a
        href={`/api/reports/${reportId}/pdf`}
        className="no-print inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-4 text-sm font-semibold transition hover:bg-soft"
      >
        <Download className="size-4" />
        PDF
      </a>
      <Button
        className="no-print"
        variant="secondary"
        onClick={() => window.print()}
      >
        <Printer className="size-4" />
        Print
      </Button>
      <Button
        className="no-print"
        variant="secondary"
        disabled={sharing}
        onClick={share}
      >
        {copied ? <Check className="size-4 text-positive" /> : <Share2 className="size-4" />}
        {copied ? "Link copied" : "Share"}
      </Button>
    </>
  );
}