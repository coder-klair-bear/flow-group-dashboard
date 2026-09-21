import { z } from "zod";
import { addDays, monthStart, startOfToday, toIso, weekStart } from "../lib/dates.js";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected yyyy-mm-dd");

export const filterSchema = z.object({
  /** "all" or an app key. */
  app: z.string().default("all"),
  country: z.string().default("all"),
  platform: z.string().default("all"),
  campaign: z.string().default("all"),
  creative: z.string().default("all"),
  os: z.enum(["all", "ios", "android"]).default("all"),
  /** Reconciled placement status; applied to placements, not to metric rows. */
  status: z.string().default("all"),
  q: z.string().default(""),
  /** Metric date range. Defaults to the current month to date. */
  from: isoDate.optional(),
  to: isoDate.optional(),
  /** Publish-date filter, applied to placements only. */
  pubFrom: isoDate.optional(),
  pubTo: isoDate.optional(),
});

export type FilterInput = z.infer<typeof filterSchema>;

export interface Filters extends FilterInput {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  days: number;
}

/**
 * Fills in the date range and works out the comparable previous period: the
 * same number of days immediately before the range, so "vs previous period"
 * always compares like with like.
 */
export function resolveFilters(input: FilterInput): Filters {
  const today = startOfToday();
  let from = input.from ? input.from : toIso(monthStart(today));
  let to = input.to ? input.to : toIso(today);
  if (from > to) [from, to] = [to, from];

  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1);
  const previousTo = addDays(fromDate, -1);
  const previousFrom = addDays(previousTo, -(days - 1));

  return {
    ...input,
    from,
    to,
    previousFrom: toIso(previousFrom),
    previousTo: toIso(previousTo),
    days,
  };
}

export function parseFilters(query: unknown): Filters {
  return resolveFilters(filterSchema.parse(query ?? {}));
}

/** The fixed periods the overview cards always show, regardless of the range. */
export function fixedPeriodRanges(): Record<string, { from: string; to: string }> {
  const today = startOfToday();
  const ws = weekStart(today);
  const ms = monthStart(today);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return {
    today: { from: toIso(today), to: toIso(today) },
    yesterday: { from: toIso(addDays(today, -1)), to: toIso(addDays(today, -1)) },
    week: { from: toIso(ws), to: toIso(today) },
    lastWeek: { from: toIso(addDays(ws, -7)), to: toIso(addDays(ws, -1)) },
    month: { from: toIso(ms), to: toIso(today) },
    lastMonth: { from: toIso(lastMonthStart), to: toIso(addDays(ms, -1)) },
  };
}
