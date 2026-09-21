import { Router } from "express";
import { asyncRoute } from "../lib/http.js";
import { invalidateCatalog } from "../services/catalog.js";
import { creativesRouter } from "./creatives.js";
import { integrationsRouter } from "./integrations.js";
import { metaRouter } from "./meta.js";
import { overviewRouter } from "./overview.js";
import { performanceRouter } from "./performance.js";
import { publishingRouter } from "./publishing.js";
import { topRouter } from "./top.js";

export const api = Router();

api.get("/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

/** Drops the in-memory catalogue cache. The refresh button calls this. */
api.post(
  "/refresh",
  asyncRoute(async (_req, res) => {
    invalidateCatalog();
    res.json({ ok: true, at: new Date().toISOString() });
  }),
);

api.use(metaRouter);
api.use(overviewRouter);
api.use(creativesRouter);
api.use(performanceRouter);
api.use(topRouter);
api.use(publishingRouter);
api.use(integrationsRouter);
