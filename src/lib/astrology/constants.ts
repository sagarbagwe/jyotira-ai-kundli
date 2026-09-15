import type { PlanetName, ZodiacSign } from "./types";

export const SIGNS: Array<{
  key: ZodiacSign;
  label: string;
  sanskrit: string;
  glyph: string;
  lord: PlanetName;
  element: "fire" | "earth" | "air" | "water";
  modality: "movable" | "fixed" | "dual";
}> = [
  { key: "aries", label: "Aries", sanskrit: "Mesha", glyph: "♈", lord: "mars", element: "fire", modality: "movable" },
  { key: "taurus", label: "Taurus", sanskrit: "Vrishabha", glyph: "♉", lord: "venus", element: "earth", modality: "fixed" },
  { key: "gemini", label: "Gemini", sanskrit: "Mithuna", glyph: "♊", lord: "mercury", element: "air", modality: "dual" },
  { key: "cancer", label: "Cancer", sanskrit: "Karka", glyph: "♋", lord: "moon", element: "water", modality: "movable" },
  { key: "leo", label: "Leo", sanskrit: "Simha", glyph: "♌", lord: "sun", element: "fire", modality: "fixed" },
  { key: "virgo", label: "Virgo", sanskrit: "Kanya", glyph: "♍", lord: "mercury", element: "earth", modality: "dual" },
  { key: "libra", label: "Libra", sanskrit: "Tula", glyph: "♎", lord: "venus", element: "air", modality: "movable" },
  { key: "scorpio", label: "Scorpio", sanskrit: "Vrischika", glyph: "♏", lord: "mars", element: "water", modality: "fixed" },
  { key: "sagittarius", label: "Sagittarius", sanskrit: "Dhanu", glyph: "♐", lord: "jupiter", element: "fire", modality: "dual" },
  { key: "capricorn", label: "Capricorn", sanskrit: "Makara", glyph: "♑", lord: "saturn", element: "earth", modality: "movable" },
  { key: "aquarius", label: "Aquarius", sanskrit: "Kumbha", glyph: "♒", lord: "saturn", element: "air", modality: "fixed" },
  { key: "pisces", label: "Pisces", sanskrit: "Meena", glyph: "♓", lord: "jupiter", element: "water", modality: "dual" },
];

export const PLANET_GLYPHS: Record<PlanetName, string> = {
  sun: "☉",
  moon: "☽",
  mars: "♂",
  mercury: "☿",
  jupiter: "♃",
  venus: "♀",
  saturn: "♄",
  rahu: "☊",
  ketu: "☋",
};

export const NAKSHATRAS: Array<{
  name: string;
  lord: PlanetName;
  deity: string;
  symbol: string;
}> = [
  { name: "Ashwini", lord: "ketu", deity: "Ashwini Kumaras", symbol: "Horse's head" },
  { name: "Bharani", lord: "venus", deity: "Yama", symbol: "Yoni / vessel" },
  { name: "Krittika", lord: "sun", deity: "Agni", symbol: "Razor / flame" },
  { name: "Rohini", lord: "moon", deity: "Prajapati", symbol: "Chariot / ox cart" },
  { name: "Mrigashira", lord: "mars", deity: "Soma", symbol: "Deer's head" },
  { name: "Ardra", lord: "rahu", deity: "Rudra", symbol: "Teardrop" },
  { name: "Punarvasu", lord: "jupiter", deity: "Aditi", symbol: "Bow and quiver" },
  { name: "Pushya", lord: "saturn", deity: "Brihaspati", symbol: "Flower / udder" },
  { name: "Ashlesha", lord: "mercury", deity: "Nagas", symbol: "Coiled serpent" },
  { name: "Magha", lord: "ketu", deity: "Pitris", symbol: "Royal throne" },
  { name: "Purva Phalguni", lord: "venus", deity: "Bhaga", symbol: "Hammock" },
  { name: "Uttara Phalguni", lord: "sun", deity: "Aryaman", symbol: "Bed legs" },
  { name: "Hasta", lord: "moon", deity: "Savitar", symbol: "Hand" },
  { name: "Chitra", lord: "mars", deity: "Tvashtar", symbol: "Bright jewel" },
  { name: "Swati", lord: "rahu", deity: "Vayu", symbol: "Young shoot" },
  { name: "Vishakha", lord: "jupiter", deity: "Indra–Agni", symbol: "Triumphal arch" },
  { name: "Anuradha", lord: "saturn", deity: "Mitra", symbol: "Lotus" },
  { name: "Jyeshtha", lord: "mercury", deity: "Indra", symbol: "Circular talisman" },
  { name: "Mula", lord: "ketu", deity: "Nirriti", symbol: "Roots" },
  { name: "Purva Ashadha", lord: "venus", deity: "Apas", symbol: "Winnowing basket" },
  { name: "Uttara Ashadha", lord: "sun", deity: "Vishvadevas", symbol: "Elephant tusk" },
  { name: "Shravana", lord: "moon", deity: "Vishnu", symbol: "Ear" },
  { name: "Dhanishta", lord: "mars", deity: "Vasus", symbol: "Drum / flute" },
  { name: "Shatabhisha", lord: "rahu", deity: "Varuna", symbol: "Empty circle" },
  { name: "Purva Bhadrapada", lord: "jupiter", deity: "Aja Ekapada", symbol: "Front funeral cot" },
  { name: "Uttara Bhadrapada", lord: "saturn", deity: "Ahir Budhnya", symbol: "Back funeral cot" },
  { name: "Revati", lord: "mercury", deity: "Pushan", symbol: "Fish / drum" },
];

export const DASHA_ORDER: PlanetName[] = [
  "ketu",
  "venus",
  "sun",
  "moon",
  "mars",
  "rahu",
  "jupiter",
  "saturn",
  "mercury",
];

export const DASHA_YEARS: Record<PlanetName, number> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
};

export const HOUSE_SIGNIFICATIONS = [
  "Personality, vitality, appearance and approach to life",
  "Wealth, speech, family, food and accumulated resources",
  "Communication, courage, skills, siblings and short journeys",
  "Home, mother, property, emotional foundations and vehicles",
  "Education, creativity, children, intelligence and counsel",
  "Work, service, competition, obstacles and general wellbeing",
  "Marriage, partnerships, contracts and public dealings",
  "Transformation, shared resources, vulnerability and longevity traditions",
  "Fortune, dharma, mentors, higher learning and long journeys",
  "Career, public responsibility, reputation and contribution",
  "Gains, networks, aspirations, communities and elder siblings",
  "Expenses, retreat, foreign connections, sleep and release",
];

export const EXALTATION: Partial<Record<PlanetName, ZodiacSign>> = {
  sun: "aries",
  moon: "taurus",
  mars: "capricorn",
  mercury: "virgo",
  jupiter: "cancer",
  venus: "pisces",
  saturn: "libra",
};

export const DEBILITATION: Partial<Record<PlanetName, ZodiacSign>> = {
  sun: "libra",
  moon: "scorpio",
  mars: "cancer",
  mercury: "pisces",
  jupiter: "capricorn",
  venus: "virgo",
  saturn: "aries",
};

export const OWN_SIGNS: Partial<Record<PlanetName, ZodiacSign[]>> = {
  sun: ["leo"],
  moon: ["cancer"],
  mars: ["aries", "scorpio"],
  mercury: ["gemini", "virgo"],
  jupiter: ["sagittarius", "pisces"],
  venus: ["taurus", "libra"],
  saturn: ["capricorn", "aquarius"],
};

export const MOOLATRIKONA: Partial<Record<PlanetName, ZodiacSign>> = {
  sun: "leo",
  moon: "taurus",
  mars: "aries",
  mercury: "virgo",
  jupiter: "sagittarius",
  venus: "libra",
  saturn: "aquarius",
};

export const COMBUSTION_ORBS: Partial<Record<PlanetName, number>> = {
  moon: 12,
  mars: 17,
  mercury: 14,
  jupiter: 11,
  venus: 10,
  saturn: 15,
};

export const BENEFICS: PlanetName[] = ["jupiter", "venus", "mercury", "moon"];
export const MALEFICS: PlanetName[] = ["saturn", "mars", "rahu", "ketu", "sun"];

export const VARGA_META: Record<
  number,
  { code: string; name: string; purpose: string; reliability: "standard" | "tradition-dependent" | "birth-time-sensitive" }
> = {
  1: { code: "D1", name: "Rashi", purpose: "Main birth chart", reliability: "standard" },
  2: { code: "D2", name: "Hora", purpose: "Traditional wealth themes", reliability: "tradition-dependent" },
  3: { code: "D3", name: "Drekkana", purpose: "Siblings and courage", reliability: "standard" },
  4: { code: "D4", name: "Chaturthamsa", purpose: "Property and home matters", reliability: "standard" },
  7: { code: "D7", name: "Saptamsa", purpose: "Children and lineage", reliability: "birth-time-sensitive" },
  9: { code: "D9", name: "Navamsa", purpose: "Marriage, dharma and deeper strength", reliability: "birth-time-sensitive" },
  10: { code: "D10", name: "Dashamsa", purpose: "Career and professional life", reliability: "birth-time-sensitive" },
  12: { code: "D12", name: "Dwadashamsa", purpose: "Parents and ancestry", reliability: "birth-time-sensitive" },
  16: { code: "D16", name: "Shodasamsa", purpose: "Vehicles and comforts", reliability: "birth-time-sensitive" },
  20: { code: "D20", name: "Vimsamsa", purpose: "Spiritual practice", reliability: "birth-time-sensitive" },
  24: { code: "D24", name: "Chaturvimsamsa", purpose: "Education and learning", reliability: "birth-time-sensitive" },
  30: { code: "D30", name: "Trimsamsa", purpose: "Challenges and vulnerabilities", reliability: "tradition-dependent" },
  60: { code: "D60", name: "Shashtiamsa", purpose: "Advanced traditional analysis", reliability: "birth-time-sensitive" },
};