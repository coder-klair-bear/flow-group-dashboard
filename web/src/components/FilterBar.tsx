import type { OsFilter } from "@shared/types";
import { useEffect, useState } from "react";
import { useLang } from "@/i18n/lang";
import type { StringKey } from "@/i18n/strings";
import { useMeta } from "@/state/meta";
import { useStore, type FiltersState } from "@/state/store";
import { IconSearch } from "./Icons";

const STATUS_OPTIONS: { value: string; key: StringKey }[] = [
  { value: "live", key: "st_live" },
  { value: "paused", key: "st_paused" },
  { value: "planned", key: "st_planned" },
  { value: "rejected", key: "st_rejected" },
  { value: "notpub", key: "st_notpub" },
  { value: "missing", key: "notFound" },
];

function Select({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const { t } = useLang();
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">{t("all")}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * The shared filter bar. `showDates` adds the publish-date pickers, which only
 * make sense where a publish date is on screen.
 */
export function FilterBar({ showDates = false }: { showDates?: boolean }) {
  const { t } = useLang();
  const { meta, sheetPlatforms, countryName } = useMeta();
  const { app, filters, setApp, setFilter, clearFilters } = useStore();

  // The search box is uncontrolled between keystrokes so typing stays smooth;
  // the store only hears about it once the user pauses.
  const [draft, setDraft] = useState(filters.q);
  useEffect(() => setDraft(filters.q), [filters.q]);
  useEffect(() => {
    if (draft === filters.q) return;
    const id = window.setTimeout(() => setFilter("q", draft), 220);
    return () => window.clearTimeout(id);
  }, [draft, filters.q, setFilter]);

  const countryOptions = [
    ...new Set(
      meta.creatives
        .filter((c) => app === "all" || c.appKey === app)
        .flatMap((c) => c.countries),
    ),
  ]
    .sort()
    .map((code) => ({ value: code, label: countryName(code) }));

  const campaignOptions = meta.campaigns
    .filter((c) => app === "all" || c.startsWith(app === "sveapanelen" ? "SVE_" : "REW_"))
    .map((c) => ({ value: c, label: c }));

  const setText = (key: keyof FiltersState) => (value: string) => setFilter(key, value as never);

  return (
    <div className="filters">
      <div className="fld">
        <label htmlFor="f_app">{t("f_app")}</label>
        <select id="f_app" value={app} onChange={(e) => setApp(e.target.value)}>
          <option value="all">{t("all")}</option>
          {meta.apps.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className="fld srch">
        <IconSearch />
        <input
          type="text"
          id="f_q"
          placeholder={t("f_search")}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>

      <Select
        id="f_country"
        label={t("f_country")}
        value={filters.country}
        options={countryOptions}
        onChange={setText("country")}
      />
      <Select
        id="f_platform"
        label={t("f_platform")}
        value={filters.platform}
        options={sheetPlatforms.map((p) => ({ value: p.key, label: p.name }))}
        onChange={setText("platform")}
      />
      <Select
        id="f_os"
        label={t("f_os")}
        value={filters.os}
        options={[
          { value: "ios", label: t("os_ios") },
          { value: "android", label: t("os_android") },
        ]}
        onChange={(v) => setFilter("os", v as OsFilter)}
      />
      <Select
        id="f_campaign"
        label={t("f_campaign")}
        value={filters.campaign}
        options={campaignOptions}
        onChange={setText("campaign")}
      />
      <Select
        id="f_status"
        label={t("f_status")}
        value={filters.status}
        options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: t(s.key) }))}
        onChange={setText("status")}
      />

      {showDates ? (
        <>
          <div className="fld">
            <label htmlFor="f_pubFrom">{t("f_from")}</label>
            <input
              type="date"
              id="f_pubFrom"
              value={filters.pubFrom}
              onChange={(e) => setFilter("pubFrom", e.target.value)}
            />
          </div>
          <div className="fld">
            <label htmlFor="f_pubTo">{t("f_to")}</label>
            <input
              type="date"
              id="f_pubTo"
              value={filters.pubTo}
              onChange={(e) => setFilter("pubTo", e.target.value)}
            />
          </div>
        </>
      ) : null}

      <button type="button" className="clearf" onClick={clearFilters}>
        {t("clear")}
      </button>
    </div>
  );
}
