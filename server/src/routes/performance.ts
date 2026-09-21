import { Router } from "express";
import { z } from "zod";
import { asyncRoute } from "../lib/http.js";
import type { BreakdownDim, Granularity, PerformanceDto } from "../shared/types.js";
import { parseFilters } from "../services/filters.js";
import { getBreakdown, getRowCount, getSeries, getTotals } from "../services/performance.js";

export const performanceRouter = Router();

const granSchema = z.enum(["day", "week", "month"]).default("day");
const dimSchema = z
  .enum(["app", "country", "platform", "campaign", "creative", "os", "account"])
  .default("platform");

performanceRouter.get(
  "/performance",
  asyncRoute(async (req, res) => {
    const f = parseFilters(req.query);
    const gran = granSchema.parse(req.query.gran ?? "day") as Granularity;
    const dim = dimSchema.parse(req.query.dim ?? "platform") as BreakdownDim;

    const [totals, series, breakdown, rowCount] = await Promise.all([
      getTotals(f),
      getSeries(f, gran),
      getBreakdown(f, dim),
      getRowCount(f),
    ]);

    const dto: PerformanceDto = { totals, series, breakdown, rowCount };
    res.json(dto);
  }),
);
