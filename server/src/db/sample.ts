/**
 * SAMPLE DATA GENERATOR.
 *
 * Everything in here is invented: publish dates, campaign and ad set names, the
 * platform-side state, and every delivery number. It exists so the dashboard can
 * be judged on how it behaves before the platform APIs are connected in stage 5.
 *
 * It lives next to the seed on purpose. The generator writes rows into the same
 * tables the real connectors will write into, so switching a platform to live
 * data is a matter of replacing that platform's rows — no query, endpoint or
 * component changes.
 */

import { addDays, startOfToday, toIso } from "../lib/dates.js";
import { hash, rng } from "../lib/rng.js";
import type { PlatformState, SheetStatus } from "../shared/types.js";
import { SOURCE_CREATIVES, SOURCE_PLATFORMS, type SourceCreative } from "./source-data.js";

/** Short codes used to build the recommended campaign naming convention. */
const PLATFORM_CODE: Record<string, string> = {
  tiktok: "TT",
  meta: "MT",
  google: "GG",
  snap: "SN",
  unity: "UN",
};

const APP_CODE: Record<string, string> = {
  sveapanelen: "SVE",
  rewly: "REW",
};

/** Rough per-platform baselines: CPM in SEK, CTR and CVR in per cent. */
const PLATFORM_BASE: Record<string, { cpm: number; ctr: number; cvr: number }> = {
  tiktok: { cpm: 38, ctr: 1.55, cvr: 5.2 },
  meta: { cpm: 52, ctr: 1.15, cvr: 6.6 },
  google: { cpm: 33, ctr: 1.95, cvr: 4.4 },
  snap: { cpm: 28, ctr: 1.35, cvr: 3.9 },
  unity: { cpm: 24, ctr: 2.4, cvr: 3.1 },
};

/** Relative market size, Sweden = 1. */
const COUNTRY_BASE: Record<string, number> = {
  SE: 1,
  DK: 0.72,
  FI: 0.66,
  NO: 0.7,
  NL: 0.85,
  FR: 0.55,
  DE: 0.95,
};

export interface GeneratedPlacement {
  creativeId: string;
  appKey: string;
  countryCode: string;
  platformKey: string;
  campaign: string;
  adSet: string;
  osIos: boolean;
  osAndroid: boolean;
  sheetStatus: SheetStatus;
  platformState: PlatformState;
  publishedOn: string | null;
  iosShare: number;
  quality: number;
  isLive: boolean;
}

export interface GeneratedMetric {
  creativeId: string;
  platformKey: string;
  countryCode: string;
  day: string;
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
}

/**
 * One placement per creative x country x platform, for the four platforms that
 * have a column in the sheets. Unity is deliberately left out: it has no column
 * yet, and inventing rows for it would hide that gap instead of showing it.
 */
export function generatePlacements(salt: string, today = startOfToday()): GeneratedPlacement[] {
  const out: GeneratedPlacement[] = [];
  const sheetPlatforms = SOURCE_PLATFORMS.filter((p) => p.inSheet);

  for (const creative of SOURCE_CREATIVES) {
    for (const countryCode of creative.countries) {
      for (const platform of sheetPlatforms) {
        const status: SheetStatus = creative.statuses[platform.key] ?? "no";
        const r = rng(hash(`${salt}|${creative.id}|${platform.key}|${countryCode}`));
        const isLive = status === "yes" || status === "ios";

        // The platform side is deliberately not identical to the sheet: the
        // whole point of the publishing view is showing where they disagree.
        const roll = r();
        let platformState: PlatformState = "none";
        if (isLive) platformState = roll < 0.14 ? "paused" : roll < 0.19 ? "missing" : "live";
        if (status === "rej") platformState = "rejected";
        if (status === "no") platformState = roll < 0.06 ? "orphan" : "none";

        const publishedOn = isLive ? toIso(addDays(today, -(6 + Math.floor(r() * 104)))) : null;
        const iosShare = status === "ios" ? 1 : 0.42 + r() * 0.24;
        const quality = 0.45 + r() * 1.25;

        out.push({
          creativeId: creative.id,
          appKey: creative.app,
          countryCode,
          platformKey: platform.key,
          campaign: `${APP_CODE[creative.app] ?? "APP"}_${countryCode}_${PLATFORM_CODE[platform.key] ?? "XX"}_INSTALL`,
          adSet: `${countryCode}_${status === "ios" ? "iOS" : "iOS+Android"}_Broad`,
          osIos: true,
          osAndroid: status !== "ios",
          sheetStatus: status,
          platformState,
          publishedOn,
          iosShare,
          quality,
          isLive,
        });
      }
    }
  }

  // The sheet calls SVE-002 the best performing video. Nudge it up so the
  // sample numbers agree with what the client already knows to be true.
  for (const p of out) {
    if (p.creativeId === "SVE-002") p.quality = 1.55 + (p.quality - 0.45) * 0.12;
  }

  return out;
}

/** Daily delivery for every placement that is actually out on its platform. */
export function generateMetrics(
  placements: GeneratedPlacement[],
  salt: string,
  days: number,
  today = startOfToday(),
): GeneratedMetric[] {
  const out: GeneratedMetric[] = [];
  const start = addDays(today, -(days - 1));

  for (const p of placements) {
    if (!p.isLive || p.platformState === "missing") continue;

    const base = PLATFORM_BASE[p.platformKey];
    if (!base) continue;
    const marketSize = COUNTRY_BASE[p.countryCode] ?? 0.7;

    const r = rng(hash(`${salt}|${p.creativeId}|${p.platformKey}|${p.countryCode}|perf`));
    const startOffset = Math.floor(r() * 40);

    for (let i = startOffset; i < days; i++) {
      // A paused placement stopped delivering a week and a half ago.
      if (p.platformState === "paused" && i > days - 12) continue;

      const day = addDays(start, i);
      const dow = day.getDay();
      const weekend = dow === 0 || dow === 6 ? 0.88 : 1;
      const rr = rng(hash(`${salt}|${p.creativeId}|${p.platformKey}|${p.countryCode}|${toIso(day)}`));

      const noise = 0.72 + rr() * 0.58;
      const ramp = 0.75 + 0.45 * (i / days);
      const impressions = Math.round(2400 * p.quality * marketSize * weekend * noise * ramp);
      if (impressions < 40) continue;

      const ctr = base.ctr * (0.72 + rr() * 0.62) * (0.85 + p.quality * 0.22);
      const clicks = Math.max(1, Math.round((impressions * ctr) / 100));
      const cvr = base.cvr * (0.7 + rr() * 0.66);
      const installs = Math.round((clicks * cvr) / 100);
      const spend = (impressions / 1000) * base.cpm * (0.82 + rr() * 0.4);

      out.push({
        creativeId: p.creativeId,
        platformKey: p.platformKey,
        countryCode: p.countryCode,
        day: toIso(day),
        impressions,
        clicks,
        installs,
        spend: Math.round(spend * 100) / 100,
      });
    }
  }

  return out;
}

export function creativeById(id: string): SourceCreative | undefined {
  return SOURCE_CREATIVES.find((c) => c.id === id);
}
