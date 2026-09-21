/**
 * Every visible string, in Swedish and English. Swedish is the default: the
 * sheets, the client and the ad operations are Swedish, and the English side
 * exists so the dashboard can be shown to people outside the team.
 */

export interface Phrase {
  sv: string;
  en: string;
}

export const STRINGS = {
  /* ---------------------------------------------------------------- shell */
  brandSub: { sv: "Annonspanel", en: "Ad dashboard" },
  allApps: { sv: "Alla appar", en: "All apps" },
  refresh: { sv: "Uppdatera", en: "Refresh" },
  updated: { sv: "Uppdaterad", en: "Updated" },
  refreshed: { sv: "Uppdaterad nu", en: "Refreshed just now" },
  autoNote: { sv: "Automatisk uppdatering var 15:e minut", en: "Automatic refresh every 15 minutes" },
  stage: { sv: "Steg 2 · utkast", en: "Stage 2 · draft" },
  loading: { sv: "Hämtar…", en: "Loading…" },
  loadFailed: { sv: "Kunde inte hämta data", en: "Could not load the data" },
  loadFailedSub: {
    sv: "Kontrollera att servern körs och att databasen är seedad.",
    en: "Check that the server is running and the database has been seeded.",
  },
  retry: { sv: "Försök igen", en: "Try again" },

  /* ------------------------------------------------------------------ nav */
  nav_overview: { sv: "Översikt", en: "Overview" },
  nav_creatives: { sv: "Kreativ", en: "Creatives" },
  nav_performance: { sv: "Resultat", en: "Performance" },
  nav_top: { sv: "Toppkreativ", en: "Top creatives" },
  nav_unpub: { sv: "Opublicerat", en: "Unpublished" },
  nav_publish: { sv: "Publicering", en: "Publishing" },
  nav_settings: { sv: "Integrationer", en: "Integrations" },

  /* --------------------------------------------------------- sample banner */
  sampleTitle: {
    sv: "Siffrorna är exempel — kreativen är på riktigt.",
    en: "The numbers are examples — the creatives are real.",
  },
  sampleBody: {
    sv: "Alla 41 kreativ, länkar, länder och publiceringsstatusar kommer direkt från dina två Google Sheets. Allt som handlar om pengar, installationer, klick, visningar och datum är påhittad exempeldata så att du kan se hur panelen fungerar. Exempelsiffror har alltid en prickad lila understrykning. De byts mot riktiga siffror i steg 5.",
    en: "All 41 creatives, links, countries and publish statuses come straight from your two Google Sheets. Everything about money, installs, clicks, impressions and dates is invented sample data so you can see how the dashboard works. Sample figures always carry a dotted purple underline. They get replaced with real numbers in stage 5.",
  },
  sampleTag: { sv: "Exempeldata", en: "Sample data" },
  realTag: { sv: "Från ditt ark", en: "From your sheet" },
  noLiveYet: {
    sv: "Ingen plattform är ansluten ännu, så ingen siffra är live.",
    en: "No platform is connected yet, so no number is live.",
  },
  legendReal: { sv: "Från ditt ark", en: "From your sheet" },
  legendSample: { sv: "Exempeldata", en: "Sample data" },

  /* ------------------------------------------------------------- overview */
  ov_h: { sv: "Översikt", en: "Overview" },
  ov_s: {
    sv: "Dagens läge för Sveapanelen och Rewly, över alla plattformar och länder.",
    en: "Today's picture for Sveapanelen and Rewly, across every platform and country.",
  },
  spendToday: { sv: "Spend idag", en: "Spend today" },
  spendWeek: { sv: "Spend denna vecka", en: "Spend this week" },
  spendMonth: { sv: "Spend denna månad", en: "Spend this month" },
  vsYesterday: { sv: "mot igår", en: "vs yesterday" },
  vsPrevWeek: { sv: "mot förra veckan", en: "vs last week" },
  vsPrevMonth: { sv: "mot förra månaden", en: "vs last month" },
  vsPrev: { sv: "mot föregående period", en: "vs previous period" },
  installs: { sv: "Installationer", en: "Installs" },
  cpi: { sv: "Kostnad per installation", en: "Cost per install" },
  cpiShort: { sv: "CPI", en: "CPI" },
  clicks: { sv: "Klick", en: "Clicks" },
  impressions: { sv: "Visningar", en: "Impressions" },
  ctr: { sv: "CTR", en: "CTR" },
  cvr: { sv: "Konverteringsgrad", en: "Conversion rate" },
  spend: { sv: "Spend", en: "Spend" },
  attention: { sv: "Behöver din uppmärksamhet", en: "Needs your attention" },
  attentionSub: {
    sv: "Räknat på dina ark, inte på exempelsiffror.",
    en: "Worked out from your sheets, not from sample numbers.",
  },
  noAlerts: { sv: "Inga problem hittade.", en: "Nothing to flag." },
  coverage: { sv: "Publiceringstäckning", en: "Publishing coverage" },
  results: { sv: "Resultat per", en: "Results by" },
  byApp: { sv: "App", en: "App" },
  byCountry: { sv: "Land", en: "Country" },
  byPlatform: { sv: "Plattform", en: "Platform" },
  byCampaign: { sv: "Kampanj", en: "Campaign" },
  byOS: { sv: "iOS / Android", en: "iOS / Android" },
  byCreative: { sv: "Kreativ", en: "Creative" },
  openSection: { sv: "Öppna", en: "Open" },

  /* ------------------------------------------------------------ creatives */
  cr_h: { sv: "Kreativ", en: "Creatives" },
  cr_s: {
    sv: "Alla 41 kreativ från dina två ark. Sök och filtrera fritt.",
    en: "All 41 creatives from your two sheets. Search and filter freely.",
  },
  f_app: { sv: "App", en: "App" },
  f_country: { sv: "Land", en: "Country" },
  f_platform: { sv: "Plattform", en: "Platform" },
  f_os: { sv: "System", en: "Operating system" },
  f_campaign: { sv: "Kampanj", en: "Campaign" },
  f_status: { sv: "Status", en: "Status" },
  f_from: { sv: "Från datum", en: "From date" },
  f_to: { sv: "Till datum", en: "To date" },
  f_search: { sv: "Sök namn eller ID…", en: "Search name or ID…" },
  all: { sv: "Alla", en: "All" },
  clear: { sv: "Rensa", en: "Clear" },
  showing: { sv: "Visar", en: "Showing" },
  of: { sv: "av", en: "of" },
  creativesWord: { sv: "kreativ", en: "creatives" },
  rowsWord: { sv: "rader", en: "rows" },
  viewCards: { sv: "Kort", en: "Cards" },
  viewTable: { sv: "Tabell", en: "Table" },
  noResults: { sv: "Inga kreativ matchar filtren", en: "No creatives match your filters" },
  noResultsSub: {
    sv: "Prova att rensa ett filter eller söka på något annat.",
    en: "Try clearing a filter or searching for something else.",
  },
  folderOnly: {
    sv: "Länken går till en mapp, inte en enskild fil",
    en: "Link points to a folder, not a single file",
  },
  noLink: { sv: "Ingen länk i arket", en: "No link in the sheet" },
  openDrive: { sv: "Öppna i Drive", en: "Open in Drive" },
  video: { sv: "Video", en: "Video" },
  image: { sv: "Bild", en: "Image" },
  col_creative: { sv: "Kreativ", en: "Creative" },
  col_app: { sv: "App", en: "App" },
  col_country: { sv: "Land", en: "Country" },
  col_os: { sv: "System", en: "OS" },
  col_campaign: { sv: "Kampanj", en: "Campaign" },
  col_published: { sv: "Publicerad", en: "Published" },
  col_date: { sv: "Publiceringsdatum", en: "Date published" },
  col_sheet: { sv: "Status i arket", en: "Status in sheet" },
  col_platform: { sv: "Status på plattformen", en: "Status on platform" },
  col_adset: { sv: "Annonsgrupp", en: "Ad set" },

  /* ------------------------------------------------------------- statuses */
  st_uploaded: { sv: "Uppladdad", en: "Uploaded" },
  st_notpub: { sv: "Ej publicerad", en: "Not published" },
  st_ios: { sv: "Endast iOS", en: "iOS only" },
  st_rejected: { sv: "Nekad", en: "Rejected" },
  st_live: { sv: "Live", en: "Live" },
  st_paused: { sv: "Pausad", en: "Paused" },
  st_planned: { sv: "Planerad", en: "Planned" },
  st_unknown: { sv: "Okänd", en: "Unknown" },
  os_both: { sv: "iOS + Android", en: "iOS + Android" },
  os_ios: { sv: "iOS", en: "iOS" },
  os_android: { sv: "Android", en: "Android" },

  /* ---------------------------------------------------------- performance */
  pf_h: { sv: "Resultat", en: "Performance" },
  pf_s: {
    sv: "Spend, installationer och klick över tid, uppdelat som du vill.",
    en: "Spend, installs and clicks over time, broken down however you like.",
  },
  perDay: { sv: "Per dag", en: "By day" },
  perWeek: { sv: "Per vecka", en: "By week" },
  perMonth: { sv: "Per månad", en: "By month" },
  breakdown: { sv: "Dela upp på", en: "Break down by" },
  trend: { sv: "Utveckling", en: "Trend" },

  /* -------------------------------------------------------- top creatives */
  tp_h: { sv: "Toppkreativ", en: "Top creatives" },
  tp_s: {
    sv: "Rangordnade på det mått du väljer. Inget pausas automatiskt.",
    en: "Ranked on the measure you choose. Nothing is paused automatically.",
  },
  rankBy: { sv: "Rangordna på", en: "Rank by" },
  mostInstalls: { sv: "Flest installationer", en: "Most installs" },
  lowestCPI: { sv: "Lägst kostnad per installation", en: "Lowest cost per install" },
  highestCTR: { sv: "Högst CTR", en: "Highest CTR" },
  highestSpend: { sv: "Högst spend", en: "Highest spend" },
  topPerformer: { sv: "Toppresultat", en: "Top performer" },
  needsAttention: { sv: "Se över", en: "Needs attention" },
  bestPer: { sv: "Bäst per", en: "Best per" },
  noPause: {
    sv: "Panelen pausar aldrig något själv. Alla ändringar i dina kampanjer gör du själv, eller så frågar jag dig först.",
    en: "The dashboard never pauses anything by itself. Any change to your campaigns is made by you, or I ask you first.",
  },
  losers: { sv: "Svaga kreativ", en: "Weak creatives" },
  losersNote: {
    sv: "Högst kostnad per installation bland kreativ med minst 8 installationer. Titta på dem — men inget pausas automatiskt.",
    en: "Highest cost per install among creatives with at least 8 installs. Worth a look — but nothing is paused automatically.",
  },

  /* ------------------------------------------------------------ publishing */
  pb_h: { sv: "Publiceringsöversikt", en: "Publishing tracker" },
  pb_s: {
    sv: "Ditt ark jämfört med vad som faktiskt finns ute på varje plattform.",
    en: "Your sheet compared with what is actually out on each platform.",
  },
  matrix: { sv: "Kreativ mot plattform", en: "Creative against platform" },
  gaps: { sv: "Luckor att fylla", en: "Gaps to fill" },
  gapsSub: {
    sv: "Kreativ som inte ligger ute på en plattform där resten av appen finns.",
    en: "Creatives that are not out on a platform where the rest of the app is.",
  },
  mismatch: { sv: "Skiljer sig mot plattformen", en: "Disagrees with the platform" },
  mismatchSub: {
    sv: "Arket säger en sak, plattformen en annan. Jämförelsen mot plattformarna är exempeldata tills vi kopplar på dem i steg 5.",
    en: "The sheet says one thing, the platform another. The platform side is sample data until we connect them in stage 5.",
  },
  dupes: { sv: "Möjliga dubbletter", en: "Possible duplicates" },
  dupesSub: {
    sv: "Samma idé i samma app och land. Samma idé i olika länder räknas inte som dubblett.",
    en: "The same idea in the same app and country. The same idea in different countries does not count as a duplicate.",
  },
  noDupes: {
    sv: "Inga dubbletter hittade inom samma app och land.",
    en: "No duplicates found within the same app and country.",
  },
  sharedConcepts: {
    sv: "Samma idé i flera marknader (inte en dubblett)",
    en: "Same idea in several markets (not a duplicate)",
  },
  rejectedList: { sv: "Nekade annonser", en: "Rejected ads" },
  inSheet: { sv: "I arket", en: "In sheet" },
  onPlatform: { sv: "På plattformen", en: "On platform" },
  notFound: { sv: "Hittas inte", en: "Not found" },
  found: { sv: "Hittad", en: "Found" },
  unity_none: {
    sv: "Unity Ads finns inte i något av dina ark ännu, så kolumnen är tom. Vi lägger till den i steg 4.",
    en: "Unity Ads is not in either of your sheets yet, so the column is empty. We add it in stage 4.",
  },
  slots: { sv: "platser", en: "slots" },

  /* ----------------------------------------------------------- unpublished */
  up_h: { sv: "Opublicerat", en: "Unpublished" },
  up_s: {
    sv: "Färdiga kreativ som inte ligger ute. Räknat direkt från dina ark.",
    en: "Finished creatives that are not out. Worked out straight from your sheets.",
  },
  nowhere: { sv: "Ligger inte ute någonstans", en: "Not out anywhere" },
  nowhereSub: {
    sv: "Klara kreativ som ingen plattform har fått. Störst möjlighet först.",
    en: "Finished creatives no platform has received. Biggest opportunity first.",
  },
  partly: { sv: "Delvis ute", en: "Partly out" },
  partlySub: {
    sv: "Ligger ute på minst en plattform men saknas på andra.",
    en: "Out on at least one platform but missing on others.",
  },
  androidMissing: { sv: "Android saknas", en: "Android missing" },
  missingOn: { sv: "Saknas på", en: "Missing on" },
  outOn: { sv: "Ligger ute på", en: "Already out on" },
  readyToPublish: { sv: "kreativ att lägga ut", en: "creatives to publish" },

  /* ------------------------------------------------------------- date range */
  dateRange: { sv: "Period", en: "Date range" },
  r_today: { sv: "Idag", en: "Today" },
  r_yesterday: { sv: "Igår", en: "Yesterday" },
  r_week: { sv: "Denna vecka", en: "This week" },
  r_month: { sv: "Denna månad", en: "This month" },
  r_custom: { sv: "Anpassat", en: "Custom" },
  selected: { sv: "Vald period", en: "Selected period" },

  /* ---------------------------------------------------------- integrations */
  in_h: { sv: "Integrationer", en: "Integrations" },
  in_s: {
    sv: "Var varje siffra kommer ifrån. Inget är anslutet ännu — det gör vi i steg 4 och 5.",
    en: "Where every number comes from. Nothing is connected yet — that happens in stages 4 and 5.",
  },
  st_connected: { sv: "Ansluten", en: "Connected" },
  st_notconnected: { sv: "Ej ansluten", en: "Not connected" },
  st_error: { sv: "Anslutningsfel", en: "Connection error" },
  syncFailed: { sv: "Misslyckades", en: "Failed" },
  lastSync: { sv: "Senast synkad", en: "Last synchronized" },
  adAccount: { sv: "Annonskonto", en: "Ad account" },
  accountId: { sv: "Konto-ID", en: "Account ID" },
  apiUsed: { sv: "API som används", en: "API used" },
  whatINeed: { sv: "Vad jag behöver från dig", en: "What I need from you" },
  sheetsWord: { sv: "Ark", en: "Sheets" },
  connectBtn: { sv: "Anslut", en: "Connect" },
  connectSoon: { sv: "Aktiveras i steg 5", en: "Switched on in stage 5" },
  connectSheets: { sv: "Aktiveras i steg 4", en: "Switched on in stage 4" },
  previewStates: { sv: "Visa hur statuslägena ser ut", en: "Preview how the statuses look" },
  previewOn: { sv: "Visar exempelstatus", en: "Showing example statuses" },
  lineage: { sv: "Det här följer med varje siffra", en: "This travels with every number" },
  lineageSub: {
    sv: "När plattformarna är anslutna sparas de här sex uppgifterna för varje rad, så att du alltid kan spåra en siffra tillbaka till sin källa.",
    en: "Once the platforms are connected these six details are stored for every row, so you can always trace a number back to where it came from.",
  },
  l_platform: { sv: "Vilken plattform", en: "Which platform" },
  l_account: { sv: "Vilket annonskonto", en: "Which ad account" },
  l_where: { sv: "App, land och kampanj", en: "App, country and campaign" },
  l_creative: { sv: "Vilket kreativ", en: "Which creative" },
  l_os: { sv: "iOS eller Android", en: "iOS or Android" },
  l_when: { sv: "När den hämtades", en: "When it was fetched" },
  noFakeAfter: {
    sv: "När en plattform är ansluten slutar panelen använda exempeldata för den plattformen. Exempel och live blandas aldrig i samma siffra.",
    en: "Once a platform is connected the dashboard stops using sample data for that platform. Sample and live are never mixed inside one number.",
  },

  /* ----------------------------------------------------------------- notes */
  noteDate: {
    sv: "Dina ark har ingen datumkolumn ifylld, så alla datum här är exempel. Riktiga publiceringsdatum hämtas från plattformarna i steg 5.",
    en: "Your sheets have no date column filled in, so every date here is an example. Real publish dates get pulled from the platforms in stage 5.",
  },
  noteOS: {
    sv: "iOS/Android står bara i arket där det uttryckligen skrivits (”Bara ios”, ”only ios”). Övriga antas köra på båda.",
    en: "iOS/Android is only recorded in the sheet where it was written out (“Bara ios”, “only ios”). Everything else is assumed to run on both.",
  },
  noteCampaign: {
    sv: "Kampanjnamn saknas i arken. Namnen här följer det förslag jag rekommenderar och är exempel.",
    en: "Campaign names are missing from the sheets. The names here follow the convention I recommend and are examples.",
  },
  noteSheet: {
    sv: "”Ja” i ditt ark betyder uppladdad någon gång, inte nödvändigtvis live just nu. Därför visas två statusar.",
    en: "“Ja” in your sheet means uploaded at some point, not necessarily live right now. That is why two statuses are shown.",
  },
  currencyNote: { sv: "Alla belopp visas i SEK.", en: "All amounts are shown in SEK." },
} satisfies Record<string, Phrase>;

export type StringKey = keyof typeof STRINGS;
