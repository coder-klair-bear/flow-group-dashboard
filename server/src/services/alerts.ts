/**
 * "Needs your attention". Most of these are worked out from the sheets and are
 * therefore real today; the last three come from sample delivery numbers and
 * say so. Each alert carries both languages so the client can switch without a
 * round trip.
 */

import type { AlertDto } from "../shared/types.js";
import type { Catalog } from "./catalog.js";
import type { Filters } from "./filters.js";
import { getHighCostCreatives, getInactivePlacements } from "./performance.js";
import {
  countryCoverage,
  gaps,
  iosOnly,
  mismatches,
  platformCoverage,
  rejections,
  unpublishedEverywhere,
} from "./publishing.js";

const UNITY_NOTE_SV =
  "Unity Ads finns inte i något av dina ark ännu, så kolumnen är tom. Vi lägger till den i steg 4.";
const UNITY_NOTE_EN =
  "Unity Ads is not in either of your sheets yet, so the column is empty. We add it in stage 4.";

export async function buildAlerts(catalog: Catalog, f: Filters, today: string): Promise<AlertDto[]> {
  const app = f.app;
  const out: AlertDto[] = [];

  const shortOf = (key: string) =>
    catalog.platforms.find((p) => p.key === key)?.short ?? key;
  const countryName = (code: string, lang: "sv" | "en") => {
    const c = catalog.countries.find((x) => x.code === code);
    return c ? (lang === "sv" ? c.nameSv : c.nameEn) : code;
  };

  /* ------------------------------------------------ real, from the sheets */

  const nowhere = unpublishedEverywhere(catalog, app);
  if (nowhere.length) {
    const list = nowhere.map((c) => `${c.id} ${c.name}`).join(" · ");
    out.push({
      id: "unpublished",
      severity: "bad",
      titleSv: `${nowhere.length} kreativ ligger inte ute någonstans`,
      titleEn: `${nowhere.length} creatives are not out anywhere`,
      detailSv: list,
      detailEn: list,
      target: "publish",
      fromSheet: true,
    });
  }

  const rejected = rejections(catalog, app);
  if (rejected.length) {
    const list = rejected.map((r) => `${r.creativeId} → ${shortOf(r.platformKey)}`).join(" · ");
    out.push({
      id: "rejected",
      severity: "bad",
      titleSv: `${rejected.length} annonser är nekade`,
      titleEn: `${rejected.length} ads were rejected`,
      detailSv: list,
      detailEn: list,
      target: "publish",
      fromSheet: true,
    });
  }

  const worstCountry = countryCoverage(catalog, app)[0];
  if (worstCountry && worstCountry.pct < 60) {
    out.push({
      id: "country-coverage",
      severity: "warn",
      titleSv: `${countryName(worstCountry.countryCode, "sv")} har lägst täckning: ${worstCountry.pct} %`,
      titleEn: `${countryName(worstCountry.countryCode, "en")} has the lowest coverage: ${worstCountry.pct} %`,
      detailSv: `${Math.round(worstCountry.filled)} av ${worstCountry.total} plattformsplatser är fyllda`,
      detailEn: `${Math.round(worstCountry.filled)} of ${worstCountry.total} platform slots are filled`,
      target: "publish",
      fromSheet: true,
    });
  }

  const coverage = platformCoverage(catalog, app).filter((c) => c.inSheet);
  const worstPlatform = coverage.reduce<(typeof coverage)[number] | null>(
    (worst, c) => (!worst || c.pct < worst.pct ? c : worst),
    null,
  );
  if (worstPlatform && worstPlatform.pct < 70) {
    const short = shortOf(worstPlatform.platformKey);
    out.push({
      id: "platform-coverage",
      severity: "warn",
      titleSv: `${short} släpar efter: ${worstPlatform.pct} % av kreativen är uppe`,
      titleEn: `${short} is behind: ${worstPlatform.pct} % of creatives are up`,
      detailSv: `${worstPlatform.missing} kreativ saknas helt på ${short}`,
      detailEn: `${worstPlatform.missing} creatives are missing entirely on ${short}`,
      target: "publish",
      fromSheet: true,
    });
  }

  const ios = iosOnly(catalog, app);
  if (ios.length) {
    const list = ios.map((r) => `${r.creativeId} → ${shortOf(r.platformKey)}`).join(" · ");
    out.push({
      id: "ios-only",
      severity: "warn",
      titleSv: `${ios.length} kreativ körs bara på iOS`,
      titleEn: `${ios.length} creatives run on iOS only`,
      detailSv: list,
      detailEn: list,
      target: "creatives",
      fromSheet: true,
    });
  }

  const gapRows = gaps(catalog, app);
  if (gapRows.length) {
    out.push({
      id: "gaps",
      severity: "warn",
      titleSv: `${gapRows.length} luckor att fylla`,
      titleEn: `${gapRows.length} gaps to fill`,
      detailSv:
        "Kreativ som ligger ute på en plattform men saknas på en annan där resten av appen finns.",
      detailEn:
        "Creatives that are out on one platform but missing on another where the rest of the app is.",
      target: "unpub",
      fromSheet: true,
    });
  }

  out.push({
    id: "unity",
    severity: "info",
    titleSv: "Unity Ads saknas i båda arken",
    titleEn: "Unity Ads is missing from both sheets",
    detailSv: UNITY_NOTE_SV,
    detailEn: UNITY_NOTE_EN,
    target: "publish",
    fromSheet: true,
  });

  /* --------------------------------------------- sample, from the numbers */

  const inactive = await getInactivePlacements(f, 7, today);
  if (inactive.length) {
    const named = catalog.placements
      .filter((p) => inactive.includes(p.id))
      .slice(0, 4)
      .map((p) => `${p.creativeId} ${shortOf(p.platformKey)} ${p.countryCode}`)
      .join(" · ");
    const more = inactive.length > 4 ? " …" : "";
    out.push({
      id: "inactive",
      severity: "warn",
      titleSv: `${inactive.length} inaktiva annonser`,
      titleEn: `${inactive.length} inactive ads`,
      detailSv: `Uppladdade men utan leverans de senaste 7 dagarna. ${named}${more}`,
      detailEn: `Uploaded but with no delivery in the last 7 days. ${named}${more}`,
      target: "publish",
      fromSheet: false,
    });
  }

  const highCost = await getHighCostCreatives(f, 30, today);
  if (highCost.length) {
    const named = highCost
      .slice(0, 3)
      .map((h) => `${h.creativeId} ${Math.round(h.cpi)} kr`)
      .join(" · ");
    out.push({
      id: "high-cost",
      severity: "bad",
      titleSv: `${highCost.length} ovanligt hög kostnad per installation`,
      titleEn: `${highCost.length} unusually high cost per install`,
      detailSv: `Minst 75 % över snittet för samma app. ${named}`,
      detailEn: `At least 75 % above the average for the same app. ${named}`,
      target: "top",
      fromSheet: false,
    });
  }

  const mm = mismatches(catalog.placements, app);
  if (mm.length) {
    out.push({
      id: "mismatch",
      severity: "warn",
      titleSv: `${mm.length} skillnader mot plattformarna (exempel)`,
      titleEn: `${mm.length} differences against the platforms (sample)`,
      detailSv: "Arket och plattformen säger olika saker. Blir riktigt i steg 5.",
      detailEn: "The sheet and the platform disagree. Becomes real in stage 5.",
      target: "publish",
      fromSheet: false,
    });
  }

  return out;
}
