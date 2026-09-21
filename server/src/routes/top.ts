import { Router } from "express";
import { z } from "zod";
import { asyncRoute } from "../lib/http.js";
import type {
  BestPerDimRow,
  BreakdownRow,
  RankKey,
  RankedCreative,
  TopDto,
} from "../shared/types.js";
import { parseFilters } from "../services/filters.js";
import { getCreativeTotals, getCreativeTotalsByDim } from "../services/performance.js";

export const topRouter = Router();

const rankSchema = z.enum(["installs", "cpi", "ctr", "spend"]).default("installs");
const dimSchema = z.enum(["app", "country", "platform", "os"]).default("app");

/**
 * Cost per install only means something with volume behind it, so ranking on it
 * ignores creatives under this many installs. The other measures rank everything.
 */
const MIN_INSTALLS_FOR_CPI = 8;

type NumericField = "installs" | "cpi" | "ctr" | "spend";

const RANK_CONFIG: Record<RankKey, { field: NumericField; ascending: boolean }> = {
  installs: { field: "installs", ascending: false },
  cpi: { field: "cpi", ascending: true },
  ctr: { field: "ctr", ascending: false },
  spend: { field: "spend", ascending: false },
};

function sortBy(rows: BreakdownRow[], rank: RankKey): BreakdownRow[] {
  const { field, ascending } = RANK_CONFIG[rank];
  const eligible = ascending ? rows.filter((r) => r.installs >= MIN_INSTALLS_FOR_CPI) : rows;
  return [...eligible].sort((a, b) => {
    // A null measure sorts last whichever direction we are going.
    const av = a[field] ?? (ascending ? Number.POSITIVE_INFINITY : -1);
    const bv = b[field] ?? (ascending ? Number.POSITIVE_INFINITY : -1);
    return ascending ? av - bv : bv - av;
  });
}

function toRanked(rows: BreakdownRow[]): RankedCreative[] {
  return rows.map(({ key, ...totals }) => ({ creativeId: key, ...totals }));
}

topRouter.get(
  "/top",
  asyncRoute(async (req, res) => {
    const f = parseFilters(req.query);
    const rank = rankSchema.parse(req.query.rank ?? "installs") as RankKey;
    const dim = dimSchema.parse(req.query.dim ?? "app");

    const all = await getCreativeTotals(f);
    const ranked = toRanked(sortBy(all, rank)).slice(0, 10);

    // Weakest is always highest cost per install, whatever the ranking above is.
    const weak = toRanked(
      all
        .filter((r) => r.installs >= MIN_INSTALLS_FOR_CPI)
        .sort((a, b) => (b.cpi ?? 0) - (a.cpi ?? 0)),
    ).slice(0, 5);

    const bestPerDim = await buildBestPerDim(f, dim, rank);

    const dto: TopDto = { ranked, weak, bestPerDim, rankKey: rank };
    res.json(dto);
  }),
);

async function buildBestPerDim(
  f: ReturnType<typeof parseFilters>,
  dim: "app" | "country" | "platform" | "os",
  rank: RankKey,
): Promise<BestPerDimRow[]> {
  const grouped = new Map<string, BreakdownRow[]>();

  if (dim === "os") {
    // iOS and Android are weightings of the same rows, so each needs its own
    // pass with that weighting applied.
    for (const os of ["ios", "android"] as const) {
      const rows = await getCreativeTotals({ ...f, os }, os);
      grouped.set(
        os,
        rows.filter((r) => r.impressions > 0),
      );
    }
  } else {
    const rows = await getCreativeTotalsByDim(f, dim);
    for (const row of rows) {
      const list = grouped.get(row.dimKey) ?? [];
      list.push(row);
      grouped.set(row.dimKey, list);
    }
  }

  const out: BestPerDimRow[] = [];
  for (const [dimKey, rows] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const best = sortBy(rows, rank)[0];
    if (!best) continue;
    const { key, ...totals } = best;
    out.push({ dimKey, creativeId: key, ...totals });
  }
  return out;
}
