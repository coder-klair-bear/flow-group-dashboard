import type { BreakdownDim, MetricKey } from "@shared/types";
import { useCallback } from "react";
import { useLang } from "@/i18n/lang";
import type { StringKey } from "@/i18n/strings";
import { useMeta } from "@/state/meta";

/** Turns a raw grouping key from the API into something a person can read. */
export function useDimLabel() {
  const { t } = useLang();
  const { appLabel, countryName, platformName, creativeOf } = useMeta();

  return useCallback(
    (dim: BreakdownDim, key: string): string => {
      switch (dim) {
        case "app":
          return appLabel(key);
        case "country":
          return countryName(key);
        case "platform":
          return platformName(key);
        case "os":
          return key === "ios" ? t("os_ios") : t("os_android");
        case "creative": {
          const c = creativeOf(key);
          return c ? `${c.id} · ${c.name}` : key;
        }
        default:
          return key;
      }
    },
    [t, appLabel, countryName, platformName, creativeOf],
  );
}

/** Apps and platforms carry their own colour; everything else uses the accent. */
export function useDimColor() {
  const { appColor, platformOf } = useMeta();
  return useCallback(
    (dim: BreakdownDim, key: string): string => {
      if (dim === "app") return appColor(key);
      if (dim === "platform") return platformOf(key)?.color ?? "var(--accent)";
      return "linear-gradient(90deg,var(--accentSoft),var(--accent))";
    },
    [appColor, platformOf],
  );
}

export const DIM_LABEL_KEYS: Record<BreakdownDim, StringKey> = {
  app: "byApp",
  country: "byCountry",
  platform: "byPlatform",
  campaign: "byCampaign",
  creative: "byCreative",
  os: "byOS",
  account: "adAccount",
};

export const METRIC_LABEL_KEYS: Record<MetricKey, StringKey> = {
  spend: "spend",
  installs: "installs",
  cpi: "cpiShort",
  clicks: "clicks",
  impressions: "impressions",
  ctr: "ctr",
  cvr: "cvr",
};

/** Pulls one metric out of a totals object. */
export function metricValue(
  totals: {
    spend: number;
    installs: number;
    clicks: number;
    impressions: number;
    cpi: number | null;
    ctr: number | null;
    cvr: number | null;
  },
  metric: MetricKey,
): number {
  switch (metric) {
    case "installs":
      return totals.installs;
    case "clicks":
      return totals.clicks;
    case "impressions":
      return totals.impressions;
    case "cpi":
      return totals.cpi ?? 0;
    case "ctr":
      return totals.ctr ?? 0;
    case "cvr":
      return totals.cvr ?? 0;
    default:
      return totals.spend;
  }
}
