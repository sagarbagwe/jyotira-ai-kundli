"use client";

import { useMemo, useState } from "react";
import type { VimshottariDasha } from "@/lib/astrology/types";
import { PLANET_GLYPHS } from "@/lib/astrology/constants";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatDate, titleCase } from "@/lib/utils";

const colors: Record<string, string> = {
  sun: "bg-[#e5a654]",
  moon: "bg-[#8aa8c6]",
  mars: "bg-[#d66f66]",
  mercury: "bg-[#62a783]",
  jupiter: "bg-[#bd9455]",
  venus: "bg-[#ad88bd]",
  saturn: "bg-[#667080]",
  rahu: "bg-[#5d5b70]",
  ketu: "bg-[#a97d62]",
};

export function DashaTimeline({ dasha }: { dasha: VimshottariDasha }) {
  const currentIndex = Math.max(
    0,
    dasha.periods.findIndex(
      (period) => period.lord === dasha.current.mahadasha?.lord,
    ),
  );
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);
  const selected = dasha.periods[selectedIndex];
  const referenceTime = new Date(
    dasha.current.mahadasha?.start ?? dasha.periods[0].start,
  ).getTime();

  const visiblePeriods = useMemo(
    () =>
      dasha.periods.filter(
        (period) =>
          new Date(period.end).getTime() >= referenceTime - 365 * 86_400_000,
      ),
    [dasha.periods, referenceTime],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="positive">Calculated timeline</Badge>
        <Badge tone="neutral">{dasha.yearLengthDays} days/year</Badge>
        <Badge tone="neutral">Birth nakshatra: {dasha.birthNakshatra}</Badge>
      </div>

      <div className="scrollbar-thin mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-[820px]">
          {visiblePeriods.map((period) => {
            const originalIndex = dasha.periods.indexOf(period);
            const active = originalIndex === selectedIndex;
            const width = Math.max(72, (period.durationDays / 365.2425) * 12);
            return (
              <button
                key={`${period.lord}-${period.start}`}
                type="button"
                onClick={() => setSelectedIndex(originalIndex)}
                style={{ width }}
                className={cn(
                  "group relative h-[92px] shrink-0 border-r border-background/25 px-2 text-left text-white transition first:rounded-l-[9px] last:rounded-r-[9px]",
                  colors[period.lord],
                  active ? "ring-3 ring-primary/25 ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100",
                )}
              >
                <span className="block text-lg">
                  {PLANET_GLYPHS[period.lord]}
                </span>
                <span className="mt-1 block text-xs font-bold">
                  {titleCase(period.lord)}
                </span>
                <span className="mt-1 block text-[10px] opacity-80">
                  {new Date(period.start).getUTCFullYear()}–
                  {new Date(period.end).getUTCFullYear()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="mt-5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[.12em] text-gold uppercase">
              Selected Mahadasha
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold">
              {titleCase(selected.lord)} Mahadasha
            </h3>
            <p className="mt-1 text-sm text-muted">
              {formatDate(selected.start)} – {formatDate(selected.end)}
            </p>
          </div>
          {selected.lord === dasha.current.mahadasha?.lord && (
            <Badge tone="positive">
              <span className="size-1.5 rounded-full bg-current" />
              Current
            </Badge>
          )}
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {selected.subPeriods?.map((period) => {
            const active =
              period.start === dasha.current.antardasha?.start &&
              period.lord === dasha.current.antardasha?.lord;
            return (
              <div
                key={`${period.lord}-${period.start}`}
                className={cn(
                  "rounded-[9px] border p-3",
                  active
                    ? "border-primary/30 bg-primary-soft"
                    : "border-line bg-soft",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {titleCase(period.lord)}
                  </span>
                  {active && <Badge tone="primary">Active</Badge>}
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {formatDate(period.start)} – {formatDate(period.end)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <p className="mt-4 text-xs leading-5 text-muted">
        {dasha.caveat}
      </p>
    </div>
  );
}