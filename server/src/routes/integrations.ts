import { asc } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/client.js";
import * as t from "../db/schema.js";
import { asyncRoute } from "../lib/http.js";
import type { IntegrationDto, IntegrationsDto } from "../shared/types.js";
import { getCatalog } from "../services/catalog.js";

export const integrationsRouter = Router();

integrationsRouter.get(
  "/integrations",
  asyncRoute(async (_req, res) => {
    const [rows, catalog] = await Promise.all([
      db.select().from(t.integrations).orderBy(asc(t.integrations.sortOrder)),
      getCatalog(),
    ]);

    const sources: IntegrationDto[] = rows.map((r) => ({
      key: r.key,
      name: r.name,
      logo: r.logo,
      color: r.color,
      kind: r.kind,
      detail: r.detail,
      apiName: r.apiName,
      needsSv: r.needsSv,
      needsEn: r.needsEn,
      state: r.state,
      demoState: r.demoState,
      lastSyncAt: r.lastSyncAt ? r.lastSyncAt.toISOString() : null,
      accounts:
        r.kind === "ads" ? catalog.accounts.filter((a) => a.platformKey === r.key) : [],
    }));

    const dto: IntegrationsDto = {
      sources,
      allSample: sources.every((s) => s.state !== "ok"),
    };
    res.json(dto);
  }),
);
