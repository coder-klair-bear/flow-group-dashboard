import type { BreakdownDim, Granularity, MetricKey, PerformanceDto } from "@shared/types";
import { LineChart, type LinePoint } from "@/components/charts";
import { FilterBar } from "@/components/FilterBar";
import {
  Card,
  CardHead,
  Empty,
  Failure,
  Loading,
  PageHead,
  SampleBanner,
  SampleChip,
  Segmented,
} from "@/components/primitives";
import { useLang } from "@/i18n/lang";
import { useFormat } from "@/lib/format";
import { DIM_LABEL_KEYS, METRIC_LABEL_KEYS, metricValue, useDimLabel } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { useApiParams, useResolvedRange } from "@/state/params";
import { useStore } from "@/state/store";

const GRANS: { value: Granularity; key: "perDay" | "perWeek" | "perMonth" }[] = [
  { value: "day", key: "perDay" },
  { value: "week", key: "perWeek" },
  { value: "month", key: "perMonth" },
];

const METRICS: MetricKey[] = ["spend", "installs", "cpi", "clicks", "impressions", "ctr", "cvr"];

const DIMS: BreakdownDim[] = [
  "app",
  "country",
  "platform",
  "campaign",
  "creative",
  "os",
  "account",
];

export function Performance() {
  const { t } = useLang();
  const fmt = useFormat();
  const dimLabel = useDimLabel();
  const { pfGran, pfDim, pfMetric, set } = useStore();
  const range = useResolvedRange();
  const params = useApiParams({ gran: pfGran, dim: pfDim });

  const { data, error, loading, refreshing, reload } = useApi<PerformanceDto>(
    "/performance",
    params,
  );

  const head = <PageHead title="pf_h" subtitle="pf_s" />;

  if (loading) {
    return (
      <>
        {head}
        <SampleBanner />
        <FilterBar showDates />
        <Loading />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        {head}
        <SampleBanner />
        <FilterBar showDates />
        <Failure message={error} onRetry={reload} />
      </>
    );
  }
  if (!data) return null;

  const { totals, series, breakdown } = data;

  const points: LinePoint[] = series.map((s) => ({
    label: fmt.bucketLabel(s.bucket, pfGran),
    value: metricValue(s, pfMetric),
  }));

  // Axis ticks are short so they never collide; the tooltip carries the full value.
  const axisFormat = (v: number) => {
    if (pfMetric === "ctr" || pfMetric === "cvr") return `${v.toFixed(1)}%`;
    if (pfMetric === "cpi") return `${Math.round(v)}`;
    return fmt.compact(v);
  };

  const metricName = t(METRIC_LABEL_KEYS[pfMetric]);

  return (
    <div className={refreshing ? "stale" : undefined}>
      {head}
      <SampleBanner />
      <FilterBar showDates />

      <div className="grid g5" style={{ marginBottom: 12 }}>
        <div className="card">
          <p className="klabel">{t("spend")}</p>
          <span className="kval sm smp">{fmt.money(totals.spend)}</span>
        </div>
        <div className="card">
          <p className="klabel">{t("installs")}</p>
          <span className="kval sm smp">{fmt.int(totals.installs)}</span>
        </div>
        <div className="card">
          <p className="klabel">{t("cpiShort")}</p>
          <span className="kval sm smp">{fmt.money2(totals.cpi)}</span>
        </div>
        <div className="card">
          <p className="klabel">{t("ctr")}</p>
          <span className="kval sm smp">{fmt.pct(totals.ctr)}</span>
        </div>
        <div className="card">
          <p className="klabel">{t("cvr")}</p>
          <span className="kval sm smp">{fmt.pct(totals.cvr, 1)}</span>
        </div>
      </div>

      {!series.length ? (
        <Card>
          <Empty />
        </Card>
      ) : (
        <>
          <Card pad0 style={{ marginBottom: 12 }}>
            <CardHead
              title={t("trend")}
              chip={<SampleChip />}
              right={
                <>
                  <Segmented
                    value={pfGran}
                    onChange={(v) => set("pfGran", v)}
                    options={GRANS.map((g) => ({ value: g.value, label: t(g.key) }))}
                  />
                  <Segmented
                    value={pfMetric}
                    onChange={(v) => set("pfMetric", v)}
                    options={METRICS.map((m) => ({
                      value: m,
                      label: t(METRIC_LABEL_KEYS[m]),
                    }))}
                  />
                </>
              }
            />
            <div className="chartbox">
              <LineChart points={points} formatY={axisFormat} ariaLabel={metricName} />
            </div>
            <div className="legend">
              <span>
                <i style={{ background: "var(--accent)" }} />
                {metricName}
              </span>
            </div>
          </Card>

          <Card pad0>
            <CardHead
              title={t("breakdown")}
              chip={<SampleChip />}
              right={
                <Segmented
                  value={pfDim}
                  onChange={(v) => set("pfDim", v)}
                  options={DIMS.map((d) => ({ value: d, label: t(DIM_LABEL_KEYS[d]) }))}
                />
              }
            />
            <div className="tscroll">
              <table>
                <thead>
                  <tr>
                    <th>{t(DIM_LABEL_KEYS[pfDim])}</th>
                    <th className="num">{t("spend")}</th>
                    <th className="num">{t("installs")}</th>
                    <th className="num">{t("cpiShort")}</th>
                    <th className="num">{t("impressions")}</th>
                    <th className="num">{t("clicks")}</th>
                    <th className="num">{t("ctr")}</th>
                    <th className="num">{t("cvr")}</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row) => (
                    <tr key={row.key}>
                      <td className="nm">{dimLabel(pfDim, row.key)}</td>
                      <td className="num smp">{fmt.money(row.spend)}</td>
                      <td className="num smp">{fmt.int(row.installs)}</td>
                      <td className="num smp">{fmt.money2(row.cpi)}</td>
                      <td className="num smp">{fmt.int(row.impressions)}</td>
                      <td className="num smp">{fmt.int(row.clicks)}</td>
                      <td className="num smp">{fmt.pct(row.ctr)}</td>
                      <td className="num smp">{fmt.pct(row.cvr, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="note">
              {t("selected")}: {fmt.date(range.from)} – {fmt.date(range.to)}. {t("noteOS")}{" "}
              {t("noteCampaign")}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
