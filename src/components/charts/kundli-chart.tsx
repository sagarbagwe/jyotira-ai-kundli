"use client";

import { Info, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLANET_GLYPHS, SIGNS } from "@/lib/astrology/constants";
import type {
  CalculatedChart,
  ChartStyle,
  DivisionalChart,
  PlanetName,
} from "@/lib/astrology/types";
import { cn, formatDegree, titleCase } from "@/lib/utils";

interface Placement {
  name: PlanetName;
  signIndex: number;
  degree: number;
  retrograde: boolean;
}

const NORTH_CENTERS = [
  [200, 83],
  [100, 56],
  [45, 104],
  [89, 200],
  [45, 296],
  [100, 345],
  [200, 318],
  [300, 345],
  [355, 296],
  [311, 200],
  [355, 104],
  [300, 56],
] as const;

function planetShort(name: PlanetName) {
  return {
    sun: "Su",
    moon: "Mo",
    mars: "Ma",
    mercury: "Me",
    jupiter: "Ju",
    venus: "Ve",
    saturn: "Sa",
    rahu: "Ra",
    ketu: "Ke",
  }[name];
}

function northChart({
  ascendantSignIndex,
  placements,
  onHouse,
  onPlanet,
}: {
  ascendantSignIndex: number;
  placements: Placement[];
  onHouse: (house: number) => void;
  onPlanet: (planet: PlanetName) => void;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      className="aspect-square w-full"
      role="img"
      aria-label="North Indian style Vedic chart"
    >
      <rect
        x="1"
        y="1"
        width="398"
        height="398"
        rx="4"
        fill="var(--surface)"
        stroke="var(--gold)"
        strokeWidth="1.6"
      />
      <path
        d="M200 1 399 200 200 399 1 200ZM1 1l199 199L399 1M1 399l199-199 199 199"
        fill="none"
        stroke="var(--border)"
        strokeWidth="1.25"
      />
      {NORTH_CENTERS.map(([x, y], index) => {
        const house = index + 1;
        const signIndex = (ascendantSignIndex + index) % 12;
        const housePlanets = placements.filter(
          (placement) => placement.signIndex === signIndex,
        );
        return (
          <g key={house}>
            <circle
              cx={x}
              cy={y}
              r="39"
              fill="transparent"
              className="outline-none hover:fill-[var(--primary-soft)]"
              role="button"
              tabIndex={0}
              aria-label={`House ${house}, ${SIGNS[signIndex].label}`}
              onClick={() => onHouse(house)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onHouse(house);
                }
              }}
            />
            <text
              x={x}
              y={y - 18}
              textAnchor="middle"
              fill="var(--ink-secondary)"
              fontSize="9"
              fontWeight="700"
            >
              H{house} · {signIndex + 1}
            </text>
            {housePlanets.slice(0, 4).map((planet, planetIndex) => (
              <text
                key={planet.name}
                x={x}
                y={y - 4 + planetIndex * 12}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="10"
                fontWeight="700"
                className="cursor-pointer hover:fill-[var(--primary)]"
                role="button"
                tabIndex={0}
                aria-label={`${titleCase(planet.name)} in house ${house}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onPlanet(planet.name);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onPlanet(planet.name);
                  }
                }}
              >
                {planetShort(planet.name)} {planet.degree.toFixed(1)}°
                {planet.retrograde ? " ℞" : ""}
              </text>
            ))}
            {housePlanets.length > 4 && (
              <text
                x={x}
                y={y + 45}
                textAnchor="middle"
                fill="var(--ink-secondary)"
                fontSize="9"
              >
                +{housePlanets.length - 4} more
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const SOUTH_SIGN_LAYOUT: Array<number | null> = [
  11, 0, 1, 2,
  10, null, null, 3,
  9, null, null, 4,
  8, 7, 6, 5,
];

function gridChart({
  style,
  ascendantSignIndex,
  placements,
  onHouse,
  onPlanet,
}: {
  style: "south" | "east";
  ascendantSignIndex: number;
  placements: Placement[];
  onHouse: (house: number) => void;
  onPlanet: (planet: PlanetName) => void;
}) {
  return (
    <div
      className={cn(
        "grid aspect-square w-full grid-cols-4 overflow-hidden rounded-[5px] border border-gold bg-line",
        style === "east" && "rotate-0",
      )}
      role="img"
      aria-label={`${titleCase(style)} Indian style Vedic chart`}
    >
      {SOUTH_SIGN_LAYOUT.map((signIndex, index) => {
        if (signIndex === null) {
          if (index === 5) {
            return (
              <div
                key={index}
                className="col-span-2 row-span-2 grid place-items-center bg-surface"
              >
                <div className="text-center">
                  <p className="font-display text-lg font-semibold">
                    {style === "south" ? "South Indian" : "East Indian"}
                  </p>
                  <p className="mt-1 text-[10px] tracking-[.12em] text-muted uppercase">
                    Rashi layout
                  </p>
                </div>
              </div>
            );
          }
          if ([6, 9, 10].includes(index)) return null;
        }
        if (signIndex === null) return null;
        const house = ((signIndex - ascendantSignIndex + 12) % 12) + 1;
        const signPlanets = placements.filter(
          (placement) => placement.signIndex === signIndex,
        );
        return (
          <button
            type="button"
            key={index}
            onClick={() => onHouse(house)}
            className={cn(
              "relative min-h-0 bg-surface p-2 text-left transition hover:bg-primary-soft",
              style === "east" &&
                [0, 3, 12, 15].includes(index) &&
                "bg-[linear-gradient(135deg,var(--surface)_49%,var(--border)_50%,var(--surface)_51%)]",
            )}
            aria-label={`House ${house}, ${SIGNS[signIndex].label}`}
          >
            <span className="flex items-center justify-between text-[9px] font-bold text-muted">
              <span>{SIGNS[signIndex].glyph}</span>
              <span>H{house}</span>
            </span>
            <span className="mt-1 block text-[9px] font-semibold">
              {SIGNS[signIndex].label}
            </span>
            <span className="mt-1 flex flex-wrap gap-1">
              {signPlanets.map((planet) => (
                <span
                  key={planet.name}
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPlanet(planet.name);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation();
                      onPlanet(planet.name);
                    }
                  }}
                  className="rounded bg-soft px-1 py-0.5 text-[9px] font-bold text-foreground hover:text-primary"
                >
                  {planetShort(planet.name)}
                  {planet.retrograde ? "℞" : ""}
                </span>
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function KundliChart({
  chart,
  divisionalChart,
  className,
}: {
  chart: CalculatedChart;
  divisionalChart?: DivisionalChart;
  className?: string;
}) {
  const [style, setStyle] = useState<ChartStyle>("north");
  const [selection, setSelection] = useState<
    | { type: "planet"; name: PlanetName }
    | { type: "house"; number: number }
    | null
  >(null);

  const { ascendantSignIndex, placements } = useMemo(() => {
    if (divisionalChart?.available && divisionalChart.ascendant) {
      return {
        ascendantSignIndex: divisionalChart.ascendant.signIndex,
        placements: divisionalChart.placements
          .filter((item) => item.name !== "ascendant")
          .map((item) => ({
            name: item.name as PlanetName,
            signIndex: item.signIndex,
            degree: item.degreeInDivision,
            retrograde:
              chart.planets.find((planet) => planet.name === item.name)
                ?.retrograde ?? false,
          })),
      };
    }
    return {
      ascendantSignIndex: chart.houses[0].signIndex,
      placements: chart.planets.map((planet) => ({
        name: planet.name,
        signIndex: planet.signIndex,
        degree: planet.degreeInSign,
        retrograde: planet.retrograde,
      })),
    };
  }, [chart, divisionalChart]);

  const selectedPlanet =
    selection?.type === "planet"
      ? chart.planets.find((planet) => planet.name === selection.name)
      : null;
  const selectedHouse =
    selection?.type === "house"
      ? chart.houses.find((house) => house.number === selection.number)
      : null;
  const selectedVargaPlacement =
    selection?.type === "planet"
      ? placements.find((planet) => planet.name === selection.name)
      : null;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {divisionalChart
              ? `${divisionalChart.code} · ${divisionalChart.name}`
              : "D1 · Rashi Chart"}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Tap any planet or house for calculation details.
          </p>
        </div>
        <div
          className="inline-flex rounded-[9px] border border-line bg-soft p-1"
          aria-label="Chart style"
        >
          {(["north", "south", "east"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStyle(item)}
              aria-pressed={style === item}
              className={cn(
                "min-h-9 rounded-[7px] px-3 text-xs font-semibold transition",
                style === item
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {titleCase(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[560px]">
        {style === "north"
          ? northChart({
              ascendantSignIndex,
              placements,
              onHouse: (number) => setSelection({ type: "house", number }),
              onPlanet: (name) => setSelection({ type: "planet", name }),
            })
          : gridChart({
              style,
              ascendantSignIndex,
              placements,
              onHouse: (number) => setSelection({ type: "house", number }),
              onPlanet: (name) => setSelection({ type: "planet", name }),
            })}
      </div>

      <p className="sr-only">
        Ascendant sign: {SIGNS[ascendantSignIndex].label}.{" "}
        {placements
          .map(
            (planet) =>
              `${titleCase(planet.name)} in ${SIGNS[planet.signIndex].label} at ${planet.degree.toFixed(2)} degrees`,
          )
          .join(". ")}
      </p>

      {selection && (
        <Card className="mt-4 border-primary/20 bg-primary-soft/40 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[9px] bg-surface text-primary">
              {selectedPlanet ? (
                <span className="text-lg">
                  {PLANET_GLYPHS[selectedPlanet.name]}
                </span>
              ) : (
                <Info className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              {selectedPlanet && selectedVargaPlacement && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {titleCase(selectedPlanet.name)}
                    </h3>
                    {selectedPlanet.retrograde && (
                      <Badge tone="attention">Retrograde</Badge>
                    )}
                    {selectedPlanet.combust && (
                      <Badge tone="danger">Combust</Badge>
                    )}
                    <Badge tone="neutral">{selectedPlanet.dignity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {divisionalChart
                      ? `${divisionalChart.code}: ${SIGNS[selectedVargaPlacement.signIndex].label} ${formatDegree(selectedVargaPlacement.degree)}`
                      : `${titleCase(selectedPlanet.sign)} ${formatDegree(selectedPlanet.degreeInSign)} · house ${selectedPlanet.house} · ${selectedPlanet.nakshatra.name}, pada ${selectedPlanet.nakshatra.pada}`}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Strength screen: {selectedPlanet.strength.score}/100 (
                    {selectedPlanet.strength.label}). This is a disclosed
                    traditional heuristic, not Shadbala or a scientific measure.
                  </p>
                </>
              )}
              {selectedHouse && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      House {selectedHouse.number}
                    </h3>
                    <Badge tone="gold">
                      {titleCase(selectedHouse.sign)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    Lord {titleCase(selectedHouse.lord)} ·{" "}
                    {selectedHouse.planets.length
                      ? `planets: ${selectedHouse.planets.map(titleCase).join(", ")}`
                      : "no planets present"}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {selectedHouse.significance}. Strength screen{" "}
                    {selectedHouse.strength.score}/100; this is not Bhava Bala.
                  </p>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setSelection(null)}
              aria-label="Close details"
            >
              <X className="size-4" />
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <RotateCcw className="size-3.5" />
        Signs rotate by Lagna in North style; signs remain fixed in grid styles.
      </div>
    </div>
  );
}