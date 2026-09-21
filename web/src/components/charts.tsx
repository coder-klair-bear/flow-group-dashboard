import { useId } from "react";
import { Empty } from "./primitives";

export interface LinePoint {
  label: string;
  value: number;
}

/**
 * A plain area chart drawn as inline SVG: no chart library, so the theme
 * variables apply directly and there is nothing to keep in sync.
 */
export function LineChart({
  points,
  formatY,
  ariaLabel,
}: {
  points: LinePoint[];
  formatY: (v: number) => string;
  ariaLabel: string;
}) {
  const gradientId = useId();

  if (!points.length) return <Empty />;

  const W = 900;
  const H = 250;
  const PL = 58;
  const PR = 14;
  const PT = 16;
  const PB = 30;
  const iw = W - PL - PR;
  const ih = H - PT - PB;

  const max = points.reduce((m, p) => (p.value > m ? p.value : m), 0);
  const magnitude = Math.pow(10, Math.floor(Math.log10(max > 0 ? max : 1)));
  const top = Math.max(1, Math.ceil((max / magnitude) * 1.05) * magnitude);

  const n = points.length;
  const x = (i: number) => PL + (n <= 1 ? iw / 2 : (iw * i) / (n - 1));
  const y = (v: number) => PT + ih - (v / top) * ih;

  const gridLines = [0, 1, 2, 3, 4].map((k) => {
    const yy = PT + (ih * k) / 4;
    return { yy, value: top * (1 - k / 4) };
  });

  const line = points
    .map((p, i) => `${i ? " L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join("");
  const area = `${line} L${x(n - 1).toFixed(1)} ${PT + ih} L${x(0).toFixed(1)} ${PT + ih} Z`;

  // Roughly seven ticks whatever the bucket count, with the last one forced so
  // the axis always ends at the period the user selected.
  const step = Math.max(1, Math.ceil(n / 7));
  const tickIndices: number[] = [];
  for (let i = 0; i < n; i += step) tickIndices.push(i);
  if (n > 1 && (n - 1) % step !== 0) tickIndices.push(n - 1);

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((g, i) => (
        <g key={i}>
          <line className="gl" x1={PL} y1={g.yy.toFixed(1)} x2={W - PR} y2={g.yy.toFixed(1)} />
          <text className="axt" x={PL - 8} y={(g.yy + 3.5).toFixed(1)} textAnchor="end">
            {formatY(g.value)}
          </text>
        </g>
      ))}

      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {n <= 26
        ? points.map((p, i) => (
            <circle
              key={p.label + i}
              cx={x(i).toFixed(1)}
              cy={y(p.value).toFixed(1)}
              r="3"
              fill="var(--surface)"
              stroke="var(--accent)"
              strokeWidth="2"
            >
              <title>{`${p.label}: ${formatY(p.value)}`}</title>
            </circle>
          ))
        : null}

      {tickIndices.map((i) => (
        <text key={i} className="axt" x={x(i).toFixed(1)} y={H - 9} textAnchor="middle">
          {points[i]?.label}
        </text>
      ))}
    </svg>
  );
}

/** Thirty days of spend under the monthly card, as a bare trend line. */
export function Sparkline({ values }: { values: number[] }) {
  if (!values || values.length < 2) return null;

  const W = 160;
  const H = 34;
  const min = Math.min(...values);
  const max = Math.max(...values) === min ? min + 1 : Math.max(...values);

  const d = values
    .map((v, i) => {
      const x = ((W * i) / (values.length - 1)).toFixed(1);
      const y = (H - 2 - ((v - min) / (max - min)) * (H - 6)).toFixed(1);
      return `${i ? " L" : "M"}${x} ${y}`;
    })
    .join("");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="chart"
      style={{ height: 34, width: "100%" }}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--sample)"
        strokeWidth="1.8"
        opacity=".65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface BarItem {
  key: string;
  label: string;
  value: number;
  display: string;
  sub?: string;
  color?: string;
}

/** Horizontal bars in HTML rather than SVG, so labels wrap and ellipsise. */
export function Bars({ items, sample = true }: { items: BarItem[]; sample?: boolean }) {
  if (!items.length) return <Empty />;
  const max = items.reduce((m, i) => (i.value > m ? i.value : m), 0) || 1;

  return (
    <div
      style={{ padding: "12px 15px 14px", display: "flex", flexDirection: "column", gap: 11 }}
    >
      {items.map((item) => (
        <div key={item.key}>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 5 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
            <span
              className={sample ? "smp" : undefined}
              style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}
            >
              {item.display}
            </span>
          </div>
          <div className="bar">
            <i
              style={{
                width: `${Math.max(1.5, (item.value / max) * 100).toFixed(1)}%`,
                background: item.color ?? "linear-gradient(90deg,var(--accentSoft),var(--accent))",
              }}
            />
          </div>
          {item.sub ? (
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{item.sub}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
