import type { ReactNode } from "react";
import { delta } from "@/lib/format";
import { SampleChip } from "./primitives";

/**
 * A change against a comparison period. `invert` is for measures where down is
 * good — cost per install being the only one here.
 */
export function Delta({
  current,
  previous,
  label,
  invert = false,
}: {
  current: number | null;
  previous: number | null;
  label: string;
  invert?: boolean;
}) {
  const d = delta(current, previous);
  if (d == null) return <div className="kdelta">{label}</div>;

  const good = invert ? d < 0 : d > 0;
  // Under half a per cent is noise, so it gets no colour either way.
  const tone = Math.abs(d) < 0.5 ? "" : good ? "up" : "down";

  return (
    <div className={`kdelta ${tone}`.trim()}>
      {d >= 0 ? "▲" : "▼"} {Math.abs(d).toFixed(1)} %{" "}
      <span style={{ color: "var(--muted)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sample = true,
  small = false,
  valueColor,
  children,
  footer,
}: {
  label: string;
  value: string;
  sample?: boolean;
  small?: boolean;
  valueColor?: string;
  /** Usually a Delta. */
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="card">
      <p className="klabel">
        {label}
        {sample ? <SampleChip /> : null}
      </p>
      <span
        className={`kval${small ? " sm" : ""}${sample ? " smp" : ""}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
      {children}
      {footer ? <div className="kfoot">{footer}</div> : null}
    </div>
  );
}
