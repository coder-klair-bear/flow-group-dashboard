import type { CreativesDto } from "@shared/types";
import { CreativeCard } from "@/components/creative";
import { FilterBar } from "@/components/FilterBar";
import {
  Card,
  Empty,
  Failure,
  Loading,
  PageHead,
  Segmented,
  SheetStatusPill,
  StatusPill,
} from "@/components/primitives";
import { useLang } from "@/i18n/lang";
import { useFormat } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/state/meta";
import { useApiParams } from "@/state/params";
import { useStore } from "@/state/store";

/** The table can get long; beyond this the filters are the better tool. */
const MAX_TABLE_ROWS = 400;

export function Creatives() {
  const { t } = useLang();
  const fmt = useFormat();
  const { appLabel, platformShort } = useMeta();
  const { crView, set } = useStore();
  const params = useApiParams();

  const { data, error, loading, refreshing, reload } = useApi<CreativesDto>("/creatives", params);

  const head = <PageHead title="cr_h" subtitle="cr_s" />;

  if (loading) {
    return (
      <>
        {head}
        <FilterBar showDates />
        <Loading />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        {head}
        <FilterBar showDates />
        <Failure message={error} onRetry={reload} />
      </>
    );
  }
  if (!data) return null;

  const { creatives, placements, totalCreatives } = data;

  return (
    <div className={refreshing ? "stale" : undefined}>
      {head}
      <FilterBar showDates />

      <div className="resbar">
        <span>
          {t("showing")} <b>{creatives.length}</b> {t("of")} {totalCreatives} {t("creativesWord")}
          {crView === "table" ? ` · ${placements.length} ${t("rowsWord")}` : ""}
        </span>
        <div style={{ marginLeft: "auto" }}>
          <Segmented
            value={crView}
            onChange={(v) => set("crView", v)}
            options={[
              { value: "cards", label: t("viewCards") },
              { value: "table", label: t("viewTable") },
            ]}
          />
        </div>
      </div>

      {!creatives.length ? (
        <Card>
          <Empty />
        </Card>
      ) : crView === "cards" ? (
        <>
          <div className="cgrid">
            {creatives.map((c) => (
              <CreativeCard key={c.id} creative={c} />
            ))}
          </div>
          <Card style={{ marginTop: 12 }}>
            <div className="note" style={{ borderTop: 0 }}>
              <b>{t("col_published")}:</b> {t("noteSheet")}
              <br />
              {t("noteDate")}
            </div>
          </Card>
        </>
      ) : (
        <Card pad0>
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>{t("col_creative")}</th>
                  <th>{t("col_app")}</th>
                  <th>{t("col_country")}</th>
                  <th>{t("byPlatform")}</th>
                  <th>{t("col_os")}</th>
                  <th>{t("col_campaign")}</th>
                  <th>{t("col_date")}</th>
                  <th>{t("col_sheet")}</th>
                  <th>{t("col_platform")}</th>
                </tr>
              </thead>
              <tbody>
                {placements.slice(0, MAX_TABLE_ROWS).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="nm">{p.creativeName}</div>
                      <span className="id">{p.creativeId}</span>
                    </td>
                    <td>{appLabel(p.appKey)}</td>
                    <td>
                      <span className="cc">{p.countryCode}</span>
                    </td>
                    <td>{platformShort(p.platformKey)}</td>
                    <td>{p.os.length === 1 ? t("os_ios") : t("os_both")}</td>
                    <td>
                      <span className="id">{p.campaign}</span>
                    </td>
                    <td className={p.publishedOn ? "smp" : undefined}>{fmt.date(p.publishedOn)}</td>
                    <td>
                      <SheetStatusPill status={p.sheetStatus} />
                    </td>
                    <td>
                      <StatusPill status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="note">
            <b>{t("col_sheet")}</b> {t("noteSheet")}
            <br />
            <b>{t("col_date")}</b> {t("noteDate")}
            <br />
            <b>{t("col_os")}</b> {t("noteOS")}
          </div>
        </Card>
      )}
    </div>
  );
}
