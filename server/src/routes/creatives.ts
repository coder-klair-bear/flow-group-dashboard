import { Router } from "express";
import { asyncRoute } from "../lib/http.js";
import type { CreativesDto, PlacementDto } from "../shared/types.js";
import { getCatalog } from "../services/catalog.js";
import { parseFilters, type Filters } from "../services/filters.js";

export const creativesRouter = Router();

/**
 * Placements are the grain the creatives view filters on: the same creative can
 * be live on Meta and missing on TikTok, and the filters need to see both.
 * There are only a couple of hundred of them, so this runs in memory off the
 * cached catalogue rather than as a query per keystroke.
 */
function matches(p: PlacementDto, f: Filters): boolean {
  if (f.app !== "all" && p.appKey !== f.app) return false;
  if (f.country !== "all" && p.countryCode !== f.country) return false;
  if (f.platform !== "all" && p.platformKey !== f.platform) return false;
  if (f.campaign !== "all" && p.campaign !== f.campaign) return false;
  if (f.creative !== "all" && p.creativeId !== f.creative) return false;
  if (f.os === "ios" && !p.os.includes("ios")) return false;
  if (f.os === "android" && !p.os.includes("android")) return false;
  if (f.status !== "all" && p.status !== f.status) return false;
  if (f.pubFrom && (!p.publishedOn || p.publishedOn < f.pubFrom)) return false;
  if (f.pubTo && (!p.publishedOn || p.publishedOn > f.pubTo)) return false;
  if (f.q.trim()) {
    const needle = f.q.trim().toLowerCase();
    const haystack = `${p.creativeName} ${p.creativeId} ${p.campaign}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

creativesRouter.get(
  "/creatives",
  asyncRoute(async (req, res) => {
    const f = parseFilters(req.query);
    const catalog = await getCatalog();

    const placements = catalog.placements.filter((p) => matches(p, f));
    const matchedIds = new Set(placements.map((p) => p.creativeId));
    const creatives = catalog.creatives.filter((c) => matchedIds.has(c.id));
    const totalCreatives =
      f.app === "all"
        ? catalog.creatives.length
        : catalog.creatives.filter((c) => c.appKey === f.app).length;

    const dto: CreativesDto = {
      creatives,
      placements,
      matchedCreatives: creatives.length,
      totalCreatives,
    };
    res.json(dto);
  }),
);
