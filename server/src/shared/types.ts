/**
 * The API contract. This file contains types only — no runtime values — so the
 * web app can import it with `import type` and never pull server code into the
 * browser bundle. The web workspace maps it to `@shared/types` (see
 * web/vite.config.ts and web/tsconfig.json).
 */

export type Lang = "sv" | "en";

/** Status as written in the publish tracker sheets. */
export type SheetStatus = "yes" | "no" | "ios" | "rej";

/** What the platform itself reports. Sample until the platform APIs land. */
export type PlatformState = "live" | "paused" | "missing" | "orphan" | "rejected" | "none";

/** The status shown in the "on platform" column, after reconciliation. */
export type PlacementStatus = "live" | "paused" | "planned" | "rejected" | "notpub" | "missing";

export type CreativeType = "video" | "image";
export type LinkType = "file" | "folder" | "none";
export type OsKey = "ios" | "android";
export type OsFilter = "all" | OsKey;
export type Granularity = "day" | "week" | "month";
export type MetricKey = "spend" | "installs" | "clicks" | "impressions" | "cpi" | "ctr" | "cvr";
export type BreakdownDim = "app" | "country" | "platform" | "campaign" | "creative" | "os" | "account";
export type RankKey = "installs" | "cpi" | "ctr" | "spend";
export type IntegrationState = "none" | "ok" | "err";
export type AlertSeverity = "bad" | "warn" | "info";

export interface AppDto {
  key: string;
  label: string;
  color: string;
}

export interface CountryDto {
  code: string;
  nameSv: string;
  nameEn: string;
}

export interface PlatformDto {
  key: string;
  name: string;
  short: string;
  color: string;
  inSheet: boolean;
}

export interface AdAccountDto {
  appKey: string;
  platformKey: string;
  externalId: string;
  name: string;
  isSample: boolean;
}

export interface CreativeDto {
  id: string;
  appKey: string;
  name: string;
  type: CreativeType;
  link: string | null;
  linkType: LinkType;
  noteSv: string | null;
  noteEn: string | null;
  /** Number of separate files a single sheet row stands for, when > 1. */
  bundle: number | null;
  flagBest: boolean;
  flagTypo: boolean;
  countries: string[];
  /** platform key -> status in the sheet. Platforms with no column are absent. */
  statuses: Record<string, SheetStatus>;
}

export interface PlacementDto {
  id: number;
  creativeId: string;
  creativeName: string;
  appKey: string;
  countryCode: string;
  platformKey: string;
  campaign: string;
  adSet: string;
  os: OsKey[];
  sheetStatus: SheetStatus;
  platformState: PlatformState;
  /** Sample publish date, ISO yyyy-mm-dd. */
  publishedOn: string | null;
  accountExternalId: string;
  status: PlacementStatus;
}

export interface MetaDto {
  /** The server's idea of today, ISO yyyy-mm-dd. Date presets are built on it. */
  today: string;
  updatedAt: string;
  apps: AppDto[];
  countries: CountryDto[];
  platforms: PlatformDto[];
  creatives: CreativeDto[];
  campaigns: string[];
  accounts: AdAccountDto[];
  creativeCount: number;
}

export interface Totals {
  spend: number;
  installs: number;
  clicks: number;
  impressions: number;
  cpi: number | null;
  ctr: number | null;
  cvr: number | null;
}

/** One bucket of a time series. Labels are formatted client-side, for locale. */
export interface SeriesPoint extends Totals {
  /** ISO yyyy-mm-dd of the first day in the bucket. */
  bucket: string;
}

export interface BreakdownRow extends Totals {
  key: string;
}

export interface PeriodTotals {
  today: Totals;
  yesterday: Totals;
  week: Totals;
  lastWeek: Totals;
  month: Totals;
  lastMonth: Totals;
}

export interface PlatformCoverage {
  platformKey: string;
  inSheet: boolean;
  yes: number;
  ios: number;
  rejected: number;
  missing: number;
  total: number;
  /** 0–100. An iOS-only upload counts as half a slot. */
  pct: number;
}

export interface CountryCoverage {
  countryCode: string;
  filled: number;
  total: number;
  pct: number;
}

export interface AlertDto {
  id: string;
  severity: AlertSeverity;
  titleSv: string;
  titleEn: string;
  detailSv: string;
  detailEn: string;
  /** Which view the "open" button jumps to. */
  target: string;
  /** true when the alert is derived from the sheets, false when from sample numbers. */
  fromSheet: boolean;
}

export interface OverviewDto {
  range: { from: string; to: string; previousFrom: string; previousTo: string; days: number };
  periods: PeriodTotals;
  current: Totals;
  previous: Totals;
  /** Daily spend for the last 30 days, oldest first. */
  spark: number[];
  breakdown: BreakdownRow[];
  coverage: PlatformCoverage[];
  creativeCount: number;
  alerts: AlertDto[];
}

export interface PerformanceDto {
  totals: Totals;
  series: SeriesPoint[];
  breakdown: BreakdownRow[];
  rowCount: number;
}

export interface CreativesDto {
  creatives: CreativeDto[];
  placements: PlacementDto[];
  matchedCreatives: number;
  totalCreatives: number;
}

export interface RankedCreative extends Totals {
  creativeId: string;
}

export interface BestPerDimRow extends Totals {
  dimKey: string;
  creativeId: string;
}

export interface TopDto {
  ranked: RankedCreative[];
  weak: RankedCreative[];
  bestPerDim: BestPerDimRow[];
  rankKey: RankKey;
}

export interface GapRow {
  creativeId: string;
  platformKey: string;
  /** Platforms the creative is already out on. */
  outOn: string[];
}

export interface RejectionRow {
  creativeId: string;
  platformKey: string;
}

export interface MismatchRow {
  placement: PlacementDto;
  kind: "missing" | "orphan" | "paused";
}

export interface DuplicateRow {
  a: string;
  b: string;
  countries: string[];
}

export interface SharedConceptRow {
  creativeIds: string[];
  name: string;
}

export interface PublishingDto {
  summary: {
    uploaded: number;
    missing: number;
    iosOnly: number;
    rejected: number;
    slots: number;
    mismatches: number;
  };
  creatives: CreativeDto[];
  livePlacements: PlacementDto[];
  gaps: GapRow[];
  rejections: RejectionRow[];
  iosOnly: RejectionRow[];
  mismatches: MismatchRow[];
  duplicates: DuplicateRow[];
  sharedConcepts: SharedConceptRow[];
}

export interface UnpublishedDto {
  nowhere: CreativeDto[];
  gaps: GapRow[];
  iosOnly: RejectionRow[];
  counts: { nowhere: number; gaps: number; iosOnly: number };
}

export interface IntegrationDto {
  key: string;
  name: string;
  logo: string;
  color: string;
  kind: "sheet" | "ads";
  detail: string | null;
  apiName: string;
  needsSv: string;
  needsEn: string;
  state: IntegrationState;
  /** Sample state used only by the "preview how the statuses look" toggle. */
  demoState: IntegrationState;
  lastSyncAt: string | null;
  accounts: AdAccountDto[];
}

export interface IntegrationsDto {
  sources: IntegrationDto[];
  /** true while no platform is connected, i.e. every performance number is sample. */
  allSample: boolean;
}

export interface ApiError {
  error: string;
  detail?: string;
}
