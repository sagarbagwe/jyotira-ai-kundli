export const PLANET_NAMES = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
  "rahu",
  "ketu",
] as const;

export type PlanetName = (typeof PLANET_NAMES)[number];

export const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export type BirthTimeAccuracy = "exact" | "approximate" | "unknown";
export type ReportLanguage = "en" | "hi" | "mr";
export type Confidence = "low" | "medium" | "high";
export type ChartStyle = "north" | "south" | "east";

export interface BirthInput {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  place: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timeAccuracy: BirthTimeAccuracy;
}

export interface CalculationMethodology {
  engine: "Swiss Ephemeris";
  engineVersion: string;
  ephemeris: "Swiss Ephemeris files";
  zodiac: "sidereal";
  ayanamsa: "Lahiri / Chitrapaksha";
  houseSystem: "Whole sign";
  nodeType: "true" | "mean";
  dashaYearDays: number;
  calculatedAt: string;
  warnings: string[];
}

export interface NakshatraPosition {
  index: number;
  name: string;
  pada: 1 | 2 | 3 | 4;
  lord: PlanetName;
  deity: string;
  symbol: string;
  longitudeWithinNakshatra: number;
}

export type Dignity =
  | "exalted"
  | "debilitated"
  | "own-sign"
  | "moolatrikona"
  | "friendly"
  | "neutral"
  | "challenging";

export interface Aspect {
  from: PlanetName;
  toHouse: number;
  toPlanets: PlanetName[];
  distance: number;
  tradition: string;
}

export interface StrengthEvidence {
  score: number;
  label: "low" | "moderate" | "strong";
  method: "transparent-traditional-heuristic";
  factors: Array<{
    factor: string;
    points: number;
    detail: string;
  }>;
  caveat: string;
}

export interface PlanetPosition {
  name: PlanetName;
  glyph: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  latitude: number;
  speed: number;
  sign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  house: number;
  nakshatra: NakshatraPosition;
  retrograde: boolean;
  combust: boolean;
  combustionOrb: number | null;
  dignity: Dignity;
  lordships: number[];
  aspects: Aspect[];
  strength: StrengthEvidence;
}

export interface HousePosition {
  number: number;
  sign: ZodiacSign;
  signIndex: number;
  lord: PlanetName;
  planets: PlanetName[];
  aspectedBy: PlanetName[];
  cuspSidereal: number;
  significance: string;
  strength: StrengthEvidence;
}

export interface DivisionalPlacement {
  name: PlanetName | "ascendant";
  sign: ZodiacSign;
  signIndex: number;
  degreeInDivision: number;
}

export interface DivisionalChart {
  code: string;
  division: number;
  name: string;
  purpose: string;
  reliability: "standard" | "tradition-dependent" | "birth-time-sensitive";
  available: boolean;
  unavailableReason?: string;
  ascendant: DivisionalPlacement | null;
  placements: DivisionalPlacement[];
  ruleSet: string;
}

export interface DashaPeriod {
  level: "mahadasha" | "antardasha" | "pratyantardasha";
  lord: PlanetName;
  start: string;
  end: string;
  durationDays: number;
  parentLord?: PlanetName;
  subPeriods?: DashaPeriod[];
}

export interface VimshottariDasha {
  system: "Vimshottari";
  yearLengthDays: number;
  birthNakshatra: string;
  startingLord: PlanetName;
  balanceAtBirth: number;
  periods: DashaPeriod[];
  current: {
    mahadasha: DashaPeriod | null;
    antardasha: DashaPeriod | null;
  };
  caveat: string;
}

export interface RuleFinding {
  id: string;
  name: string;
  detected: boolean;
  status: "present" | "not-detected" | "partial" | "tradition-dependent";
  category: string;
  basis: string[];
  rule: string;
  tradition: string;
  severity?: "low" | "moderate" | "high";
  caveat: string;
}

export interface TransitPosition {
  planet: PlanetName;
  siderealLongitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  retrograde: boolean;
  natalHouse: number;
}

export interface TransitSnapshot {
  date: string;
  positions: TransitPosition[];
}

export interface TransitIngress {
  planet: PlanetName;
  fromSign: ZodiacSign;
  toSign: ZodiacSign;
  at: string;
  retrograde: boolean;
}

export interface CalculatedChart {
  version: "1.0";
  input: BirthInput;
  birthUtc: string;
  julianDayUt: number;
  ayanamsa: number;
  methodology: CalculationMethodology;
  ascendant: {
    siderealLongitude: number;
    sign: ZodiacSign;
    degreeInSign: number;
    nakshatra: NakshatraPosition;
    lord: PlanetName;
  };
  rashi: {
    moonSign: ZodiacSign;
    lord: PlanetName;
    nakshatra: NakshatraPosition;
  };
  suryaRashi: ZodiacSign;
  planets: PlanetPosition[];
  houses: HousePosition[];
  divisionalCharts: DivisionalChart[];
  dashas: VimshottariDasha;
  yogas: RuleFinding[];
  doshas: RuleFinding[];
  transits?: {
    snapshots: TransitSnapshot[];
    ingresses: TransitIngress[];
  };
  dataLabels: {
    calculations: string;
    interpretation: string;
    belief: string;
    uncertainty: string;
  };
}

export interface ReportRequest {
  type: "basic" | "detailed" | "premium";
  language: ReportLanguage;
  sections: string[];
  startDate: string;
  endDate: string;
}

export interface PredictionBasis {
  dashas: string[];
  transits: string[];
  houses: number[];
  planets: PlanetName[];
  yogas: string[];
}

export interface Prediction {
  title: string;
  text: string;
  confidence: Confidence;
  basis: PredictionBasis;
  reasoning: string;
  startDate?: string;
  endDate?: string;
}