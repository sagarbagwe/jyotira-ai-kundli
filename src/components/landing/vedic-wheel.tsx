const signs = [
  "मेष",
  "वृष",
  "मिथु",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चि",
  "धनु",
  "मकर",
  "कुंभ",
  "मीन",
];

export function VedicWheel({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 520"
      className={className}
      role="img"
      aria-label="Abstract Vedic zodiac wheel"
    >
      <defs>
        <radialGradient id="wheelGlow">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity=".9" />
          <stop offset="68%" stopColor="var(--primary-soft)" stopOpacity=".55" />
          <stop offset="100%" stopColor="var(--surface)" stopOpacity=".15" />
        </radialGradient>
      </defs>
      <circle
        cx="260"
        cy="260"
        r="239"
        fill="url(#wheelGlow)"
        stroke="var(--border)"
      />
      <circle
        cx="260"
        cy="260"
        r="194"
        fill="none"
        stroke="var(--gold)"
        strokeOpacity=".34"
      />
      <circle
        cx="260"
        cy="260"
        r="118"
        fill="var(--surface)"
        stroke="var(--border)"
      />
      <g className="animate-orbit">
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index * Math.PI * 2) / 12 - Math.PI / 2;
          const x1 = 260 + Math.cos(angle) * 118;
          const y1 = 260 + Math.sin(angle) * 118;
          const x2 = 260 + Math.cos(angle) * 239;
          const y2 = 260 + Math.sin(angle) * 239;
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--border)"
            />
          );
        })}
      </g>
      {signs.map((sign, index) => {
        const angle = (index * Math.PI * 2) / 12 - Math.PI / 2;
        const x = 260 + Math.cos(angle) * 158;
        const y = 260 + Math.sin(angle) * 158;
        return (
          <text
            key={sign}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--ink-secondary)"
            fontSize="13"
            fontWeight="700"
          >
            {sign}
          </text>
        );
      })}
      <g transform="translate(260 260)">
        <path
          d="M0-71 19-19 71 0 19 19 0 71-19 19-71 0-19-19Z"
          fill="var(--gold-soft)"
          stroke="var(--gold)"
          strokeOpacity=".65"
        />
        <circle r="24" fill="var(--surface)" stroke="var(--gold)" />
        <circle r="7" fill="var(--gold)" />
      </g>
      <circle cx="260" cy="21" r="4" fill="var(--gold)" />
      <circle cx="499" cy="260" r="4" fill="var(--primary)" />
      <circle cx="260" cy="499" r="4" fill="var(--gold)" />
      <circle cx="21" cy="260" r="4" fill="var(--primary)" />
    </svg>
  );
}