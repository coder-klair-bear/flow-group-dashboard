import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ enums */

/** Exactly the four values the publish tracker sheets use. */
export const sheetStatusEnum = pgEnum("sheet_status", ["yes", "no", "ios", "rej"]);

/** What the platform reports back. Sample until the platform APIs are wired up. */
export const platformStateEnum = pgEnum("platform_state", [
  "live",
  "paused",
  "missing",
  "orphan",
  "rejected",
  "none",
]);

export const creativeTypeEnum = pgEnum("creative_type", ["video", "image"]);
export const linkTypeEnum = pgEnum("link_type", ["file", "folder", "none"]);
export const integrationKindEnum = pgEnum("integration_kind", ["sheet", "ads"]);
export const integrationStateEnum = pgEnum("integration_state", ["none", "ok", "err"]);

/* ----------------------------------------------------------------- tables */

export const apps = pgTable("apps", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const countries = pgTable("countries", {
  code: varchar("code", { length: 2 }).primaryKey(),
  nameSv: text("name_sv").notNull(),
  nameEn: text("name_en").notNull(),
});

export const platforms = pgTable("platforms", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  color: text("color").notNull(),
  /** false for platforms that have no column in either sheet yet (Unity). */
  inSheet: boolean("in_sheet").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const adAccounts = pgTable(
  "ad_accounts",
  {
    id: serial("id").primaryKey(),
    appKey: text("app_key")
      .notNull()
      .references(() => apps.key, { onDelete: "cascade" }),
    platformKey: text("platform_key")
      .notNull()
      .references(() => platforms.key, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    /** true while the account identifier is invented rather than read from an API. */
    isSample: boolean("is_sample").notNull().default(true),
  },
  (t) => ({
    appPlatform: unique("ad_accounts_app_platform_key").on(t.appKey, t.platformKey),
  }),
);

export const creatives = pgTable(
  "creatives",
  {
    /** The human id from the sheet transcription, e.g. "SVE-002". */
    id: text("id").primaryKey(),
    appKey: text("app_key")
      .notNull()
      .references(() => apps.key, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: creativeTypeEnum("type").notNull(),
    link: text("link"),
    linkType: linkTypeEnum("link_type").notNull().default("none"),
    noteSv: text("note_sv"),
    noteEn: text("note_en"),
    /** How many separate files one sheet row stands for, when more than one. */
    bundle: integer("bundle"),
    /** Marked in the sheet as the best performing video. */
    flagBest: boolean("flag_best").notNull().default(false),
    /** The sheet spells this row's name wrong; kept verbatim, flagged here. */
    flagTypo: boolean("flag_typo").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    byApp: index("creatives_app_idx").on(t.appKey),
  }),
);

export const creativeCountries = pgTable(
  "creative_countries",
  {
    creativeId: text("creative_id")
      .notNull()
      .references(() => creatives.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.creativeId, t.countryCode] }),
  }),
);

export const creativeStatuses = pgTable(
  "creative_statuses",
  {
    creativeId: text("creative_id")
      .notNull()
      .references(() => creatives.id, { onDelete: "cascade" }),
    platformKey: text("platform_key")
      .notNull()
      .references(() => platforms.key, { onDelete: "cascade" }),
    status: sheetStatusEnum("status").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.creativeId, t.platformKey] }),
  }),
);

/**
 * One placement = creative x platform x country. This is the grain the ad
 * platforms report on, so every performance row hangs off a placement and
 * therefore always knows its app, country, platform, campaign and account.
 */
export const placements = pgTable(
  "placements",
  {
    id: serial("id").primaryKey(),
    creativeId: text("creative_id")
      .notNull()
      .references(() => creatives.id, { onDelete: "cascade" }),
    appKey: text("app_key")
      .notNull()
      .references(() => apps.key, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code, { onDelete: "cascade" }),
    platformKey: text("platform_key")
      .notNull()
      .references(() => platforms.key, { onDelete: "cascade" }),
    accountId: integer("account_id").references(() => adAccounts.id, { onDelete: "set null" }),
    campaign: text("campaign").notNull(),
    adSet: text("ad_set").notNull(),
    osIos: boolean("os_ios").notNull().default(true),
    osAndroid: boolean("os_android").notNull().default(true),
    sheetStatus: sheetStatusEnum("sheet_status").notNull(),
    platformState: platformStateEnum("platform_state").notNull().default("none"),
    /** Sample publish date. Real dates arrive with the platform APIs. */
    publishedOn: date("published_on"),
    /** Share of delivery attributed to iOS, 0–1. Used to split metrics by OS. */
    iosShare: doublePrecision("ios_share").notNull().default(0.55),
    /** Relative quality multiplier used by the sample generator only. */
    quality: doublePrecision("quality").notNull().default(1),
    isLive: boolean("is_live").notNull().default(false),
  },
  (t) => ({
    uniquePlacement: unique("placements_creative_platform_country_key").on(
      t.creativeId,
      t.platformKey,
      t.countryCode,
    ),
    byApp: index("placements_app_idx").on(t.appKey),
    byPlatform: index("placements_platform_idx").on(t.platformKey),
    byCountry: index("placements_country_idx").on(t.countryCode),
  }),
);

/**
 * Daily delivery per placement. SAMPLE data for now, written by the seed.
 * When a platform is connected in stage 5 its rows replace the sample rows for
 * that platform; sample and live are never mixed inside one number.
 */
export const dailyMetrics = pgTable(
  "daily_metrics",
  {
    id: serial("id").primaryKey(),
    day: date("day").notNull(),
    placementId: integer("placement_id")
      .notNull()
      .references(() => placements.id, { onDelete: "cascade" }),
    impressions: integer("impressions").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    installs: integer("installs").notNull().default(0),
    spend: numeric("spend", { precision: 12, scale: 2 }).notNull().default("0"),
    /** false once the row comes from a platform API rather than the generator. */
    isSample: boolean("is_sample").notNull().default(true),
  },
  (t) => ({
    uniqueDay: unique("daily_metrics_placement_day_key").on(t.placementId, t.day),
    byDay: index("daily_metrics_day_idx").on(t.day),
    byPlacement: index("daily_metrics_placement_idx").on(t.placementId),
  }),
);

export const integrations = pgTable("integrations", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  color: text("color").notNull(),
  kind: integrationKindEnum("kind").notNull(),
  detail: text("detail"),
  apiName: text("api_name").notNull(),
  needsSv: text("needs_sv").notNull(),
  needsEn: text("needs_en").notNull(),
  /** The real current state. Nothing is connected in this preview. */
  state: integrationStateEnum("state").notNull().default("none"),
  /** Sample state, used only by the "preview how the statuses look" toggle. */
  demoState: integrationStateEnum("demo_state").notNull().default("none"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* -------------------------------------------------------------- relations */

export const appsRelations = relations(apps, ({ many }) => ({
  creatives: many(creatives),
  placements: many(placements),
  accounts: many(adAccounts),
}));

export const creativesRelations = relations(creatives, ({ one, many }) => ({
  app: one(apps, { fields: [creatives.appKey], references: [apps.key] }),
  countries: many(creativeCountries),
  statuses: many(creativeStatuses),
  placements: many(placements),
}));

export const creativeCountriesRelations = relations(creativeCountries, ({ one }) => ({
  creative: one(creatives, {
    fields: [creativeCountries.creativeId],
    references: [creatives.id],
  }),
  country: one(countries, {
    fields: [creativeCountries.countryCode],
    references: [countries.code],
  }),
}));

export const creativeStatusesRelations = relations(creativeStatuses, ({ one }) => ({
  creative: one(creatives, {
    fields: [creativeStatuses.creativeId],
    references: [creatives.id],
  }),
  platform: one(platforms, {
    fields: [creativeStatuses.platformKey],
    references: [platforms.key],
  }),
}));

export const placementsRelations = relations(placements, ({ one, many }) => ({
  creative: one(creatives, { fields: [placements.creativeId], references: [creatives.id] }),
  app: one(apps, { fields: [placements.appKey], references: [apps.key] }),
  country: one(countries, { fields: [placements.countryCode], references: [countries.code] }),
  platform: one(platforms, { fields: [placements.platformKey], references: [platforms.key] }),
  account: one(adAccounts, { fields: [placements.accountId], references: [adAccounts.id] }),
  metrics: many(dailyMetrics),
}));

export const dailyMetricsRelations = relations(dailyMetrics, ({ one }) => ({
  placement: one(placements, {
    fields: [dailyMetrics.placementId],
    references: [placements.id],
  }),
}));

export const adAccountsRelations = relations(adAccounts, ({ one, many }) => ({
  app: one(apps, { fields: [adAccounts.appKey], references: [apps.key] }),
  platform: one(platforms, { fields: [adAccounts.platformKey], references: [platforms.key] }),
  placements: many(placements),
}));

/* ------------------------------------------------------------------ types */

export type AppRow = typeof apps.$inferSelect;
export type CountryRow = typeof countries.$inferSelect;
export type PlatformRow = typeof platforms.$inferSelect;
export type CreativeRow = typeof creatives.$inferSelect;
export type PlacementRow = typeof placements.$inferSelect;
export type DailyMetricRow = typeof dailyMetrics.$inferSelect;
export type AdAccountRow = typeof adAccounts.$inferSelect;
export type IntegrationRow = typeof integrations.$inferSelect;
