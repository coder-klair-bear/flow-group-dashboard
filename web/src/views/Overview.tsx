import type { AlertDto, BreakdownDim, OverviewDto } from "@shared/types";
import { Bars, Sparkline, type BarItem } from "@/components/charts";
import {
  Card,
  CardHead,
  Divider,
  Failure,
  Loading,
  PageHead,
  RealChip,
  SampleBanner,
  SampleChip,
  Segmented,
} from "@/components/primitives";
import { Delta, StatCard } from "@/components/StatCard";
import { useLang } from "@/i18n/lang";
import { useFormat } from "@/lib/format";
import { DIM_LABEL_KEYS, useDimColor, useDimLabel } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/state/meta";
import { useApiParams, useResolvedRange } from "@/state/params";
import { useStore, type ViewKey } from "@/state/store";

const OVERVIEW_DIMS: BreakdownDim[] = ["app", "country", "platform", "campaign", "os"];

const SEVERITY_COLOR: Record<string, string> = {
  bad: "var(--bad)",
  warn: "var(--warn)",
  info: "var(--none)",
};

function AlertRow({ alert, onOpen }: { alert: AlertDto; onOpen: (view: ViewKey) => void }) {
  const { t, lang } = useLang();
  return (
    <div className="alert">
      <span className="bul" style={{ background: SEVERITY_COLOR[alert.severity] }} />
      <div style={{ minWidth: 0 }}>
        <h4>
          {lang === "sv" ? alert.titleSv : alert.titleEn}{" "}
          {alert.fromSheet ? <RealChip /> : <SampleChip />}
        </h4>
        <p>{lang === "sv" ? alert.detailSv : alert.detailEn}</p>
      </div>
      <button type="button" className="go" onClick={() => onOpen(alert.target as ViewKey)}>
        {t("openSection")}
      </button>
    </div>
  );
}

export function Overview() {
  const { t } = useLang();
  const fmt = useFormat();
  const { platformOf } = useMeta();
  const { ovDim, set, setView } = useStore();
  const dimLabel = useDimLabel();
  const dimColor = useDimColor();
  const range = useResolvedRange();
  const params = useApiParams({ dim: ovDim });

  const { data, error, loading, refreshing, reload } = useApi<OverviewDto>("/overview", params);

  if (loading) {
    return (
      <>
        <PageHead title="ov_h" subtitle="ov_s" />
        <Loading />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <PageHead title="ov_h" subtitle="ov_s" />
        <Failure message={error} onRetry={reload} />
      </>
    );
  }
  if (!data) return null;

  const { periods, current, previous, coverage, alerts, breakdown, creativeCount } = data;

  const bars: BarItem[] = breakdown.map((row) => ({
    key: row.key,
    label: dimLabel(ovDim, row.key),
    value: row.spend,
    display: fmt.money(row.spend),
    color: dimColor(ovDim, row.key),
    sub: `${fmt.int(row.installs)} ${t("installs").toLowerCase()} · ${t("cpiShort")} ${fmt.money2(row.cpi)}`,
  }));

  const rangeLabel = `${fmt.date(range.from)} – ${fmt.date(range.to)}`;

  return (
    <div className={refreshing ? "stale" : undefined}>
      <PageHead title="ov_h" subtitle="ov_s" />
      <SampleBanner />

      <div className="grid g3" style={{ marginBottom: 6 }}>
        <StatCard label={t("spendToday")} value={fmt.money(periods.today.spend)}>
          <Delta
            current={periods.today.spend}
            previous={periods.yesterday.spend}
            label={t("vsYesterday")}
          />
        </StatCard>
        <StatCard label={t("spendWeek")} value={fmt.money(periods.week.spend)}>
          <Delta
            current={periods.week.spend}
            previous={periods.lastWeek.spend}
            label={t("vsPrevWeek")}
          />
        </StatCard>
        <StatCard
          label={t("spendMonth")}
          value={fmt.money(periods.month.spend)}
          footer={<Sparkline values={data.spark} />}
        >
          <Delta
            current={periods.month.spend}
            previous={periods.lastMonth.spend}
            label={t("vsPrevMonth")}
          />
        </StatCard>
      </div>

      <Divider label={`${t("selected")}: ${rangeLabel}`} />

      <div className="grid g5" style={{ marginBottom: 12 }}>
        <StatCard label={t("installs")} value={fmt.int(current.installs)}>
          <Delta current={current.installs} previous={previous.installs} label={t("vsPrev")} />
        </StatCard>
        <StatCard label={t("cpi")} value={fmt.money2(current.cpi)}>
          <Delta current={current.cpi} previous={previous.cpi} label={t("vsPrev")} invert />
        </StatCard>
        <StatCard label={t("ctr")} value={fmt.pct(current.ctr)}>
          <Delta current={current.ctr} previous={previous.ctr} label={t("vsPrev")} />
        </StatCard>
        <StatCard label={t("impressions")} value={fmt.int(current.impressions)}>
          <Delta
            current={current.impressions}
            previous={previous.impressions}
            label={t("vsPrev")}
          />
        </StatCard>
        <StatCard label={t("clicks")} value={fmt.int(current.clicks)}>
          <Delta current={current.clicks} previous={previous.clicks} label={t("vsPrev")} />
        </StatCard>
      </div>

      {/* Alerts ------------------------------------------------------- */}
      <Card pad0 style={{ marginBottom: 13 }}>
        <CardHead title={t("attention")} sparkle count={alerts.length} />
        {alerts.length ? (
          alerts.map((a) => <AlertRow key={a.id} alert={a} onOpen={setView} />)
        ) : (
          <div className="empty">{t("noAlerts")}</div>
        )}
        <div className="note">{t("attentionSub")}</div>
      </Card>

      {/* Coverage ----------------------------------------------------- */}
      <Card pad0 style={{ marginBottom: 13 }}>
        <CardHead title={t("coverage")} chip={<RealChip />} />
        <div style={{ padding: "15px 16px" }}>
          <div className="cov">
            {coverage.map((c) => {
              const platform = platformOf(c.platformKey);
              if (!c.inSheet) {
                return (
                  <div className="covc" key={c.platformKey}>
                    <h4>{platform?.short ?? c.platformKey}</h4>
                    <div className="bar" />
                    <div className="covm">
                      <span>{t("st_notconnected")}</span>
                      <b>–</b>
                    </div>
                  </div>
                );
              }
              const n = creativeCount || 1;
              return (
                <div className="covc" key={c.platformKey}>
                  <h4>{platform?.short ?? c.platformKey}</h4>
                  <div className="bar">
                    <i style={{ width: `${((c.yes / n) * 100).toFixed(1)}%`, background: "var(--ok)" }} />
                    <i style={{ width: `${((c.ios / n) * 100).toFixed(1)}%`, background: "var(--warn)" }} />
                    <i
                      style={{
                        width: `${((c.rejected / n) * 100).toFixed(1)}%`,
                        background: "var(--bad)",
                      }}
                    />
                  </div>
                  <div className="covm">
                    <span>
                      {c.yes} / {creativeCount}
                    </span>
                    <b>{c.pct} %</b>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mxlegend">
          <span>
            <i style={{ background: "var(--ok)" }} />
            {t("st_uploaded")}
          </span>
          <span>
            <i style={{ background: "var(--warn)" }} />
            {t("st_ios")}
          </span>
          <span>
            <i style={{ background: "var(--bad)" }} />
            {t("st_rejected")}
          </span>
          <span>
            <i style={{ background: "var(--noneBg)" }} />
            {t("st_notpub")}
          </span>
        </div>
      </Card>

      {/* Breakdown ---------------------------------------------------- */}
      <Card pad0>
        <CardHead
          title={t("results")}
          chip={<SampleChip />}
          right={
            <Segmented
              value={ovDim}
              onChange={(v) => set("ovDim", v)}
              options={OVERVIEW_DIMS.map((d) => ({ value: d, label: t(DIM_LABEL_KEYS[d]) }))}
            />
          }
        />
        <Bars items={bars} />
        <div className="note">
          {t("selected")}: {rangeLabel}. {t("noteCampaign")}
        </div>
      </Card>
    </div>
  );
}
