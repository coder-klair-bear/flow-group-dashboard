import { Router } from "express";
import { asyncRoute } from "../lib/http.js";
import type { PublishingDto, UnpublishedDto } from "../shared/types.js";
import { getCatalog } from "../services/catalog.js";
import { parseFilters } from "../services/filters.js";
import {
  creativesForApp,
  duplicates,
  gaps,
  iosOnly,
  mismatches,
  publishingSummary,
  rejections,
  sharedConcepts,
  unpublishedEverywhere,
} from "../services/publishing.js";

export const publishingRouter = Router();

publishingRouter.get(
  "/publishing",
  asyncRoute(async (req, res) => {
    const f = parseFilters(req.query);
    const catalog = await getCatalog();
    const app = f.app;

    const mm = mismatches(catalog.placements, app);
    const summary = publishingSummary(catalog, app);

    const dto: PublishingDto = {
      summary: { ...summary, mismatches: mm.length },
      creatives: creativesForApp(catalog, app),
      livePlacements: catalog.placements.filter(
        (p) => (app === "all" || p.appKey === app) && (p.sheetStatus === "yes" || p.sheetStatus === "ios"),
      ),
      gaps: gaps(catalog, app),
      rejections: rejections(catalog, app),
      iosOnly: iosOnly(catalog, app),
      mismatches: mm,
      duplicates: duplicates(catalog, app),
      sharedConcepts: sharedConcepts(catalog),
    };
    res.json(dto);
  }),
);

publishingRouter.get(
  "/unpublished",
  asyncRoute(async (req, res) => {
    const f = parseFilters(req.query);
    const catalog = await getCatalog();
    const app = f.app;

    const nowhere = unpublishedEverywhere(catalog, app);
    const gapRows = gaps(catalog, app);
    const ios = iosOnly(catalog, app);

    const dto: UnpublishedDto = {
      nowhere,
      gaps: gapRows,
      iosOnly: ios,
      counts: { nowhere: nowhere.length, gaps: gapRows.length, iosOnly: ios.length },
    };
    res.json(dto);
  }),
);
