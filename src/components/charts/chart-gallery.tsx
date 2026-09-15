"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { CalculatedChart } from "@/lib/astrology/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KundliChart } from "./kundli-chart";
import { cn } from "@/lib/utils";

export function ChartGallery({ chart }: { chart: CalculatedChart }) {
  const [selected, setSelected] = useState("D1");
  const varga =
    selected === "D1"
      ? undefined
      : chart.divisionalCharts.find((item) => item.code === selected);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {chart.divisionalCharts.map((item) => (
          <button
            type="button"
            key={item.code}
            disabled={!item.available}
            onClick={() => setSelected(item.code)}
            className={cn(
              "flex min-h-[82px] items-center gap-3 rounded-[11px] border p-4 text-left transition",
              selected === item.code
                ? "border-primary bg-primary-soft/55"
                : "border-line bg-surface hover:bg-soft",
              !item.available && "cursor-not-allowed opacity-45",
            )}
          >
            <span
              className={cn(
                "font-display grid size-11 shrink-0 place-items-center rounded-[10px] text-lg font-semibold",
                item.available
                  ? "bg-gold-soft text-gold"
                  : "bg-soft text-muted",
              )}
            >
              {item.code}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{item.name}</span>
              <span className="mt-1 block truncate text-xs text-muted">
                {item.purpose}
              </span>
            </span>
          </button>
        ))}
      </div>

      <Card className="h-fit p-5 sm:p-7 xl:sticky xl:top-24">
        {selected === "D1" || varga?.available ? (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge tone="positive">
                <CheckCircle2 className="size-3.5" />
                Calculated
              </Badge>
              <Badge tone="neutral">
                {varga?.reliability ?? "standard"}
              </Badge>
              <Badge tone="neutral">
                {varga?.ruleSet ?? "Sidereal Rashi / whole sign"}
              </Badge>
            </div>
            <KundliChart chart={chart} divisionalChart={varga} />
          </>
        ) : (
          <div className="grid min-h-[520px] place-items-center text-center">
            <div className="max-w-sm">
              <AlertTriangle className="mx-auto size-8 text-attention" />
              <h2 className="mt-4 text-lg font-semibold">Chart hidden</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {varga?.unavailableReason}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}