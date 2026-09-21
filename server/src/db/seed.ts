/**
 * Seeds the database.
 *
 * Real data (apps, countries, platforms, creatives, their countries and their
 * status per platform) is transcribed from the two publish trackers.
 * Sample data (placements, publish dates, campaign names, daily metrics) comes
 * from the generator and is marked as sample in the rows themselves.
 *
 * Safe to re-run: it truncates and rebuilds everything.
 */

import { sql } from "drizzle-orm";
import { SEED_DAYS, SEED_SALT } from "../env.js";
import { startOfToday, toIso } from "../lib/dates.js";
import { closeDb, db } from "./client.js";
import { generateMetrics, generatePlacements } from "./sample.js";
import * as t from "./schema.js";
import {
  SAMPLE_ACCOUNT_IDS,
  SOURCE_APPS,
  SOURCE_COUNTRIES,
  SOURCE_CREATIVES,
  SOURCE_INTEGRATIONS,
  SOURCE_PLATFORMS,
} from "./source-data.js";

const CHUNK = 1000;

function chunked<T>(rows: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

async function main(): Promise<void> {
  const today = startOfToday();
  console.log(`Seeding as of ${toIso(today)} (salt "${SEED_SALT}", ${SEED_DAYS} days of metrics)`);

  await db.execute(sql`
    truncate table
      ${t.dailyMetrics}, ${t.placements}, ${t.creativeStatuses}, ${t.creativeCountries},
      ${t.creatives}, ${t.adAccounts}, ${t.integrations}, ${t.platforms}, ${t.countries}, ${t.apps}
    restart identity cascade
  `);

  /* ------------------------------------------------------------ reference */

  await db.insert(t.apps).values(
    SOURCE_APPS.map((a, i) => ({
      key: a.key,
      label: a.label,
      color: a.color,
      sortOrder: i,
    })),
  );

  await db.insert(t.countries).values(
    SOURCE_COUNTRIES.map((c) => ({
      code: c.code,
      nameSv: c.nameSv,
      nameEn: c.nameEn,
    })),
  );

  await db.insert(t.platforms).values(
    SOURCE_PLATFORMS.map((p, i) => ({
      key: p.key,
      name: p.name,
      short: p.short,
      color: p.color,
      inSheet: p.inSheet,
      sortOrder: i,
    })),
  );

  await db.insert(t.integrations).values(
    SOURCE_INTEGRATIONS.map((s, i) => ({
      key: s.key,
      name: s.name,
      logo: s.logo,
      color: s.color,
      kind: s.kind,
      detail: s.detail,
      apiName: s.apiName,
      needsSv: s.needsSv,
      needsEn: s.needsEn,
      state: s.state,
      demoState: s.demoState,
      lastSyncAt: null,
      sortOrder: i,
    })),
  );

  /* -------------------------------------------------------- ad accounts */

  const accountRows = SOURCE_APPS.flatMap((app) =>
    SOURCE_PLATFORMS.map((platform) => ({
      appKey: app.key,
      platformKey: platform.key,
      externalId: SAMPLE_ACCOUNT_IDS[app.key]?.[platform.key] ?? "–",
      name: `Flow Group AB — ${app.label}`,
      isSample: true,
    })),
  );
  const insertedAccounts = await db.insert(t.adAccounts).values(accountRows).returning({
    id: t.adAccounts.id,
    appKey: t.adAccounts.appKey,
    platformKey: t.adAccounts.platformKey,
  });
  const accountId = new Map(
    insertedAccounts.map((a) => [`${a.appKey}|${a.platformKey}`, a.id] as const),
  );

  /* ---------------------------------------------------------- creatives */

  await db.insert(t.creatives).values(
    SOURCE_CREATIVES.map((c, i) => ({
      id: c.id,
      appKey: c.app,
      name: c.name,
      type: c.type,
      link: c.link,
      linkType: c.linkType,
      noteSv: c.noteSv ?? null,
      noteEn: c.noteEn ?? null,
      bundle: c.bundle ?? null,
      flagBest: c.flagBest ?? false,
      flagTypo: c.flagTypo ?? false,
      sortOrder: i,
    })),
  );

  await db.insert(t.creativeCountries).values(
    SOURCE_CREATIVES.flatMap((c) =>
      c.countries.map((countryCode) => ({ creativeId: c.id, countryCode })),
    ),
  );

  await db.insert(t.creativeStatuses).values(
    SOURCE_CREATIVES.flatMap((c) =>
      Object.entries(c.statuses).map(([platformKey, status]) => ({
        creativeId: c.id,
        platformKey,
        status,
      })),
    ),
  );

  /* --------------------------------------------------------- placements */

  const generated = generatePlacements(SEED_SALT, today);
  const insertedPlacements = await db
    .insert(t.placements)
    .values(
      generated.map((p) => ({
        creativeId: p.creativeId,
        appKey: p.appKey,
        countryCode: p.countryCode,
        platformKey: p.platformKey,
        accountId: accountId.get(`${p.appKey}|${p.platformKey}`) ?? null,
        campaign: p.campaign,
        adSet: p.adSet,
        osIos: p.osIos,
        osAndroid: p.osAndroid,
        sheetStatus: p.sheetStatus,
        platformState: p.platformState,
        publishedOn: p.publishedOn,
        iosShare: p.iosShare,
        quality: p.quality,
        isLive: p.isLive,
      })),
    )
    .returning({
      id: t.placements.id,
      creativeId: t.placements.creativeId,
      platformKey: t.placements.platformKey,
      countryCode: t.placements.countryCode,
    });

  const placementId = new Map(
    insertedPlacements.map(
      (p) => [`${p.creativeId}|${p.platformKey}|${p.countryCode}`, p.id] as const,
    ),
  );

  /* ------------------------------------------------------ daily metrics */

  const metrics = generateMetrics(generated, SEED_SALT, SEED_DAYS, today);
  const metricRows = metrics
    .map((m) => {
      const id = placementId.get(`${m.creativeId}|${m.platformKey}|${m.countryCode}`);
      if (id == null) return null;
      return {
        day: m.day,
        placementId: id,
        impressions: m.impressions,
        clicks: m.clicks,
        installs: m.installs,
        spend: m.spend.toFixed(2),
        isSample: true,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  for (const batch of chunked(metricRows)) {
    await db.insert(t.dailyMetrics).values(batch);
  }

  console.log(
    [
      `  apps            ${SOURCE_APPS.length}`,
      `  countries       ${SOURCE_COUNTRIES.length}`,
      `  platforms       ${SOURCE_PLATFORMS.length} (${SOURCE_PLATFORMS.filter((p) => p.inSheet).length} in the sheets)`,
      `  creatives       ${SOURCE_CREATIVES.length}   [real]`,
      `  ad accounts     ${accountRows.length}   [sample ids]`,
      `  placements      ${insertedPlacements.length}   [sample campaign names and dates]`,
      `  daily metrics   ${metricRows.length}   [sample]`,
    ].join("\n"),
  );
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
