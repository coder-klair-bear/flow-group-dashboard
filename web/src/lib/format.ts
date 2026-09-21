import type { Granularity } from "@shared/types";
import { useMemo } from "react";
import { useLang } from "@/i18n/lang";

const DASH = "–";

export interface Formatters {
  int: (n: number | null | undefined) => string;
  money: (n: number | null | undefined) => string;
  money2: (n: number | null | undefined) => string;
  pct: (n: number | null | undefined, decimals?: number) => string;
  date: (iso: string | null | undefined) => string;
  time: (d: Date) => string;
  /** Short axis label for a series bucket. */
  bucketLabel: (bucket: string, gran: Granularity) => string;
  /** Compact axis tick: 12k rather than 12 000. */
  compact: (n: number) => string;
}

export function useFormat(): Formatters {
  const { locale, lang } = useLang();

  return useMemo<Formatters>(() => {
    const int = (n: number | null | undefined) =>
      n == null || !Number.isFinite(n) ? DASH : Math.round(n).toLocaleString(locale);

    const money = (n: number | null | undefined) =>
      n == null || !Number.isFinite(n) ? DASH : `${Math.round(n).toLocaleString(locale)} kr`;

    const money2 = (n: number | null | undefined) =>
      n == null || !Number.isFinite(n)
        ? DASH
        : `${n.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} kr`;

    const pct = (n: number | null | undefined, decimals = 2) =>
      n == null || !Number.isFinite(n)
        ? DASH
        : `${n.toLocaleString(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })} %`;

    const date = (iso: string | null | undefined) => {
      if (!iso) return DASH;
      const d = new Date(`${iso}T00:00:00`);
      if (Number.isNaN(d.getTime())) return DASH;
      return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    };

    const time = (d: Date) =>
      d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

    const bucketLabel = (bucket: string, gran: Granularity) => {
      const d = new Date(`${bucket}T00:00:00`);
      if (Number.isNaN(d.getTime())) return bucket;
      if (gran === "week") return `${lang === "sv" ? "v." : "W"}${isoWeek(d)}`;
      if (gran === "month") return d.toLocaleDateString(locale, { month: "short", year: "2-digit" });
      return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
    };

    const compact = (n: number) =>
      Math.abs(n) >= 1000 ? `${Math.round(n / 1000)}k` : `${Math.round(n)}`;

    return { int, money, money2, pct, date, time, bucketLabel, compact };
  }, [locale, lang]);
}

/** ISO-8601 week number, which is what the Swedish "v.37" refers to. */
export function isoWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    )
  );
}

/** Percentage change, or null when there is no base to compare against. */
export function delta(current: number | null, previous: number | null): number | null {
  if (previous == null || previous === 0 || current == null) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Stable hue for a creative's placeholder thumbnail, so the same creative keeps
 * the same colour everywhere in the dashboard.
 */
export function hueFor(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}
