import { useEffect, useState, type ReactNode } from "react";
import { useLang } from "@/i18n/lang";
import type { StringKey } from "@/i18n/strings";
import { useFormat } from "@/lib/format";
import { useMeta } from "@/state/meta";
import { useResolvedRange } from "@/state/params";
import { useStore, type RangePreset, type ViewKey } from "@/state/store";
import { IconRefresh, NAV_ICONS, Sparkle } from "./Icons";

const NAV: { key: ViewKey; label: StringKey }[] = [
  { key: "overview", label: "nav_overview" },
  { key: "creatives", label: "nav_creatives" },
  { key: "performance", label: "nav_performance" },
  { key: "top", label: "nav_top" },
  { key: "unpub", label: "nav_unpub" },
  { key: "publish", label: "nav_publish" },
];

const RANGE_PRESETS: { key: RangePreset; label: StringKey }[] = [
  { key: "today", label: "r_today" },
  { key: "yesterday", label: "r_yesterday" },
  { key: "week", label: "r_week" },
  { key: "month", label: "r_month" },
  { key: "custom", label: "r_custom" },
];

/** How often the dashboard refetches on its own, matching the prototype. */
const AUTO_REFRESH_MS = 15 * 60 * 1000;

export function Shell({
  children,
  unpublishedCount,
}: {
  children: ReactNode;
  unpublishedCount: number | null;
}) {
  const { t, lang, setLang } = useLang();
  const fmt = useFormat();
  const { meta, today, refreshedAt, refresh } = useMeta();
  const { view, app, range, setApp, setView, setRangePreset, setRangeBound } = useStore();
  const resolved = useResolvedRange();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const onRefresh = async () => {
    await refresh();
    setToast(t("refreshed"));
  };

  const rangeLabel =
    range.preset === "custom" && range.from && range.to
      ? `${fmt.date(resolved.from)} – ${fmt.date(resolved.to)}`
      : t(RANGE_PRESETS.find((p) => p.key === range.preset)?.label ?? "r_month");

  return (
    <>
      <div className="app">
        <aside className="rail">
          <div className="brand">
            <div className="mk">
              <span>FG</span>
              <Sparkle className="g" />
            </div>
            <div>
              <b>Flow Group AB</b>
              <small>{t("brandSub")}</small>
            </div>
            <Sparkle className="b1" />
            <Sparkle className="b2 g" />
          </div>

          <nav className="navlist">
            {NAV.map((item) => {
              const Icon = NAV_ICONS[item.key];
              const count =
                item.key === "creatives"
                  ? meta.creativeCount
                  : item.key === "unpub"
                    ? unpublishedCount
                    : null;
              return (
                <button
                  key={item.key}
                  type="button"
                  className="navbtn"
                  aria-current={view === item.key}
                  onClick={() => setView(item.key)}
                >
                  <Icon />
                  <span>{t(item.label)}</span>
                  {count != null ? <span className="cnt">{count}</span> : null}
                </button>
              );
            })}
            <button
              type="button"
              className="navbtn"
              aria-current={view === "settings"}
              onClick={() => setView("settings")}
            >
              <NAV_ICONS.settings />
              <span>{t("nav_settings")}</span>
            </button>
          </nav>

          <div className="railfoot">
            {t("stage")}
            <br />
            {t("currencyNote")}
          </div>
        </aside>

        <div className="main">
          <div className="headwrap">
            <header className="topbar">
              <div className="brand mbrand" style={{ padding: 0 }}>
                <div className="mk">
                  <span>FG</span>
                </div>
                <div>
                  <b>Flow Group</b>
                </div>
              </div>

              <div className="appswitch">
                <button type="button" aria-pressed={app === "all"} onClick={() => setApp("all")}>
                  {t("allApps")}
                </button>
                {meta.apps.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    aria-pressed={app === a.key}
                    onClick={() => setApp(a.key)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="sp" />
              <Sparkle className="t1" />
              <Sparkle className="t2 g" />
              <Sparkle className="t3" />

              <div className="lang">
                <button type="button" aria-pressed={lang === "sv"} onClick={() => setLang("sv")}>
                  SV
                </button>
                <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                  EN
                </button>
              </div>

              <button
                type="button"
                className="iconbtn"
                title={t("nav_settings")}
                onClick={() => setView("settings")}
              >
                <NAV_ICONS.settings />
              </button>
            </header>

            <div className="subbar">
              <div className="seg solid">
                {RANGE_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    aria-pressed={range.preset === p.key}
                    onClick={() => setRangePreset(p.key, today)}
                  >
                    {t(p.label)}
                  </button>
                ))}
              </div>

              {range.preset === "custom" ? (
                <>
                  <input
                    type="date"
                    value={range.from}
                    aria-label={t("f_from")}
                    onChange={(e) => setRangeBound("from", e.target.value)}
                  />
                  <input
                    type="date"
                    value={range.to}
                    aria-label={t("f_to")}
                    onChange={(e) => setRangeBound("to", e.target.value)}
                  />
                </>
              ) : (
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{rangeLabel}</span>
              )}

              <div className="sp" />

              <div className="srclegend">
                <span>
                  <i style={{ background: "var(--ok)" }} />
                  {t("legendReal")}
                </span>
                <span>
                  <i style={{ background: "var(--sample)" }} />
                  {t("legendSample")}
                </span>
              </div>

              <div className="stamp">
                <span className="dot" />
                {t("updated")} {fmt.time(refreshedAt)}
              </div>

              <button type="button" className="iconbtn primary" onClick={() => void onRefresh()}>
                <IconRefresh />
                <span className="lbl">{t("refresh")}</span>
              </button>
            </div>
          </div>

          <div className="wrap">{children}</div>
        </div>
      </div>

      <nav className="tabbar">
        {NAV.map((item) => {
          const Icon = NAV_ICONS[item.key];
          return (
            <button
              key={item.key}
              type="button"
              aria-current={view === item.key}
              onClick={() => setView(item.key)}
            >
              <Icon />
              <span>{t(item.label)}</span>
            </button>
          );
        })}
        <button
          type="button"
          aria-current={view === "settings"}
          onClick={() => setView("settings")}
        >
          <NAV_ICONS.settings />
          <span>{t("nav_settings")}</span>
        </button>
      </nav>

      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}
