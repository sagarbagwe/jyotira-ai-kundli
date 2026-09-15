import { SIGNS } from "./constants";
import { aspectDistances, signDistance } from "./core";
import type {
  HousePosition,
  PlanetName,
  PlanetPosition,
  RuleFinding,
} from "./types";
import { angularDistance, titleCase } from "@/lib/utils";

type PlanetMap = Record<PlanetName, PlanetPosition>;

function toMap(planets: PlanetPosition[]) {
  return Object.fromEntries(
    planets.map((planet) => [planet.name, planet]),
  ) as PlanetMap;
}

function sameSign(a: PlanetPosition, b: PlanetPosition) {
  return a.signIndex === b.signIndex;
}

function aspectsPlanet(a: PlanetPosition, b: PlanetPosition) {
  return aspectDistances(a.name).some(
    (distance) => signDistance(a.signIndex, b.signIndex) === distance,
  );
}

function associated(a: PlanetPosition, b: PlanetPosition) {
  return (
    sameSign(a, b) ||
    (aspectsPlanet(a, b) && aspectsPlanet(b, a))
  );
}

function yogaFinding(
  id: string,
  name: string,
  detected: boolean,
  basis: string[],
  rule: string,
  caveat: string,
  status: RuleFinding["status"] = detected ? "present" : "not-detected",
): RuleFinding {
  return {
    id,
    name,
    detected,
    status,
    category: "yoga",
    basis,
    rule,
    tradition: "Configured Parashari-style rule subset",
    caveat,
  };
}

export function detectYogas(
  planets: PlanetPosition[],
  houses: HousePosition[],
): RuleFinding[] {
  const p = toMap(planets);
  const findings: RuleFinding[] = [];
  const moonToJupiter = signDistance(p.moon.signIndex, p.jupiter.signIndex);

  findings.push(
    yogaFinding(
      "gaja-kesari",
      "Gaja Kesari Yoga",
      [1, 4, 7, 10].includes(moonToJupiter),
      [
        `Moon: ${titleCase(p.moon.sign)}`,
        `Jupiter: ${titleCase(p.jupiter.sign)}`,
        `Jupiter is ${moonToJupiter} sign(s) from Moon`,
      ],
      "Jupiter occupies a kendra (1st, 4th, 7th or 10th) from the Moon.",
      "Classical texts and practitioners add strength, affliction and dignity qualifications. Detection does not imply a guaranteed outcome.",
    ),
  );

  findings.push(
    yogaFinding(
      "budha-aditya",
      "Budha–Aditya Yoga",
      sameSign(p.sun, p.mercury),
      [`Sun: ${titleCase(p.sun.sign)}`, `Mercury: ${titleCase(p.mercury.sign)}`],
      "Sun and Mercury occupy the same sidereal sign.",
      "Combustion, degree separation, house and sign dignity materially modify traditional interpretation.",
    ),
  );

  findings.push(
    yogaFinding(
      "chandra-mangala",
      "Chandra–Mangala Yoga",
      sameSign(p.moon, p.mars) || signDistance(p.moon.signIndex, p.mars.signIndex) === 7,
      [`Moon: ${titleCase(p.moon.sign)}`, `Mars: ${titleCase(p.mars.sign)}`],
      "Moon and Mars are conjunct by sign or mutually opposed.",
      "This is a broad deterministic screen. Degree, dignity and benefic influence should be considered before interpretation.",
    ),
  );

  const mahapurusha: Array<[PlanetName, string]> = [
    ["mars", "Ruchaka"],
    ["mercury", "Bhadra"],
    ["jupiter", "Hamsa"],
    ["venus", "Malavya"],
    ["saturn", "Shasha"],
  ];

  for (const [planetName, yogaName] of mahapurusha) {
    const planet = p[planetName];
    const dignityQualified = ["own-sign", "moolatrikona", "exalted"].includes(
      planet.dignity,
    );
    const kendra = [1, 4, 7, 10].includes(planet.house);
    findings.push(
      yogaFinding(
        `mahapurusha-${planetName}`,
        `${yogaName} Mahapurusha Yoga`,
        dignityQualified && kendra,
        [
          `${titleCase(planetName)}: ${titleCase(planet.sign)}, house ${planet.house}`,
          `Dignity: ${planet.dignity}`,
        ],
        `${titleCase(planetName)} is in a kendra from Lagna and in own, moolatrikona or exaltation sign.`,
        "Traditional strength depends on exact dignity, combustion, aspects and the wider chart.",
      ),
    );
  }

  const ninthLord = houses[8].lord;
  const tenthLord = houses[9].lord;
  const dharmaKarmaDetected =
    ninthLord === tenthLord || associated(p[ninthLord], p[tenthLord]);
  findings.push(
    yogaFinding(
      "dharma-karmadhipati",
      "Dharma–Karmadhipati Yoga",
      dharmaKarmaDetected,
      [
        `9th lord: ${titleCase(ninthLord)}`,
        `10th lord: ${titleCase(tenthLord)}`,
        ninthLord === tenthLord
          ? "One planet rules both houses"
          : `Association: ${associated(p[ninthLord], p[tenthLord]) ? "detected" : "not detected"}`,
      ],
      "The lords of the 9th and 10th are the same planet or form a conjunction/mutual graha-drishti association.",
      "Association definitions vary by school. This engine uses sign conjunction and mutual Parashari graha drishti.",
    ),
  );

  const kendraLords = new Set([1, 4, 7, 10].map((house) => houses[house - 1].lord));
  const trikonaLords = new Set([1, 5, 9].map((house) => houses[house - 1].lord));
  const rajaPairs: string[] = [];
  for (const kendraLord of kendraLords) {
    for (const trikonaLord of trikonaLords) {
      if (
        kendraLord === trikonaLord ||
        associated(p[kendraLord], p[trikonaLord])
      ) {
        rajaPairs.push(`${titleCase(kendraLord)}–${titleCase(trikonaLord)}`);
      }
    }
  }
  findings.push(
    yogaFinding(
      "raja-yoga-screen",
      "Kendra–Trikona Raja Yoga",
      rajaPairs.length > 0,
      rajaPairs.length
        ? rajaPairs.map((pair) => `Qualified lord association: ${pair}`)
        : ["No qualifying kendra–trikona lord association in the supported rule subset"],
      "A kendra lord and a trikona lord are identical, conjunct by sign, or mutually aspect one another.",
      "“Raj Yoga” is a family of combinations, not one universal rule. This finding reports only the implemented subset and is not a promise of status or power.",
    ),
  );

  const wealthHouses = [2, 5, 9, 11];
  const wealthLords = wealthHouses.map((house) => houses[house - 1].lord);
  const dhanaPairs = new Set<string>();
  for (let i = 0; i < wealthLords.length; i += 1) {
    for (let j = i + 1; j < wealthLords.length; j += 1) {
      const first = wealthLords[i];
      const second = wealthLords[j];
      if (first !== second && associated(p[first], p[second])) {
        dhanaPairs.add(`${titleCase(first)}–${titleCase(second)}`);
      }
    }
  }
  findings.push(
    yogaFinding(
      "dhana-yoga-screen",
      "Dhana Yoga",
      dhanaPairs.size > 0,
      dhanaPairs.size
        ? [...dhanaPairs].map((pair) => `Wealth-lord association: ${pair}`)
        : ["No supported association among lords of houses 2, 5, 9 and 11"],
      "Two distinct lords among the 2nd, 5th, 9th and 11th form a conjunction or mutual graha-drishti association.",
      "Financial outcomes cannot be guaranteed. Classical judgment also weighs strength, divisional charts, dashas and transits.",
    ),
  );

  const debilitated = planets.filter((planet) => planet.dignity === "debilitated");
  const cancellations = debilitated.filter((planet) => {
    const dispositor = SIGNS[planet.signIndex].lord;
    const lord = p[dispositor];
    const fromLagna = lord.house;
    const fromMoon = signDistance(p.moon.signIndex, lord.signIndex);
    return [1, 4, 7, 10].includes(fromLagna) || [1, 4, 7, 10].includes(fromMoon);
  });
  findings.push(
    yogaFinding(
      "neecha-bhanga-screen",
      "Neecha Bhanga",
      cancellations.length > 0,
      cancellations.length
        ? cancellations.map(
            (planet) =>
              `${titleCase(planet.name)} is debilitated in ${titleCase(planet.sign)}; its sign lord is in a kendra from Lagna or Moon.`,
          )
        : debilitated.length
          ? debilitated.map(
              (planet) =>
                `${titleCase(planet.name)} is debilitated, but the implemented cancellation condition was not met.`,
            )
          : ["No classical planet is in its configured debilitation sign"],
      "Implemented subset: the lord of a debilitated planet's sign is in a kendra from Lagna or Moon.",
      "Neecha-bhanga has several classical conditions. This engine intentionally does not infer unimplemented variants.",
    ),
  );

  const dusthanaLords = [6, 8, 12].map((house) => houses[house - 1].lord);
  const vipareeta = dusthanaLords.filter((lord) =>
    [6, 8, 12].includes(p[lord].house),
  );
  findings.push(
    yogaFinding(
      "vipareeta-raja-screen",
      "Vipareeta Raja Yoga",
      vipareeta.length > 0,
      vipareeta.length
        ? vipareeta.map(
            (lord) =>
              `${titleCase(lord)}, a 6th/8th/12th lord, occupies house ${p[lord].house}.`,
          )
        : ["No 6th/8th/12th lord occupies a dusthana in the supported screen"],
      "A lord of the 6th, 8th or 12th occupies the 6th, 8th or 12th.",
      "This broad screen does not by itself establish a beneficial reversal; ownership, conjunctions and strength must be judged.",
    ),
  );

  return findings;
}

function doshaFinding(
  id: string,
  name: string,
  detected: boolean,
  basis: string[],
  rule: string,
  caveat: string,
  severity?: RuleFinding["severity"],
  status: RuleFinding["status"] = detected ? "present" : "not-detected",
): RuleFinding {
  return {
    id,
    name,
    detected,
    status,
    category: "dosha",
    basis,
    rule,
    tradition: "Traditional screening rule; definitions vary by lineage",
    caveat,
    severity,
  };
}

export function detectDoshas(planets: PlanetPosition[]): RuleFinding[] {
  const p = toMap(planets);
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const fromLagna = p.mars.house;
  const fromMoon = signDistance(p.moon.signIndex, p.mars.signIndex);
  const fromVenus = signDistance(p.venus.signIndex, p.mars.signIndex);
  const manglikReferences = [
    ["Lagna", fromLagna],
    ["Moon", fromMoon],
    ["Venus", fromVenus],
  ] as const;
  const manglikMatches = manglikReferences.filter(([, house]) =>
    manglikHouses.includes(house),
  );
  const manglikSeverity: RuleFinding["severity"] =
    manglikMatches.length >= 3
      ? "high"
      : manglikMatches.length === 2
        ? "moderate"
        : "low";

  const rahu = p.rahu.siderealLongitude;
  const classical = [
    p.sun,
    p.moon,
    p.mars,
    p.mercury,
    p.jupiter,
    p.venus,
    p.saturn,
  ];
  const nodeArc = classical.map(
    (planet) => (planet.siderealLongitude - rahu + 360) % 360,
  );
  const allOnRahuKetuHalf = nodeArc.every((arc) => arc <= 180.0001);
  const allOnKetuRahuHalf = nodeArc.every((arc) => arc >= 179.9999);
  const kaalSarp = allOnRahuKetuHalf || allOnKetuRahuHalf;

  const sunNodeSeparation = Math.min(
    angularDistance(p.sun.siderealLongitude, p.rahu.siderealLongitude),
    angularDistance(p.sun.siderealLongitude, p.ketu.siderealLongitude),
  );
  const moonNodeSeparation = Math.min(
    angularDistance(p.moon.siderealLongitude, p.rahu.siderealLongitude),
    angularDistance(p.moon.siderealLongitude, p.ketu.siderealLongitude),
  );
  const grahanBodies = [
    ...(sunNodeSeparation <= 8 ? ["Sun"] : []),
    ...(moonNodeSeparation <= 8 ? ["Moon"] : []),
  ];

  const ninthSignIndex = (planets[0].signIndex - p.sun.house + 9 + 12) % 12;
  const ninthLord = SIGNS[ninthSignIndex].lord;
  const pitruIndicators = [
    ...(sunNodeSeparation <= 8 ? ["Sun is within 8° of the nodal axis"] : []),
    ...([9].includes(p.rahu.house) || [9].includes(p.ketu.house)
      ? ["Rahu or Ketu occupies the 9th whole-sign house"]
      : []),
    ...(sameSign(p[ninthLord], p.rahu) || sameSign(p[ninthLord], p.ketu)
      ? [`9th lord ${titleCase(ninthLord)} is conjunct a node by sign`]
      : []),
  ];

  const shrapit = sameSign(p.saturn, p.rahu);

  return [
    doshaFinding(
      "manglik",
      "Manglik / Mangal Dosha",
      manglikMatches.length > 0,
      manglikReferences.map(
        ([reference, house]) =>
          `Mars is ${house}${house === 1 ? "st" : house === 2 ? "nd" : "th"} from ${reference}${manglikHouses.includes(house) ? " (screen matches)" : ""}.`,
      ),
      "Mars in houses 1, 2, 4, 7, 8 or 12 from Lagna, Moon or Venus.",
      "This is a non-fear-based screening result. Cancellation rules, partner comparison and cultural practice vary; it does not predict divorce or harm.",
      manglikSeverity,
    ),
    doshaFinding(
      "kaal-sarp",
      "Kaal Sarp-related Combination",
      kaalSarp,
      [
        kaalSarp
          ? "All seven classical planets fall on one semicircle bounded by Rahu and Ketu."
          : "At least one classical planet lies on each side of the nodal axis.",
      ],
      "All seven classical planets are contained within one 180° nodal hemisphere, with a small numerical boundary tolerance.",
      "Kaal Sarp definitions and significance are highly tradition-dependent and disputed among practitioners. This status should never be used for fear-based claims.",
      kaalSarp ? "moderate" : "low",
      kaalSarp ? "tradition-dependent" : "not-detected",
    ),
    doshaFinding(
      "pitru-indicators",
      "Pitru Dosha-related Indicators",
      pitruIndicators.length > 0,
      pitruIndicators.length
        ? pitruIndicators
        : ["No implemented Sun/node/9th-house indicator was detected"],
      "Supported screen: Sun close to a node, node in the 9th, or 9th lord conjunct a node by sign.",
      "This is not a factual statement about ancestors and does not imply punishment, illness or misfortune. Definitions vary widely.",
      pitruIndicators.length >= 2 ? "moderate" : "low",
      pitruIndicators.length ? "tradition-dependent" : "not-detected",
    ),
    doshaFinding(
      "grahan",
      "Grahan Yoga",
      grahanBodies.length > 0,
      grahanBodies.length
        ? grahanBodies.map(
            (body) =>
              `${body} is within 8° of Rahu or Ketu (${body === "Sun" ? sunNodeSeparation : moonNodeSeparation}°).`,
          )
        : ["Neither Sun nor Moon is within the configured 8° nodal orb"],
      "Sun or Moon lies within 8° longitude of Rahu or Ketu.",
      "An eclipse-related traditional configuration is not a medical or life-outcome diagnosis.",
      grahanBodies.length > 1 ? "high" : "moderate",
    ),
    doshaFinding(
      "shrapit",
      "Shrapit-related Combination",
      shrapit,
      [
        shrapit
          ? `Saturn and Rahu both occupy ${titleCase(p.saturn.sign)}.`
          : "Saturn and Rahu do not occupy the same sidereal sign.",
      ],
      "Saturn and Rahu are conjunct by sidereal sign.",
      "This modern/tradition-dependent label must not be interpreted literally as a curse or used to create fear.",
      shrapit ? "low" : undefined,
      shrapit ? "tradition-dependent" : "not-detected",
    ),
  ];
}