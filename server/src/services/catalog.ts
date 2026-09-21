/**
 * Loads the parts of the dataset that come straight from the sheets and are
 * small enough to hold in memory: apps, countries, platforms, and all 41
 * creatives with their countries and per-platform status.
 *
 * Cached briefly so a page that fires four requests does not re-read it four
 * times. The cache is cleared by `invalidateCatalog()` after a reseed.
 */

import { asc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import * as t from "../db/schema.js";
import type {
  AdAccountDto,
  AppDto,
  CountryDto,
  CreativeDto,
  PlacementDto,
  PlacementStatus,
  PlatformDto,
  SheetStatus,
} from "../shared/types.js";

export interface Catalog {
  apps: AppDto[];
  countries: CountryDto[];
  platforms: PlatformDto[];
  /** Only the platforms that actually have a column in the sheets. */
  sheetPlatforms: PlatformDto[];
  creatives: CreativeDto[];
  creativeById: Map<string, CreativeDto>;
  accounts: AdAccountDto[];
  placements: PlacementDto[];
  campaigns: string[];
  loadedAt: Date;
}

const TTL_MS = 30_000;
let cache: { value: Catalog; at: number } | null = null;

export function invalidateCatalog(): void {
  cache = null;
}

export async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const value = await loadCatalog();
  cache = { value, at: Date.now() };
  return value;
}

async function loadCatalog(): Promise<Catalog> {
  const [appRows, countryRows, platformRows, creativeRows, countryLinks, statusLinks, accountRows, placementRows] =
    await Promise.all([
      db.select().from(t.apps).orderBy(asc(t.apps.sortOrder)),
      db.select().from(t.countries).orderBy(asc(t.countries.code)),
      db.select().from(t.platforms).orderBy(asc(t.platforms.sortOrder)),
      db.select().from(t.creatives).orderBy(asc(t.creatives.sortOrder)),
      db.select().from(t.creativeCountries),
      db.select().from(t.creativeStatuses),
      db.select().from(t.adAccounts),
      db
        .select({
          id: t.placements.id,
          creativeId: t.placements.creativeId,
          creativeName: t.creatives.name,
          appKey: t.placements.appKey,
          countryCode: t.placements.countryCode,
          platformKey: t.placements.platformKey,
          campaign: t.placements.campaign,
          adSet: t.placements.adSet,
          osIos: t.placements.osIos,
          osAndroid: t.placements.osAndroid,
          sheetStatus: t.placements.sheetStatus,
          platformState: t.placements.platformState,
          publishedOn: t.placements.publishedOn,
          accountExternalId: t.adAccounts.externalId,
        })
        .from(t.placements)
        .innerJoin(t.creatives, eq(t.placements.creativeId, t.creatives.id))
        .leftJoin(t.adAccounts, eq(t.placements.accountId, t.adAccounts.id))
        .orderBy(asc(t.placements.id)),
    ]);

  const countriesOf = new Map<string, string[]>();
  for (const link of countryLinks) {
    const list = countriesOf.get(link.creativeId) ?? [];
    list.push(link.countryCode);
    countriesOf.set(link.creativeId, list);
  }

  const statusesOf = new Map<string, Record<string, SheetStatus>>();
  for (const link of statusLinks) {
    const map = statusesOf.get(link.creativeId) ?? {};
    map[link.platformKey] = link.status;
    statusesOf.set(link.creativeId, map);
  }

  const platforms: PlatformDto[] = platformRows.map((p) => ({
    key: p.key,
    name: p.name,
    short: p.short,
    color: p.color,
    inSheet: p.inSheet,
  }));
  const sheetPlatforms = platforms.filter((p) => p.inSheet);

  const creatives: CreativeDto[] = creativeRows.map((c) => ({
    id: c.id,
    appKey: c.appKey,
    name: c.name,
    type: c.type,
    link: c.link,
    linkType: c.linkType,
    noteSv: c.noteSv,
    noteEn: c.noteEn,
    bundle: c.bundle,
    flagBest: c.flagBest,
    flagTypo: c.flagTypo,
    // Keep the sheet's own market order rather than sorting alphabetically.
    countries: countriesOf.get(c.id) ?? [],
    statuses: statusesOf.get(c.id) ?? {},
  }));

  const creativeById = new Map(creatives.map((c) => [c.id, c]));

  const placements: PlacementDto[] = placementRows.map((p) => {
    const creative = creativeById.get(p.creativeId);
    const os: ("ios" | "android")[] = [];
    if (p.osIos) os.push("ios");
    if (p.osAndroid) os.push("android");
    return {
      id: p.id,
      creativeId: p.creativeId,
      creativeName: p.creativeName,
      appKey: p.appKey,
      countryCode: p.countryCode,
      platformKey: p.platformKey,
      campaign: p.campaign,
      adSet: p.adSet,
      os,
      sheetStatus: p.sheetStatus,
      platformState: p.platformState,
      publishedOn: p.publishedOn,
      accountExternalId: p.accountExternalId ?? "–",
      status: placementStatus(p.sheetStatus, p.platformState, creative, sheetPlatforms),
    };
  });

  const campaigns = [...new Set(placements.map((p) => p.campaign))].sort();

  return {
    apps: appRows.map((a) => ({ key: a.key, label: a.label, color: a.color })),
    countries: countryRows.map((c) => ({ code: c.code, nameSv: c.nameSv, nameEn: c.nameEn })),
    platforms,
    sheetPlatforms,
    creatives,
    creativeById,
    accounts: accountRows.map((a) => ({
      appKey: a.appKey,
      platformKey: a.platformKey,
      externalId: a.externalId,
      name: a.name,
      isSample: a.isSample,
    })),
    placements,
    campaigns,
    loadedAt: new Date(),
  };
}

/**
 * The single status shown in the "status on the platform" column.
 * A creative that is out nowhere at all reads as planned rather than as a gap:
 * nothing is missing from a platform if the creative has never gone out.
 */
export function placementStatus(
  sheetStatus: SheetStatus,
  platformState: string,
  creative: CreativeDto | undefined,
  sheetPlatforms: PlatformDto[],
): PlacementStatus {
  if (sheetStatus === "rej") return "rejected";
  if (sheetStatus === "no") {
    const outAnywhere = sheetPlatforms.some((p) => {
      const s = creative?.statuses[p.key];
      return s === "yes" || s === "ios";
    });
    return outAnywhere ? "notpub" : "planned";
  }
  if (platformState === "paused") return "paused";
  if (platformState === "missing") return "missing";
  return "live";
}
