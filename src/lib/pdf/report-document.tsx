import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AstrologyReport } from "@/lib/ai/schemas";
import type { CalculatedChart, DivisionalChart } from "@/lib/astrology/types";
import { SIGNS } from "@/lib/astrology/constants";
import { formatDate, titleCase } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 46,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#202128",
  },
  cover: {
    padding: 54,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#f7f4ed",
  },
  brand: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#7966c7",
  },
  coverTitle: {
    marginTop: 80,
    fontFamily: "Times-Roman",
    fontSize: 40,
    lineHeight: 1.08,
    color: "#202128",
  },
  coverSubtitle: {
    marginTop: 16,
    width: 380,
    fontSize: 12,
    lineHeight: 1.6,
    color: "#666873",
  },
  coverMeta: {
    marginTop: 42,
    borderTopWidth: 1,
    borderTopColor: "#d8d3c8",
    paddingTop: 18,
  },
  coverName: {
    fontFamily: "Times-Roman",
    fontSize: 24,
  },
  coverDetail: {
    marginTop: 6,
    color: "#666873",
  },
  footer: {
    position: "absolute",
    left: 46,
    right: 46,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.7,
    borderTopColor: "#dedbd4",
    paddingTop: 8,
    fontSize: 7.5,
    color: "#777982",
  },
  label: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#7966c7",
  },
  title: {
    marginTop: 6,
    marginBottom: 18,
    fontFamily: "Times-Roman",
    fontSize: 23,
  },
  h2: {
    marginTop: 20,
    marginBottom: 8,
    fontFamily: "Times-Roman",
    fontSize: 15,
  },
  body: {
    color: "#53555e",
  },
  note: {
    marginTop: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#b77828",
    backgroundColor: "#fbf0de",
    padding: 10,
    fontSize: 8.5,
    color: "#76501f",
  },
  cardRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  card: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 0.7,
    borderColor: "#dedbd4",
    borderRadius: 5,
    padding: 10,
  },
  cardLabel: {
    fontSize: 7.5,
    color: "#777982",
  },
  cardValue: {
    marginTop: 4,
    fontFamily: "Times-Roman",
    fontSize: 13,
  },
  table: {
    borderWidth: 0.7,
    borderColor: "#d8d5ce",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0eee9",
    borderBottomWidth: 0.7,
    borderBottomColor: "#d8d5ce",
    fontSize: 7.5,
    fontWeight: 700,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e2dc",
  },
  cell: {
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  section: {
    marginBottom: 14,
  },
  split: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flexGrow: 1,
    flexBasis: 0,
  },
  chart: {
    width: 320,
    borderWidth: 0.8,
    borderColor: "#b77828",
  },
  chartRow: {
    flexDirection: "row",
  },
  chartCell: {
    width: 80,
    height: 70,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#dedbd4",
    padding: 5,
  },
  chartBlank: {
    width: 80,
    height: 70,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#dedbd4",
    backgroundColor: "#f7f4ed",
  },
  chartSign: {
    fontSize: 7.5,
    color: "#777982",
  },
  chartPlanets: {
    marginTop: 6,
    fontSize: 8.5,
    fontWeight: 700,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletMark: {
    width: 10,
    color: "#7966c7",
  },
  bulletText: {
    flex: 1,
    color: "#53555e",
  },
});

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>Jyotira · Calculated data + labeled traditional interpretation</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <Text style={styles.label}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SouthChart({
  chart,
  divisional,
}: {
  chart: CalculatedChart;
  divisional?: DivisionalChart;
}) {
  const ascendantSignIndex = divisional?.ascendant?.signIndex ?? chart.houses[0].signIndex;
  const placements = divisional
    ? divisional.placements.map((item) => ({
        name: item.name,
        signIndex: item.signIndex,
      }))
    : chart.planets.map((planet) => ({
        name: planet.name,
        signIndex: planet.signIndex,
      }));
  const layout: Array<number | null> = [
    11, 0, 1, 2,
    10, null, null, 3,
    9, null, null, 4,
    8, 7, 6, 5,
  ];

  return (
    <View style={styles.chart}>
      {[0, 1, 2, 3].map((row) => (
        <View key={row} style={styles.chartRow}>
          {layout.slice(row * 4, row * 4 + 4).map((signIndex, column) => {
            if (signIndex === null) {
              return <View key={column} style={styles.chartBlank} />;
            }
            const house = ((signIndex - ascendantSignIndex + 12) % 12) + 1;
            const planets = placements
              .filter((item) => item.signIndex === signIndex)
              .map((item) => titleCase(item.name))
              .join(", ");
            return (
              <View key={column} style={styles.chartCell}>
                <Text style={styles.chartSign}>
                  H{house} · {SIGNS[signIndex].label}
                </Text>
                <Text style={styles.chartPlanets}>{planets || "—"}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function ReportDocument({
  chart,
  interpretation,
}: {
  chart: CalculatedChart;
  interpretation: AstrologyReport;
}) {
  const d9 = chart.divisionalCharts.find((varga) => varga.code === "D9");
  const d10 = chart.divisionalCharts.find((varga) => varga.code === "D10");
  const detectedYogas = chart.yogas.filter((item) => item.detected);
  const detectedDoshas = chart.doshas.filter((item) => item.detected);

  return (
    <Document
      title={`${chart.input.name} — AI Vedic Astrology Report`}
      author="Jyotira"
      subject="Calculated Vedic astrology report with AI-assisted interpretation"
      keywords="Kundli, Vedic astrology, Jyotish, Swiss Ephemeris"
    >
      <Page size="A4" style={styles.cover}>
        <View>
          <Text style={styles.brand}>Jyotira · AI Kundli</Text>
          <Text style={styles.coverTitle}>AI Vedic{"\n"}Astrology Report</Text>
          <Text style={styles.coverSubtitle}>
            Calculated Swiss Ephemeris birth-chart data with clearly labeled,
            AI-assisted traditional interpretation.
          </Text>
          <View style={styles.coverMeta}>
            <Text style={styles.coverName}>{chart.input.name}</Text>
            <Text style={styles.coverDetail}>
              {formatDate(chart.input.dateOfBirth)} · {chart.input.timeOfBirth}
            </Text>
            <Text style={styles.coverDetail}>{chart.input.place}</Text>
          </View>
        </View>
        <View style={styles.note}>
          <Text>
            Educational and entertainment use only. Astrology is not
            scientifically established as a predictive method and is not
            professional medical, financial, legal or other expert advice.
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="AI interpretation" title="Executive summary" />
        <Text style={styles.body}>{interpretation.summary}</Text>
        <Text style={styles.h2}>Key themes</Text>
        <BulletList items={interpretation.keyThemes} />

        <Text style={styles.h2}>Birth details & methodology</Text>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Birth date</Text>
            <Text style={styles.cardValue}>{formatDate(chart.input.dateOfBirth)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Birth time</Text>
            <Text style={styles.cardValue}>{chart.input.timeOfBirth}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Accuracy</Text>
            <Text style={styles.cardValue}>{titleCase(chart.input.timeAccuracy)}</Text>
          </View>
        </View>
        <View style={styles.table}>
          {[
            ["Birth place", chart.input.place],
            ["Coordinates", `${chart.input.latitude}, ${chart.input.longitude}`],
            ["Timezone", chart.input.timezone],
            ["UTC instant", chart.birthUtc],
            ["Engine", `${chart.methodology.engine} · ${chart.methodology.engineVersion}`],
            ["Framework", `${chart.methodology.ayanamsa} · ${chart.methodology.houseSystem} · ${chart.methodology.nodeType} node`],
          ].map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={[styles.cell, { width: "27%", fontWeight: 700 }]}>{label}</Text>
              <Text style={[styles.cell, { width: "73%", color: "#53555e" }]}>{value}</Text>
            </View>
          ))}
        </View>
        {chart.methodology.warnings.map((warning) => (
          <Text key={warning} style={styles.note}>{warning}</Text>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="Calculated data" title="Lagna, Rashi & Nakshatra" />
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Lagna</Text>
            <Text style={styles.cardValue}>{titleCase(chart.ascendant.sign)}</Text>
            <Text style={styles.coverDetail}>{chart.ascendant.degreeInSign.toFixed(4)}°</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Moon sign</Text>
            <Text style={styles.cardValue}>{titleCase(chart.rashi.moonSign)}</Text>
            <Text style={styles.coverDetail}>Lord {titleCase(chart.rashi.lord)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Nakshatra</Text>
            <Text style={styles.cardValue}>{chart.rashi.nakshatra.name}</Text>
            <Text style={styles.coverDetail}>Pada {chart.rashi.nakshatra.pada}</Text>
          </View>
        </View>
        <Text style={styles.h2}>Traditional interpretation</Text>
        <Text style={styles.body}>{interpretation.sections.lagna.analysis}</Text>
        <Text style={[styles.body, { marginTop: 9 }]}>{interpretation.sections.rashi.analysis}</Text>
        <Text style={[styles.body, { marginTop: 9 }]}>{interpretation.sections.nakshatra.analysis}</Text>

        <Text style={styles.h2}>D1 Rashi chart</Text>
        <SouthChart chart={chart} />
        <Text style={styles.note}>
          House/sign/planet labels above are calculated data. Any meaning
          assigned to them elsewhere in this report is a traditional
          interpretation.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="Calculated data" title="Planetary positions" />
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {[
              ["Planet", "15%"],
              ["Sign", "17%"],
              ["Degree", "15%"],
              ["H", "6%"],
              ["Nakshatra", "20%"],
              ["Pada", "8%"],
              ["Condition", "19%"],
            ].map(([label, width]) => (
              <Text key={label} style={[styles.cell, { width }]}>{label}</Text>
            ))}
          </View>
          {chart.planets.map((planet) => (
            <View key={planet.name} style={styles.row}>
              <Text style={[styles.cell, { width: "15%", fontWeight: 700 }]}>{titleCase(planet.name)}</Text>
              <Text style={[styles.cell, { width: "17%" }]}>{titleCase(planet.sign)}</Text>
              <Text style={[styles.cell, { width: "15%" }]}>{planet.degreeInSign.toFixed(4)}°</Text>
              <Text style={[styles.cell, { width: "6%" }]}>{planet.house}</Text>
              <Text style={[styles.cell, { width: "20%" }]}>{planet.nakshatra.name}</Text>
              <Text style={[styles.cell, { width: "8%" }]}>{planet.nakshatra.pada}</Text>
              <Text style={[styles.cell, { width: "19%" }]}>
                {planet.retrograde ? "Retrograde; " : ""}
                {planet.combust ? "Combust; " : ""}
                {titleCase(planet.dignity)}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>
          “Strength” in the web report is a transparent comparison heuristic,
          not a full Shadbala calculation and not a scientific measurement.
        </Text>
      </Page>

      {(d9?.available || d10?.available) && (
        <Page size="A4" style={styles.page}>
          <Footer />
          <SectionTitle eyebrow="Calculated vargas" title="Divisional charts" />
          {d9?.available && (
            <View style={styles.section}>
              <Text style={styles.h2}>D9 · Navamsa</Text>
              <SouthChart chart={chart} divisional={d9} />
              <Text style={[styles.body, { marginTop: 8 }]}>
                {d9.purpose}. Rule set: {d9.ruleSet}.
              </Text>
            </View>
          )}
          {d10?.available && (
            <View style={styles.section}>
              <Text style={styles.h2}>D10 · Dashamsa</Text>
              <SouthChart chart={chart} divisional={d10} />
              <Text style={[styles.body, { marginTop: 8 }]}>
                {d10.purpose}. Rule set: {d10.ruleSet}.
              </Text>
            </View>
          )}
        </Page>
      )}

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="Calculated data" title="12-house analysis" />
        {chart.houses.map((house) => (
          <View key={house.number} style={[styles.card, { marginBottom: 7 }]} wrap={false}>
            <Text style={{ fontWeight: 700 }}>
              {house.number}. {titleCase(house.sign)} · Lord {titleCase(house.lord)}
            </Text>
            <Text style={[styles.body, { marginTop: 3 }]}>{house.significance}</Text>
            <Text style={[styles.body, { marginTop: 3, fontSize: 8 }]}>
              Planets: {house.planets.length ? house.planets.map(titleCase).join(", ") : "none"} ·
              Aspected by: {house.aspectedBy.length ? house.aspectedBy.map(titleCase).join(", ") : "none"} ·
              Screening score: {house.strength.score}/100
            </Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="Deterministic rules" title="Yogas & Doshas" />
        <Text style={styles.h2}>Detected yoga rules</Text>
        {detectedYogas.length ? detectedYogas.map((yoga) => (
          <View key={yoga.id} style={[styles.card, { marginBottom: 8 }]} wrap={false}>
            <Text style={{ fontWeight: 700 }}>{yoga.name}</Text>
            <Text style={[styles.body, { marginTop: 4 }]}>{yoga.rule}</Text>
            <Text style={[styles.body, { marginTop: 4, fontSize: 8 }]}>{yoga.basis.join(" · ")}</Text>
            <Text style={[styles.body, { marginTop: 4, fontSize: 8 }]}>{yoga.caveat}</Text>
          </View>
        )) : <Text style={styles.body}>No supported yoga rule matched.</Text>}

        <Text style={styles.h2}>Dosha-related screens</Text>
        {detectedDoshas.length ? detectedDoshas.map((dosha) => (
          <View key={dosha.id} style={[styles.card, { marginBottom: 8 }]} wrap={false}>
            <Text style={{ fontWeight: 700 }}>
              {dosha.name} · {dosha.status}
            </Text>
            <Text style={[styles.body, { marginTop: 4 }]}>{dosha.rule}</Text>
            <Text style={[styles.body, { marginTop: 4, fontSize: 8 }]}>{dosha.basis.join(" · ")}</Text>
            <Text style={styles.note}>{dosha.caveat}</Text>
          </View>
        )) : <Text style={styles.body}>No supported dosha screen matched.</Text>}
      </Page>

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="Calculated timeline" title="Vimshottari Dasha" />
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current Mahadasha</Text>
            <Text style={styles.cardValue}>
              {titleCase(chart.dashas.current.mahadasha?.lord ?? "Unavailable")}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Current Antardasha</Text>
            <Text style={styles.cardValue}>
              {titleCase(chart.dashas.current.antardasha?.lord ?? "Unavailable")}
            </Text>
          </View>
        </View>
        <View style={styles.table}>
          {chart.dashas.periods.map((period) => (
            <View key={`${period.lord}-${period.start}`} style={styles.row}>
              <Text style={[styles.cell, { width: "24%", fontWeight: 700 }]}>
                {titleCase(period.lord)}
              </Text>
              <Text style={[styles.cell, { width: "38%" }]}>{formatDate(period.start)}</Text>
              <Text style={[styles.cell, { width: "38%" }]}>{formatDate(period.end)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>{chart.dashas.caveat}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="Traditional interpretation" title="Life-area report" />
        {([
          ["Career", interpretation.sections.career],
          ["Money", interpretation.sections.money],
          ["Property & vehicle", interpretation.sections.property],
          ["Marriage & relationships", interpretation.sections.relationships],
          ["Education", interpretation.sections.education],
          ["Travel & foreign connection", interpretation.sections.travel],
          ["General wellbeing", interpretation.sections.health],
        ] as const).map(([name, section]) => (
          <View key={name} style={[styles.card, { marginBottom: 9 }]} wrap={false}>
            <Text style={{ fontFamily: "Times-Roman", fontSize: 13 }}>{name}</Text>
            <Text style={{ marginTop: 3, fontWeight: 700 }}>{section.headline}</Text>
            <Text style={[styles.body, { marginTop: 5 }]}>{section.analysis}</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Footer />
        <SectionTitle eyebrow="Important" title="Caveats & disclaimer" />
        <BulletList items={interpretation.caveats} />
        <Text style={styles.note}>{interpretation.disclaimer}</Text>
        <Text style={[styles.body, { marginTop: 20 }]}>
          This report separates deterministic chart calculations from AI
          interpretation. Traditional astrological claims should not be treated
          as scientific facts, certainties or substitutes for professional
          advice.
        </Text>
      </Page>
    </Document>
  );
}