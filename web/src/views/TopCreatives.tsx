import type { RankKey, RankedCreative, TopDto } from "@shared/types";
import { TinyThumb } from "@/components/creative";
import { FilterBar } from "@/components/FilterBar";
import {
  Card,
  CardHead,
  CountryCodes,
  Empty,
  Failure,
  Loading,
  PageHead,
  SampleBanner,
  SampleChip,
  Segmented,
} from "@/components/primitives";
import { useLang } from "@/i18n/lang";
import { useFormat, type Formatters } from "@/lib/format";
import { DIM_LABEL_KEYS, useDimLabel } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/state/meta";
import { useApiParams } from "@/state/params";
import { useStore } from "@/state/store";

const RANKS: { value: RankKey; key: "mostInstalls" | "lowestCPI" | "highestCTR" | "highestSpend" }[] =
  [
    { value: "installs", key: "mostInstalls" },
    { value: "cpi", key: "lowestCPI" },
    { value: "ctr", key: "highestCTR" },
    { value: "spend", key: "highestSpend" },
  ];

const DIMS = ["app", "country", "platform", "os"] as const;

function rankValue(row: RankedCreative, rank: RankKey, fmt: Formatters): string {
  switch (rank) {
    case "installs":
      return fmt.int(row.installs);
    case "cpi":
      return fmt.money2(row.cpi);
    case "ctr":
      return fmt.pct(row.ctr);
    default:
      return fmt.money(row.spend);
  }
}

function RankRow({
  row,
  index,
  best,
  rank,
  tone,
}: {
  row: RankedCreative;
  index: number;
  best: number;
  rank: RankKey;
  tone?: "top" | "low";
}) {
  const { t } = useLang();
  const fmt = useFormat();
  const { creativeOf, appLabel } = useMeta();
  const creative = creativeOf(row.creativeId);

  // For cost per install a lower number is better, so the bar is inverted:
  // the cheapest creative fills it, not the most expensive.
  const share =
    rank === "cpi"
      ? best / (row.cpi || best || 1)
      : ((rank === "installs" ? row.installs : rank === "ctr" ? (row.ctr ?? 0) : row.spend) || 0) /
        (best || 1);

  return (
    <div className={`rank ${tone ?? ""}`.trim()}>
      <span className="rk">{index + 1}</span>
      <TinyThumb creative={creative} size={42} />
      <div className="info">
        <h5>{creative?.name ?? row.creativeId}</h5>
        <div className="meta">
          <span className="id">{row.creativeId}</span>
          {creative ? <CountryCodes codes={creative.countries} /> : null}
          {creative ? (
            <span style={{ color: "var(--muted)", fontSize: 11.5 }}>
              {appLabel(creative.appKey)}
            </span>
          ) : null}
          {tone === "top" ? <span className="pill p-ok">{t("topPerformer")}</span> : null}
          {tone === "low" ? <span className="pill p-bad">{t("needsAttention")}</span> : null}
        </div>
        <div className="mini">
          <i style={{ width: `${Math.max(3, Math.min(100, share * 100)).toFixed(0)}%` }} />
        </div>
      </div>
      <div className="val">
        <b className="smp">{rankValue(row, rank, fmt)}</b>
        <small className="smp">
          {fmt.int(row.installs)} {t("installs").toLowerCase()} · {t("cpiShort")}{" "}
          {fmt.money2(row.cpi)} · {t("ctr")} {fmt.pct(row.ctr)}
        </small>
      </div>
    </div>
  );
}

export function TopCreatives() {
  const { t } = useLang();
  const fmt = useFormat();
  const { creativeOf } = useMeta();
  const dimLabel = useDimLabel();
  const { tpRank, tpDim, set } = useStore();
  const params = useApiParams({ rank: tpRank, dim: tpDim });

  const { data, error, loading, refreshing, reload } = useApi<TopDto>("/top", params);

  const head = <PageHead title="tp_h" subtitle="tp_s" />;

  if (loading) {
    return (
      <>
        {head}
        <SampleBanner />
        <FilterBar />
        <Loading />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        {head}
        <SampleBanner />
        <FilterBar />
        <Failure message={error} onRetry={reload} />
      </>
    );
  }
  if (!data) return null;

  const { ranked, weak, bestPerDim } = data;
  const first = ranked[0];
  const best =
    first == null
      ? 1
      : tpRank === "cpi"
        ? (first.cpi ?? 1)
        : tpRank === "installs"
          ? first.installs
          : tpRank === "ctr"
            ? (first.ctr ?? 1)
            : first.spend;

  return (
    <div className={refreshing ? "stale" : undefined}>
      {head}
      <SampleBanner />
      <FilterBar />

      <Card pad0 style={{ marginBottom: 12 }}>
        <CardHead
          title={t("rankBy")}
          chip={<SampleChip />}
          right={
            <Segmented
              value={tpRank}
              onChange={(v) => set("tpRank", v)}
              options={RANKS.map((r) => ({ value: r.value, label: t(r.key) }))}
            />
          }
        />
        {ranked.length ? (
          ranked.map((row, i) => (
            <RankRow
              key={row.creativeId}
              row={row}
              index={i}
              best={best}
              rank={tpRank}
              tone={i < 3 ? "top" : undefined}
            />
          ))
        ) : (
          <Empty />
        )}
        <div className="note">{t("noPause")}</div>
      </Card>

      {weak.length ? (
        <Card pad0 style={{ marginBottom: 12 }}>
          <CardHead title={t("losers")} chip={<SampleChip />} />
          {weak.map((row, i) => (
            <RankRow
              key={row.creativeId}
              row={row}
              index={i}
              best={weak[0]?.cpi ?? 1}
              rank="cpi"
              tone="low"
            />
          ))}
          <div className="note">{t("losersNote")}</div>
        </Card>
      ) : null}

      <Card pad0>
        <CardHead
          title={t("bestPer")}
          chip={<SampleChip />}
          right={
            <Segmented
              value={tpDim}
              onChange={(v) => set("tpDim", v)}
              options={DIMS.map((d) => ({ value: d, label: t(DIM_LABEL_KEYS[d]) }))}
            />
          }
        />
        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>{t(DIM_LABEL_KEYS[tpDim])}</th>
                <th>{t("col_creative")}</th>
                <th className="num">{t("installs")}</th>
                <th className="num">{t("cpiShort")}</th>
                <th className="num">{t("ctr")}</th>
                <th className="num">{t("spend")}</th>
              </tr>
            </thead>
            <tbody>
              {bestPerDim.map((row) => {
                const creative = creativeOf(row.creativeId);
                return (
                  <tr key={`${row.dimKey}-${row.creativeId}`}>
                    <td className="nm">{dimLabel(tpDim, row.dimKey)}</td>
                    <td>
                      <div className="nm">{creative?.name ?? row.creativeId}</div>
                      <span className="id">{row.creativeId}</span>{" "}
                      <span className="pill p-ok">{t("topPerformer")}</span>
                    </td>
                    <td className="num smp">{fmt.int(row.installs)}</td>
                    <td className="num smp">{fmt.money2(row.cpi)}</td>
                    <td className="num smp">{fmt.pct(row.ctr)}</td>
                    <td className="num smp">{fmt.money(row.spend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="note">{t("noPause")}</div>
      </Card>
    </div>
  );
}
