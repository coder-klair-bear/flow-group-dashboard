/**
 * Every performance number in the dashboard is aggregated here, in SQL, from
 * `daily_metrics` joined to `placements`. The rows are sample data today and
 * live platform data from stage 5 onwards — this layer does not care which.
 */

import { sql, type SQL } from "drizzle-orm";
import { db } from "../db/client.js";
import { addDays, fromIso, toIso } from "../lib/dates.js";
import type {
  BreakdownDim,
  BreakdownRow,
  Granularity,
  OsFilter,
  SeriesPoint,
  Totals,
} from "../shared/types.js";
import type { Filters } from "./filters.js";

export const EMPTY_TOTALS: Totals = {
  spend: 0,
  installs: 0,
  clicks: 0,
  impressions: 0,
  cpi: null,
  ctr: null,
  cvr: null,
};

interface RawTotals {
  spend: unknown;
  installs: unknown;
  clicks: unknown;
  impressions: unknown;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Cost per install, click-through rate and conversion rate are never stored. */
export function derive(raw: RawTotals): Totals {
  const spend = num(raw.spend);
  const installs = num(raw.installs);
  const clicks = num(raw.clicks);
  const impressions = num(raw.impressions);
  return {
    spend,
    installs,
    clicks,
    impressions,
    cpi: installs > 0 ? spend / installs : null,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : null,
    cvr: clicks > 0 ? (installs / clicks) * 100 : null,
  };
}

/**
 * The sheets record iOS/Android only where it was written out, so delivery is
 * split by the share stored on the placement rather than by a real OS column.
 * That approximation is flagged in the UI wherever an OS breakdown is shown.
 */
function osFactor(os: OsFilter): SQL {
  if (os === "ios") return sql`p.ios_share`;
  if (os === "android") return sql`(1 - p.ios_share)`;
  return sql`1::float8`;
}

const FROM_CLAUSE = sql`
  from daily_metrics m
  join placements p on p.id = m.placement_id
  join creatives c on c.id = p.creative_id
  left join ad_accounts acc on acc.id = p.account_id
`;

/**
 * `status` is intentionally not applied here: it describes a placement's
 * reconciliation state, not a day of delivery, and filtering metrics by it
 * would silently drop spend that really happened.
 */
function whereClause(f: Filters, from: string, to: string): SQL {
  const parts: SQL[] = [sql`m.day between ${from}::date and ${to}::date`];
  if (f.app !== "all") parts.push(sql`p.app_key = ${f.app}`);
  if (f.country !== "all") parts.push(sql`p.country_code = ${f.country}`);
  if (f.platform !== "all") parts.push(sql`p.platform_key = ${f.platform}`);
  if (f.campaign !== "all") parts.push(sql`p.campaign = ${f.campaign}`);
  if (f.creative !== "all") parts.push(sql`p.creative_id = ${f.creative}`);
  if (f.q.trim()) {
    const needle = `%${f.q.trim().toLowerCase()}%`;
    parts.push(
      sql`(lower(c.name) like ${needle} or lower(p.creative_id) like ${needle} or lower(p.campaign) like ${needle})`,
    );
  }
  return sql`where ${sql.join(parts, sql` and `)}`;
}

function aggregates(os: OsFilter): SQL {
  const factor = osFactor(os);
  return sql`
    coalesce(sum(m.spend::float8 * ${factor}), 0)::float8 as spend,
    coalesce(sum(m.installs::float8 * ${factor}), 0)::float8 as installs,
    coalesce(sum(m.clicks::float8 * ${factor}), 0)::float8 as clicks,
    coalesce(sum(m.impressions::float8 * ${factor}), 0)::float8 as impressions
  `;
}

function dimExpression(dim: Exclude<BreakdownDim, "os">): SQL {
  switch (dim) {
    case "app":
      return sql`p.app_key`;
    case "country":
      return sql`p.country_code`;
    case "platform":
      return sql`p.platform_key`;
    case "campaign":
      return sql`p.campaign`;
    case "creative":
      return sql`p.creative_id`;
    case "account":
      return sql`coalesce(acc.external_id, '–')`;
  }
}

function bucketExpression(gran: Granularity): SQL {
  if (gran === "week") return sql`date_trunc('week', m.day)::date`;
  if (gran === "month") return sql`date_trunc('month', m.day)::date`;
  return sql`m.day`;
}

async function runRows<T extends Record<string, unknown>>(query: SQL): Promise<T[]> {
  // node-postgres returns a QueryResult; some other drizzle drivers return the
  // rows directly. Handle both so swapping the driver later is a one-line change.
  const result = (await db.execute<T>(query)) as unknown as T[] | { rows?: T[] };
  return Array.isArray(result) ? result : (result.rows ?? []);
}

export async function getTotals(f: Filters, from = f.from, to = f.to): Promise<Totals> {
  const rows = await runRows<RawTotals>(
    sql`select ${aggregates(f.os)} ${FROM_CLAUSE} ${whereClause(f, from, to)}`,
  );
  return rows[0] ? derive(rows[0]) : EMPTY_TOTALS;
}

export async function getSeries(f: Filters, gran: Granularity): Promise<SeriesPoint[]> {
  const bucket = bucketExpression(gran);
  const rows = await runRows<RawTotals & { bucket: string }>(sql`
    select to_char(${bucket}, 'YYYY-MM-DD') as bucket, ${aggregates(f.os)}
    ${FROM_CLAUSE}
    ${whereClause(f, f.from, f.to)}
    group by 1
    order by 1
  `);
  return rows.map((r) => ({ bucket: String(r.bucket), ...derive(r) }));
}

export async function getBreakdown(f: Filters, dim: BreakdownDim): Promise<BreakdownRow[]> {
  if (dim === "os") return getOsBreakdown(f);

  const expr = dimExpression(dim);
  const rows = await runRows<RawTotals & { key: string }>(sql`
    select ${expr} as key, ${aggregates(f.os)}
    ${FROM_CLAUSE}
    ${whereClause(f, f.from, f.to)}
    group by 1
    order by spend desc
  `);
  return rows.map((r) => ({ key: String(r.key), ...derive(r) }));
}

/**
 * iOS and Android are two weightings of the same rows, so one pass computes
 * both instead of querying twice.
 */
async function getOsBreakdown(f: Filters): Promise<BreakdownRow[]> {
  const rows = await runRows<Record<string, unknown>>(sql`
    select
      coalesce(sum(m.spend::float8 * p.ios_share), 0)::float8 as ios_spend,
      coalesce(sum(m.installs::float8 * p.ios_share), 0)::float8 as ios_installs,
      coalesce(sum(m.clicks::float8 * p.ios_share), 0)::float8 as ios_clicks,
      coalesce(sum(m.impressions::float8 * p.ios_share), 0)::float8 as ios_impressions,
      coalesce(sum(m.spend::float8 * (1 - p.ios_share)), 0)::float8 as android_spend,
      coalesce(sum(m.installs::float8 * (1 - p.ios_share)), 0)::float8 as android_installs,
      coalesce(sum(m.clicks::float8 * (1 - p.ios_share)), 0)::float8 as android_clicks,
      coalesce(sum(m.impressions::float8 * (1 - p.ios_share)), 0)::float8 as android_impressions
    ${FROM_CLAUSE}
    ${whereClause(f, f.from, f.to)}
  `);
  const r = rows[0];
  if (!r) return [];

  const out: BreakdownRow[] = [
    {
      key: "ios",
      ...derive({
        spend: r.ios_spend,
        installs: r.ios_installs,
        clicks: r.ios_clicks,
        impressions: r.ios_impressions,
      }),
    },
    {
      key: "android",
      ...derive({
        spend: r.android_spend,
        installs: r.android_installs,
        clicks: r.android_clicks,
        impressions: r.android_impressions,
      }),
    },
  ];
  // An iOS-only creative contributes nothing to Android; drop the row entirely
  // rather than showing a zero that looks like a collapse in delivery.
  return out.filter((row) => row.impressions > 0).sort((a, b) => b.spend - a.spend);
}

/** Per-creative aggregate used by the top-creatives view. */
export async function getCreativeTotals(
  f: Filters,
  os: OsFilter = f.os,
): Promise<BreakdownRow[]> {
  const rows = await runRows<RawTotals & { key: string }>(sql`
    select p.creative_id as key, ${aggregates(os)}
    ${FROM_CLAUSE}
    ${whereClause(f, f.from, f.to)}
    group by 1
  `);
  return rows.map((r) => ({ key: String(r.key), ...derive(r) }));
}

/** Per-creative aggregate split by one dimension, for "best per app/country/…". */
export async function getCreativeTotalsByDim(
  f: Filters,
  dim: Exclude<BreakdownDim, "os" | "creative">,
  os: OsFilter = f.os,
): Promise<(BreakdownRow & { dimKey: string })[]> {
  const expr = dimExpression(dim);
  const rows = await runRows<RawTotals & { dim_key: string; key: string }>(sql`
    select ${expr} as dim_key, p.creative_id as key, ${aggregates(os)}
    ${FROM_CLAUSE}
    ${whereClause(f, f.from, f.to)}
    group by 1, 2
  `);
  return rows.map((r) => ({ dimKey: String(r.dim_key), key: String(r.key), ...derive(r) }));
}

/** Daily spend for the last `days` days, oldest first, zero-filled. */
export async function getSpendSpark(f: Filters, days: number, today: string): Promise<number[]> {
  const start = addDays(fromIso(today), -(days - 1));
  const startIso = toIso(start);

  const rows = await runRows<{ bucket: string; spend: unknown }>(sql`
    select to_char(m.day, 'YYYY-MM-DD') as bucket,
           coalesce(sum(m.spend::float8 * ${osFactor(f.os)}), 0)::float8 as spend
    ${FROM_CLAUSE}
    ${whereClause(f, startIso, today)}
    group by 1
  `);

  // Days with no delivery are absent from the result; the sparkline needs a
  // zero there, not a gap, or the line implies delivery that did not happen.
  const byDay = new Map(rows.map((r) => [String(r.bucket), num(r.spend)]));
  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    out.push(byDay.get(toIso(addDays(start, i))) ?? 0);
  }
  return out;
}

/** Number of metric rows behind the current filter — shown as a data-volume cue. */
export async function getRowCount(f: Filters): Promise<number> {
  const rows = await runRows<{ n: unknown }>(
    sql`select count(*)::int as n ${FROM_CLAUSE} ${whereClause(f, f.from, f.to)}`,
  );
  return rows[0] ? num(rows[0].n) : 0;
}

/**
 * Placements that are meant to be out but have had no delivery in the last
 * `days` days. Real once the platforms are connected; sample until then.
 */
export async function getInactivePlacements(f: Filters, days: number, today: string): Promise<number[]> {
  const cutoff = toIso(addDays(fromIso(today), -(days - 1)));
  const appClause = f.app === "all" ? sql`` : sql` and p.app_key = ${f.app}`;
  const rows = await runRows<{ id: unknown }>(sql`
    select p.id
    from placements p
    where p.is_live = true${appClause}
      and not exists (
        select 1 from daily_metrics m
        where m.placement_id = p.id and m.day >= ${cutoff}::date
      )
    order by p.id
  `);
  return rows.map((r) => num(r.id));
}

/**
 * Creatives whose cost per install sits far above the average for their own
 * app. Volume floor of 8 installs so a single lucky install cannot rank.
 */
export async function getHighCostCreatives(
  f: Filters,
  windowDays: number,
  today: string,
  threshold = 1.75,
): Promise<{ creativeId: string; appKey: string; cpi: number; appCpi: number }[]> {
  const from = toIso(addDays(fromIso(today), -(windowDays - 1)));
  const appClause = f.app === "all" ? sql`` : sql` and p.app_key = ${f.app}`;

  const rows = await runRows<{
    creative_id: string;
    app_key: string;
    cpi: unknown;
    app_cpi: unknown;
  }>(sql`
    with per_creative as (
      select p.app_key,
             p.creative_id,
             sum(m.spend::float8) as spend,
             sum(m.installs)      as installs
      from daily_metrics m
      join placements p on p.id = m.placement_id
      where m.day between ${from}::date and ${today}::date${appClause}
      group by 1, 2
    ),
    per_app as (
      select app_key,
             sum(spend) / nullif(sum(installs), 0) as app_cpi
      from per_creative
      group by 1
    )
    select pc.creative_id,
           pc.app_key,
           (pc.spend / nullif(pc.installs, 0))::float8 as cpi,
           pa.app_cpi::float8                          as app_cpi
    from per_creative pc
    join per_app pa on pa.app_key = pc.app_key
    where pc.installs >= 8
      and pa.app_cpi is not null
      and (pc.spend / nullif(pc.installs, 0)) > pa.app_cpi * ${threshold}
    order by cpi desc
  `);

  return rows.map((r) => ({
    creativeId: String(r.creative_id),
    appKey: String(r.app_key),
    cpi: num(r.cpi),
    appCpi: num(r.app_cpi),
  }));
}
