/**
 * REAL DATA — transcribed from the two Google Sheets publish trackers.
 *
 * Status codes per platform, exactly as the sheets use them:
 *   "yes" = Ja           (uploaded at some point, not necessarily live now)
 *   "no"  = Nej          (not published)
 *   "ios" = Bara ios     (iOS only)
 *   "rej" = Rejected
 *
 * Nothing in this file is invented. Anything missing from the sheets — publish
 * dates, campaign names, Unity Ads — is absent here on purpose and is produced
 * by the sample generator instead, where it stays clearly labelled as sample.
 */

import type { CreativeType, LinkType, SheetStatus } from "../shared/types.js";

export interface SourcePlatform {
  key: string;
  name: string;
  short: string;
  color: string;
  inSheet: boolean;
}

export interface SourceApp {
  key: string;
  label: string;
  color: string;
  countries: string[];
}

export interface SourceCountry {
  code: string;
  nameSv: string;
  nameEn: string;
}

export interface SourceCreative {
  id: string;
  name: string;
  app: string;
  countries: string[];
  type: CreativeType;
  link: string | null;
  linkType: LinkType;
  statuses: Record<string, SheetStatus>;
  noteSv?: string;
  noteEn?: string;
  bundle?: number;
  flagBest?: boolean;
  flagTypo?: boolean;
}

export const SOURCE_PLATFORMS: SourcePlatform[] = [
  { key: "tiktok", name: "TikTok Ads", short: "TikTok", color: "#111827", inSheet: true },
  { key: "meta", name: "Meta Ads", short: "Meta", color: "#1877F2", inSheet: true },
  { key: "google", name: "Google Ads", short: "Google", color: "#0F9D58", inSheet: true },
  { key: "snap", name: "Snapchat Ads", short: "Snap", color: "#D9A400", inSheet: true },
  // Unity has no column in either sheet yet — kept so the gap is visible.
  { key: "unity", name: "Unity Ads", short: "Unity", color: "#7A5CF0", inSheet: false },
];

export const SOURCE_COUNTRIES: SourceCountry[] = [
  { code: "SE", nameSv: "Sverige", nameEn: "Sweden" },
  { code: "DK", nameSv: "Danmark", nameEn: "Denmark" },
  { code: "FI", nameSv: "Finland", nameEn: "Finland" },
  { code: "NO", nameSv: "Norge", nameEn: "Norway" },
  { code: "NL", nameSv: "Nederländerna", nameEn: "Netherlands" },
  { code: "FR", nameSv: "Frankrike", nameEn: "France" },
  { code: "DE", nameSv: "Tyskland", nameEn: "Germany" },
];

export const SOURCE_APPS: SourceApp[] = [
  { key: "sveapanelen", label: "Sveapanelen", color: "#C81D62", countries: ["SE"] },
  { key: "rewly", label: "Rewly", color: "#7A2E5C", countries: ["NO", "DK", "FI", "NL", "FR", "DE"] },
];

/**
 * Multi-market image ads for Rewly. The sheet writes "FI, NO, DK, NE, DE, NL";
 * the client confirmed NE is a duplicate of NL and that France is not included.
 */
export const REWLY_IMAGE_MARKETS = ["FI", "NO", "DK", "DE", "NL"];

const ALL = (tiktok: SheetStatus, meta: SheetStatus, google: SheetStatus, snap: SheetStatus) =>
  ({ tiktok, meta, google, snap }) as Record<string, SheetStatus>;

const SVE_FOLDER = "https://drive.google.com/drive/u/3/folders/1hPZZfM9mGXKOPenhLPBuDZMOk1yLWUYh";

export const SOURCE_CREATIVES: SourceCreative[] = [
  /* ---------------------------- SVEAPANELEN (Sweden) ---------------------- */
  {
    id: "SVE-001",
    name: "Matutmaning",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: "https://drive.google.com/file/d/1tWy4l6AtHT7xI_xI1gd2jpHnHTdvLJws/view?usp=drive_link",
    linkType: "file",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "SVE-002",
    name: "Hur mycket har du på kontot",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: "https://drive.google.com/file/d/16pJi_l2TtD-FJoB-I4nXQKghQARhz1dJ/view?usp=drive_link",
    linkType: "file",
    statuses: ALL("yes", "yes", "yes", "yes"),
    noteSv: "Markerad i arket som den video som presterat bäst",
    noteEn: "Marked in the sheet as the best performing video",
    flagBest: true,
  },
  {
    id: "SVE-003",
    name: "3 saker jag köpt tack vare Sveapanelen (cashback)",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: "https://drive.google.com/file/d/1L6IxFW1hjDJrKHHTE7tsvWLuUxTvSJgm/view?usp=drive_link",
    linkType: "file",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "SVE-004",
    name: "Hur många skillnader kan du hitta?",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: "https://drive.google.com/file/d/1x2D0nWig2Zia0LOyagpX5TEO90ejDVZ4/view?usp=drive_link",
    linkType: "file",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "SVE-005",
    name: "Gissa priset intervju (Cashback)",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: "https://drive.google.com/file/d/1Pi_hD6UJRh4SIZjukof_e7DFLncP507h/view?usp=drive_link",
    linkType: "file",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "SVE-006",
    name: "Video 2 – POV",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: "https://drive.google.com/file/d/1duQ_2eukYfoEUeM2Qckv25z0XRT1AcjN/view?usp=drive_link",
    linkType: "file",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "SVE-007",
    name: "Bjuda på handling video 2",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: SVE_FOLDER,
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "SVE-008",
    name: "Hur mycket tjänar du?",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: SVE_FOLDER,
    linkType: "folder",
    statuses: ALL("ios", "yes", "yes", "yes"),
    noteSv: "Arket: ”Bara ios” på TikTok",
    noteEn: "Sheet says “Bara ios” on TikTok",
  },
  {
    id: "SVE-009",
    name: "Sparkonto",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: SVE_FOLDER,
    linkType: "folder",
    statuses: ALL("no", "no", "no", "no"),
  },
  {
    id: "SVE-010",
    name: "UGC 35+",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: SVE_FOLDER,
    linkType: "folder",
    statuses: ALL("no", "no", "no", "no"),
  },
  {
    id: "SVE-011",
    name: "UGC 40+",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: SVE_FOLDER,
    linkType: "folder",
    statuses: ALL("no", "no", "no", "no"),
  },
  {
    id: "SVE-012",
    name: "UGC 45+",
    app: "sveapanelen",
    countries: ["SE"],
    type: "video",
    link: SVE_FOLDER,
    linkType: "folder",
    statuses: ALL("no", "no", "no", "no"),
  },
  {
    id: "SVE-013",
    name: "Bild ads – dont be a idiot",
    app: "sveapanelen",
    countries: ["SE"],
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "yes", "rej"),
    noteSv: "”rejected” står i Snap-kolumnen i arket",
    noteEn: "“rejected” sits in the Snap column of the sheet",
  },
  {
    id: "SVE-014",
    name: "Bld ads – Text msg",
    app: "sveapanelen",
    countries: ["SE"],
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "yes", "yes"),
    noteSv: "Stavning i arket: ”Bld ads”",
    noteEn: "Spelling in the sheet: “Bld ads”",
    flagTypo: true,
  },
  {
    id: "SVE-015",
    name: "Bild ads – venn diagram",
    app: "sveapanelen",
    countries: ["SE"],
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "yes", "yes"),
  },
  {
    id: "SVE-016",
    name: "Bild ads – Ursäktsbrev",
    app: "sveapanelen",
    countries: ["SE"],
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "yes", "yes"),
  },
  {
    id: "SVE-017",
    name: "Bild ads – bli rik",
    app: "sveapanelen",
    countries: ["SE"],
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "SVE-018",
    name: "Bild ads – Dödtiden",
    app: "sveapanelen",
    countries: ["SE"],
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "no", "yes"),
  },
  {
    id: "SVE-019",
    name: "Bild ads – Doomscroll",
    app: "sveapanelen",
    countries: ["SE"],
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "no", "yes"),
  },

  /* ---------------------------------- REWLY ------------------------------ */
  {
    id: "REW-001",
    name: "Gissa pepsi logga",
    app: "rewly",
    countries: ["DK"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/1gyqjWsFOYXZnpBAyGreE2wYmwpDxg53J",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "REW-002",
    name: "Vad hade du gjort för 100kr",
    app: "rewly",
    countries: ["DK"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/1gyqjWsFOYXZnpBAyGreE2wYmwpDxg53J",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "REW-003",
    name: "Hur mycket sparar du?",
    app: "rewly",
    countries: ["FI"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/108Z5Gpg4vh9G2d1OMU9Ky9wI-u5gfXns",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "REW-004",
    name: "Vad hade du gjort för 100kr",
    app: "rewly",
    countries: ["FI"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/108Z5Gpg4vh9G2d1OMU9Ky9wI-u5gfXns",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "REW-005",
    name: "Vanligaste namnet",
    app: "rewly",
    countries: ["FI"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/108Z5Gpg4vh9G2d1OMU9Ky9wI-u5gfXns",
    linkType: "folder",
    statuses: ALL("ios", "yes", "yes", "yes"),
    noteSv: "Tiktok andriod godkänner ej",
    noteEn: "TikTok does not approve Android",
  },
  {
    id: "REW-006",
    name: "Vad är skillnaden på bilden",
    app: "rewly",
    countries: ["NL"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/1v6oBlZec7vlsHK9AJGlXmVsKS4XRB0ew",
    linkType: "folder",
    statuses: ALL("yes", "yes", "no", "yes"),
  },
  {
    id: "REW-007",
    name: "Hur mycket pengar",
    app: "rewly",
    countries: ["NL"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/1v6oBlZec7vlsHK9AJGlXmVsKS4XRB0ew",
    linkType: "folder",
    statuses: ALL("rej", "yes", "no", "yes"),
  },
  {
    id: "REW-008",
    name: "Endast fel svar",
    app: "rewly",
    countries: ["NL"],
    type: "video",
    link: "https://drive.google.com/drive/u/0/folders/1v6oBlZec7vlsHK9AJGlXmVsKS4XRB0ew",
    linkType: "folder",
    statuses: ALL("rej", "yes", "no", "yes"),
  },
  {
    id: "REW-009",
    name: "What is Rewly",
    app: "rewly",
    countries: ["FI"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1tPLBCjDIYdmWo7VZ1PzsnrkObpowBAdl",
    linkType: "folder",
    statuses: ALL("yes", "yes", "ios", "yes"),
    noteSv: "Inte lagt ut android google",
    noteEn: "Android not uploaded to Google",
  },
  {
    id: "REW-010",
    name: "How to get rich",
    app: "rewly",
    countries: ["FI"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1tPLBCjDIYdmWo7VZ1PzsnrkObpowBAdl",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "REW-011",
    name: "How much to be rich",
    app: "rewly",
    countries: ["NO"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1JiqAMtA6RcOKmxgKTkt0NHcJypOHqYfZ",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "REW-012",
    name: "What is Rewly",
    app: "rewly",
    countries: ["NO"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1JiqAMtA6RcOKmxgKTkt0NHcJypOHqYfZ",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "no"),
  },
  {
    id: "REW-013",
    name: "3 things ive bought because of Rewly",
    app: "rewly",
    countries: ["DK"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1NY5vo3uNqtuXdICX1lql6a9j1bB-qI3X",
    linkType: "folder",
    statuses: ALL("ios", "yes", "yes", "yes"),
    noteSv: "inte lagt ut tiktok andriod än",
    noteEn: "TikTok Android not uploaded yet",
  },
  {
    id: "REW-014",
    name: "Video 1 frankrike",
    app: "rewly",
    countries: ["FR"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1zr04p7svctBfzpFHObw35uy2T_s5GfLU",
    linkType: "folder",
    statuses: ALL("yes", "yes", "yes", "yes"),
  },
  {
    id: "REW-015",
    name: "Video 2 frankrike",
    app: "rewly",
    countries: ["FR"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1zr04p7svctBfzpFHObw35uy2T_s5GfLU",
    linkType: "folder",
    statuses: ALL("no", "no", "no", "no"),
  },
  {
    id: "REW-016",
    name: "UGC",
    app: "rewly",
    countries: ["DE"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1IhCQMwYGSfEEyVBBgXHQ3ONJXOn66VIO",
    linkType: "folder",
    statuses: ALL("yes", "yes", "no", "yes"),
  },
  {
    id: "REW-017",
    name: "Doomscrolling",
    app: "rewly",
    countries: ["DE"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/1IhCQMwYGSfEEyVBBgXHQ3ONJXOn66VIO",
    linkType: "folder",
    statuses: ALL("yes", "yes", "no", "yes"),
  },
  {
    id: "REW-018",
    name: "Skärmtid",
    app: "rewly",
    countries: ["NL"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/17OUqYhimg9KFHDO48qGA7RmKIg_0GN3W",
    linkType: "folder",
    statuses: ALL("no", "no", "no", "yes"),
  },
  {
    id: "REW-019",
    name: "Bankkort",
    app: "rewly",
    countries: ["NL"],
    type: "video",
    link: "https://drive.google.com/drive/u/3/folders/17OUqYhimg9KFHDO48qGA7RmKIg_0GN3W",
    linkType: "folder",
    statuses: ALL("no", "no", "no", "no"),
  },
  {
    id: "REW-020",
    name: "Bild ads Venn-diagram (3 st)",
    app: "rewly",
    countries: REWLY_IMAGE_MARKETS,
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("yes", "yes", "yes", "yes"),
    noteSv: "En rad = 3 separata bilder",
    noteEn: "One row = 3 separate images",
    bundle: 3,
  },
  {
    id: "REW-021",
    name: "Bild ads text messages (3 st)",
    app: "rewly",
    countries: REWLY_IMAGE_MARKETS,
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "yes", "no"),
    noteSv: "En rad = 3 separata bilder",
    noteEn: "One row = 3 separate images",
    bundle: 3,
  },
  {
    id: "REW-022",
    name: "Bild ads Don't be an idiot (3 st)",
    app: "rewly",
    countries: REWLY_IMAGE_MARKETS,
    type: "image",
    link: null,
    linkType: "none",
    statuses: ALL("no", "yes", "yes", "yes"),
    noteSv: "the coffee pic is posted — en rad = 3 bilder",
    noteEn: "the coffee pic is posted — one row = 3 images",
    bundle: 3,
  },
];

/**
 * SAMPLE ad accounts. Real account names and ids replace these in stage 5, read
 * from each platform's own API. Every performance number carries the account it
 * came from, so the swap is a data change and nothing else.
 */
export const SAMPLE_ACCOUNT_IDS: Record<string, Record<string, string>> = {
  sveapanelen: {
    tiktok: "7291045566",
    meta: "act_418902266",
    google: "742-118-6690",
    snap: "a1f7-SVE-SE",
    unity: "unity-5590221",
  },
  rewly: {
    tiktok: "7318772041",
    meta: "act_509377114",
    google: "903-447-2015",
    snap: "b4c2-REW-EU",
    unity: "unity-5590884",
  },
};

export interface SourceIntegration {
  key: string;
  name: string;
  logo: string;
  color: string;
  kind: "sheet" | "ads";
  detail: string | null;
  apiName: string;
  needsSv: string;
  needsEn: string;
  /** The real state — nothing is connected in this preview. */
  state: "none" | "ok" | "err";
  /** Sample state used only by the "preview how the statuses look" toggle. */
  demoState: "none" | "ok" | "err";
}

export const SOURCE_INTEGRATIONS: SourceIntegration[] = [
  {
    key: "sheets",
    name: "Google Sheets",
    logo: "GS",
    color: "#0F9D58",
    kind: "sheet",
    detail: "Publish tracker Sveapanelen + Publish tracker Rewly",
    apiName: "Google Sheets API v4",
    needsSv: "Läsbehörighet på dina två ark",
    needsEn: "Read access to your two sheets",
    state: "none",
    demoState: "ok",
  },
  {
    key: "meta",
    name: "Meta Ads",
    logo: "MT",
    color: "#1877F2",
    kind: "ads",
    detail: null,
    apiName: "Meta Marketing API",
    needsSv: "Business Manager-inloggning en gång",
    needsEn: "One sign-in to Business Manager",
    state: "none",
    demoState: "ok",
  },
  {
    key: "google",
    name: "Google Ads",
    logo: "GG",
    color: "#34A853",
    kind: "ads",
    detail: null,
    apiName: "Google Ads API",
    needsSv: "Google Ads-inloggning + kundnummer",
    needsEn: "Google Ads sign-in + customer ID",
    state: "none",
    demoState: "ok",
  },
  {
    key: "tiktok",
    name: "TikTok Ads",
    logo: "TT",
    color: "#111827",
    kind: "ads",
    detail: null,
    apiName: "TikTok Business API",
    needsSv: "TikTok Business Center-inloggning",
    needsEn: "TikTok Business Center sign-in",
    state: "none",
    demoState: "err",
  },
  {
    key: "snap",
    name: "Snapchat Ads",
    logo: "SN",
    color: "#D9A400",
    kind: "ads",
    detail: null,
    apiName: "Snapchat Marketing API",
    needsSv: "Snapchat Ads Manager-inloggning",
    needsEn: "Snapchat Ads Manager sign-in",
    state: "none",
    demoState: "none",
  },
  {
    key: "unity",
    name: "Unity Ads",
    logo: "UN",
    color: "#7A5CF0",
    kind: "ads",
    detail: null,
    apiName: "Unity Ads Monetization/Acquire API",
    needsSv: "Unity-organisations-ID + API-nyckel",
    needsEn: "Unity organisation ID + API key",
    state: "none",
    demoState: "none",
  },
];
