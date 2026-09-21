/**
 * Everything derived from the sheets rather than from delivery numbers:
 * coverage, gaps, rejections, iOS-only uploads and likely duplicates.
 *
 * All of it is real. The only sample part of the publishing view is the
 * comparison against what the platforms themselves report, which is marked as
 * sample wherever it appears.
 */

import type {
  CountryCoverage,
  CreativeDto,
  DuplicateRow,
  GapRow,
  MismatchRow,
  PlacementDto,
  PlatformCoverage,
  PlatformDto,
  RejectionRow,
  SharedConceptRow,
} from "../shared/types.js";
import type { Catalog } from "./catalog.js";

export function creativesForApp(catalog: Catalog, app: string): CreativeDto[] {
  return app === "all" ? catalog.creatives : catalog.creatives.filter((c) => c.appKey === app);
}

function isOut(c: CreativeDto, platformKey: string): boolean {
  const s = c.statuses[platformKey];
  return s === "yes" || s === "ios";
}

/** Platforms the creative is already out on, by key. */
export function outOn(c: CreativeDto, sheetPlatforms: PlatformDto[]): string[] {
  return sheetPlatforms.filter((p) => isOut(c, p.key)).map((p) => p.key);
}

/**
 * Share of platform slots filled, per platform.
 * An iOS-only upload counts as half a slot: it is out, but only halfway.
 */
export function platformCoverage(catalog: Catalog, app: string): PlatformCoverage[] {
  const list = creativesForApp(catalog, app);
  return catalog.platforms.map((p) => {
    if (!p.inSheet) {
      return {
        platformKey: p.key,
        inSheet: false,
        yes: 0,
        ios: 0,
        rejected: 0,
        missing: 0,
        total: list.length,
        pct: 0,
      };
    }
    let yes = 0;
    let ios = 0;
    let rejected = 0;
    let missing = 0;
    for (const c of list) {
      const s = c.statuses[p.key] ?? "no";
      if (s === "yes") yes++;
      else if (s === "ios") ios++;
      else if (s === "rej") rejected++;
      else missing++;
    }
    const total = list.length;
    return {
      platformKey: p.key,
      inSheet: true,
      yes,
      ios,
      rejected,
      missing,
      total,
      pct: total ? Math.round(((yes + ios * 0.5) / total) * 100) : 0,
    };
  });
}

/** Coverage per country, worst first — the country most worth fixing. */
export function countryCoverage(catalog: Catalog, app: string): CountryCoverage[] {
  const map = new Map<string, { filled: number; total: number }>();
  for (const c of creativesForApp(catalog, app)) {
    for (const code of c.countries) {
      const entry = map.get(code) ?? { filled: 0, total: 0 };
      for (const p of catalog.sheetPlatforms) {
        const s = c.statuses[p.key] ?? "no";
        entry.total++;
        if (s === "yes") entry.filled += 1;
        else if (s === "ios") entry.filled += 0.5;
      }
      map.set(code, entry);
    }
  }
  return [...map.entries()]
    .map(([countryCode, v]) => ({
      countryCode,
      filled: v.filled,
      total: v.total,
      pct: v.total ? Math.round((v.filled / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct);
}

/** Finished creatives that no platform has received at all. */
export function unpublishedEverywhere(catalog: Catalog, app: string): CreativeDto[] {
  return creativesForApp(catalog, app).filter((c) =>
    catalog.sheetPlatforms.every((p) => (c.statuses[p.key] ?? "no") === "no"),
  );
}

/** Out on at least one platform, missing on another. */
export function gaps(catalog: Catalog, app: string): GapRow[] {
  const out: GapRow[] = [];
  for (const c of creativesForApp(catalog, app)) {
    const already = outOn(c, catalog.sheetPlatforms);
    if (!already.length) continue;
    for (const p of catalog.sheetPlatforms) {
      if ((c.statuses[p.key] ?? "no") === "no") {
        out.push({ creativeId: c.id, platformKey: p.key, outOn: already });
      }
    }
  }
  return out;
}

export function rejections(catalog: Catalog, app: string): RejectionRow[] {
  const out: RejectionRow[] = [];
  for (const c of creativesForApp(catalog, app)) {
    for (const p of catalog.sheetPlatforms) {
      if (c.statuses[p.key] === "rej") out.push({ creativeId: c.id, platformKey: p.key });
    }
  }
  return out;
}

export function iosOnly(catalog: Catalog, app: string): RejectionRow[] {
  const out: RejectionRow[] = [];
  for (const c of creativesForApp(catalog, app)) {
    for (const p of catalog.sheetPlatforms) {
      if (c.statuses[p.key] === "ios") out.push({ creativeId: c.id, platformKey: p.key });
    }
  }
  return out;
}

/* ------------------------------------------------------- name matching ---- */

const STOPWORDS = new Set(["a", "an", "the", "en", "ett", "de", "den", "det", "is", "ar"]);

/**
 * Normalises a creative name enough to compare ideas rather than spellings.
 * Swedish vowels are folded, and the "bild ads" / "bld ads" prefix the sheets
 * use as a format marker is stripped so it does not dominate the comparison.
 */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/é/g, "e")
    .replace(/\b(bild ads|bld ads|bildads|image ads)\b/g, " ")
    .replace(/\(?\s*3\s*st\s*\)?/g, " ");
}

function tokens(name: string): string[] {
  return normalise(name)
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

function conceptKey(name: string): string {
  return tokens(name).join("");
}

function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  // A prefix match catches the sheets' inconsistent endings ("skillnad" vs
  // "skillnaden") without matching short words to each other by accident.
  return a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a));
}

export function sameConcept(a: string, b: string): boolean {
  const x = tokens(a);
  const y = tokens(b);
  if (!x.length || !y.length) return false;
  if (conceptKey(a) === conceptKey(b)) return true;

  let hits = 0;
  const used = new Set<number>();
  for (const token of x) {
    for (let i = 0; i < y.length; i++) {
      if (!used.has(i) && tokensMatch(token, y[i]!)) {
        used.add(i);
        hits++;
        break;
      }
    }
  }
  const union = x.length + y.length - hits;
  return union > 0 && hits / union >= 0.67;
}

/**
 * Two creatives count as duplicates only when they are the same idea in the
 * same app AND share a market. The same idea localised for another country is
 * normal practice, not a mistake.
 */
export function duplicates(catalog: Catalog, app: string): DuplicateRow[] {
  const list = creativesForApp(catalog, app);
  const out: DuplicateRow[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]!;
      const b = list[j]!;
      if (a.appKey !== b.appKey) continue;
      const shared = a.countries.filter((cc) => b.countries.includes(cc));
      if (shared.length && sameConcept(a.name, b.name)) {
        out.push({ a: a.id, b: b.id, countries: shared });
      }
    }
  }
  return out;
}

/** The same idea running in several markets — shown so it is not mistaken for a duplicate. */
export function sharedConcepts(catalog: Catalog): SharedConceptRow[] {
  const groups: SharedConceptRow[] = [];
  const used = new Set<string>();
  for (const a of catalog.creatives) {
    if (used.has(a.id)) continue;
    const group = [a];
    for (const b of catalog.creatives) {
      if (b.id === a.id || used.has(b.id)) continue;
      if (sameConcept(a.name, b.name)) group.push(b);
    }
    if (group.length > 1) {
      for (const c of group) used.add(c.id);
      groups.push({ creativeIds: group.map((c) => c.id), name: a.name });
    }
  }
  return groups;
}

/* -------------------------------------------------- platform comparison --- */

/**
 * SAMPLE. Where the sheet and the platform disagree. Becomes real in stage 5,
 * when the platform APIs supply `platform_state` instead of the generator.
 */
export function mismatches(placements: PlacementDto[], app: string): MismatchRow[] {
  const out: MismatchRow[] = [];
  for (const p of placements) {
    if (app !== "all" && p.appKey !== app) continue;
    if (p.platformState === "missing") out.push({ placement: p, kind: "missing" });
    else if (p.platformState === "orphan") out.push({ placement: p, kind: "orphan" });
    else if (p.platformState === "paused") out.push({ placement: p, kind: "paused" });
  }
  return out;
}

export function publishingSummary(catalog: Catalog, app: string) {
  const list = creativesForApp(catalog, app);
  let uploaded = 0;
  let missing = 0;
  let rejected = 0;
  let ios = 0;
  let slots = 0;
  for (const c of list) {
    for (const p of catalog.sheetPlatforms) {
      slots++;
      const s = c.statuses[p.key] ?? "no";
      if (s === "yes") uploaded++;
      else if (s === "ios") ios++;
      else if (s === "rej") rejected++;
      else missing++;
    }
  }
  return { uploaded, missing, iosOnly: ios, rejected, slots };
}
