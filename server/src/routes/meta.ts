import { Router } from "express";
import { startOfToday, toIso } from "../lib/dates.js";
import { asyncRoute } from "../lib/http.js";
import type { MetaDto } from "../shared/types.js";
import { getCatalog } from "../services/catalog.js";

export const metaRouter = Router();

/**
 * Everything the client needs before it can render anything: the catalogue from
 * the sheets, plus the server's idea of today so both sides agree on what
 * "this week" means.
 */
metaRouter.get(
  "/meta",
  asyncRoute(async (_req, res) => {
    const catalog = await getCatalog();
    const dto: MetaDto = {
      today: toIso(startOfToday()),
      updatedAt: new Date().toISOString(),
      apps: catalog.apps,
      countries: catalog.countries,
      platforms: catalog.platforms,
      creatives: catalog.creatives,
      campaigns: catalog.campaigns,
      accounts: catalog.accounts,
      creativeCount: catalog.creatives.length,
    };
    res.json(dto);
  }),
);
