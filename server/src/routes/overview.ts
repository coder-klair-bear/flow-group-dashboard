import { Router } from "express";
import { z } from "zod";
import { startOfToday, toIso } from "../lib/dates.js";
import { asyncRoute } from "../lib/http.js";
import type { BreakdownDim, OverviewDto } from "../shared/types.js";
import { buildAlerts } from "../services/alerts.js";
import { getCatalog } from "../services/catalog.js";
import { fixedPeriodRanges, parseFilters } from "../services/filters.js";
import { getBreakdown, getSpendSpark, getTotals } from "../services/performance.js";
import { platformCoverage } from "../services/publishing.js";

export const overviewRouter = Router();

const dimSchema = z
  .enum(["app", "country", "platform", "campaign", "creative", "os", "account"])
  .default("app");

overviewRouter.get(
  "/overview",
  asyncRoute(async (req, res) => {
    const f = parseFilters(req.query);
    const dim = dimSchema.parse(req.query.dim ?? "app") as BreakdownDim;
    const today = toIso(startOfToday());
    const catalog = await getCatalog();
    const periods = fixedPeriodRanges();

    const [
      todayTotals,
      yesterdayTotals,
      weekTotals,
      lastWeekTotals,
      monthTotals,
      lastMonthTotals,
      current,
      previous,
      spark,
      breakdown,
      alerts,
    ] = await Promise.all([
      getTotals(f, periods.today!.from, periods.today!.to),
      getTotals(f, periods.yesterday!.from, periods.yesterday!.to),
      getTotals(f, periods.week!.from, periods.week!.to),
      getTotals(f, periods.lastWeek!.from, periods.lastWeek!.to),
      getTotals(f, periods.month!.from, periods.month!.to),
      getTotals(f, periods.lastMonth!.from, periods.lastMonth!.to),
      getTotals(f),
      getTotals(f, f.previousFrom, f.previousTo),
      getSpendSpark(f, 30, today),
      getBreakdown(f, dim),
      buildAlerts(catalog, f, today),
    ]);

    const creativeCount =
      f.app === "all"
        ? catalog.creatives.length
        : catalog.creatives.filter((c) => c.appKey === f.app).length;

    const dto: OverviewDto = {
      range: {
        from: f.from,
        to: f.to,
        previousFrom: f.previousFrom,
        previousTo: f.previousTo,
        days: f.days,
      },
      periods: {
        today: todayTotals,
        yesterday: yesterdayTotals,
        week: weekTotals,
        lastWeek: lastWeekTotals,
        month: monthTotals,
        lastMonth: lastMonthTotals,
      },
      current,
      previous,
      spark,
      breakdown,
      coverage: platformCoverage(catalog, f.app),
      creativeCount,
      alerts,
    };
    res.json(dto);
  }),
);
