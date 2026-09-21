import type { UnpublishedDto } from "@shared/types";
import { platformCode, TinyThumb, UnpublishedCard } from "@/components/creative";
import {
  Card,
  CountryCodes,
  Divider,
  Failure,
  Loading,
  PageHead,
  RealChip,
} from "@/components/primitives";
import { StatCard } from "@/components/StatCard";
import { useLang } from "@/i18n/lang";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/state/meta";
import { useApiParams } from "@/state/params";

export function Unpublished() {
  const { t, pick } = useLang();
  const { creativeOf, platformShort } = useMeta();
  const params = useApiParams();

  const { data, error, loading, refreshing, reload } = useApi<UnpublishedDto>(
    "/unpublished",
    params,
  );

  const head = <PageHead title="up_h" subtitle="up_s" />;

  if (loading) {
    return (
      <>
        {head}
        <Loading />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        {head}
        <Failure message={error} onRetry={reload} />
      </>
    );
  }
  if (!data) return null;

  const { nowhere, gaps, iosOnly, counts } = data;

  return (
    <div className={refreshing ? "stale" : undefined}>
      {head}

      <div className="grid g3" style={{ marginBottom: 6 }}>
        <StatCard
          label={t("nowhere")}
          value={String(counts.nowhere)}
          sample={false}
          valueColor="var(--bad)"
          footer={t("readyToPublish")}
        />
        <StatCard
          label={t("partly")}
          value={String(counts.gaps)}
          sample={false}
          valueColor="var(--warn)"
          footer={`${t("missingOn")} 1+`}
        />
        <StatCard
          label={t("androidMissing")}
          value={String(counts.iosOnly)}
          sample={false}
          valueColor="var(--warn)"
          footer={`${t("os_ios")} ${t("of")} ${t("os_both")}`}
        />
      </div>

      {/* 1 — out nowhere at all -------------------------------------- */}
      <Divider label={t("nowhere")} />
      {nowhere.length ? (
        <div className="cgrid">
          {nowhere.map((c) => (
            <UnpublishedCard key={c.id} creative={c} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="empty">{t("noAlerts")}</div>
        </Card>
      )}
      <Card style={{ marginTop: 13 }}>
        <div className="note" style={{ borderTop: 0, padding: 0 }}>
          {t("nowhereSub")}
        </div>
      </Card>

      {/* 2 — out on some platforms, missing on others ---------------- */}
      <Divider label={t("partly")} />
      <Card pad0>
        {gaps.length ? (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>{t("col_creative")}</th>
                  <th>{t("col_country")}</th>
                  <th>{t("missingOn")}</th>
                  <th>{t("outOn")}</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((g) => {
                  const creative = creativeOf(g.creativeId);
                  return (
                    <tr key={`${g.creativeId}-${g.platformKey}`}>
                      <td style={{ width: 56 }}>
                        <TinyThumb creative={creative} size={38} />
                      </td>
                      <td>
                        <div className="nm">{creative?.name ?? g.creativeId}</div>
                        <span className="id">{g.creativeId}</span>
                      </td>
                      <td>
                        <CountryCodes codes={creative?.countries ?? []} />
                      </td>
                      <td>
                        <span className="pill p-none">{platformShort(g.platformKey)}</span>
                      </td>
                      <td>
                        <span className="plats" style={{ margin: 0 }}>
                          {g.outOn.map((key) => (
                            <span className="pf c-ok" key={key}>
                              {platformCode(key)}
                            </span>
                          ))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">{t("noAlerts")}</div>
        )}
        <div className="note">{t("partlySub")}</div>
      </Card>

      {/* 3 — uploaded for iOS but not Android ------------------------ */}
      {iosOnly.length ? (
        <>
          <Divider label={t("androidMissing")} />
          <Card pad0>
            <div className="tscroll">
              <table>
                <thead>
                  <tr>
                    <th />
                    <th>{t("col_creative")}</th>
                    <th>{t("col_country")}</th>
                    <th>{t("byPlatform")}</th>
                    <th>{t("col_sheet")}</th>
                  </tr>
                </thead>
                <tbody>
                  {iosOnly.map((row) => {
                    const creative = creativeOf(row.creativeId);
                    return (
                      <tr key={`${row.creativeId}-${row.platformKey}`}>
                        <td style={{ width: 56 }}>
                          <TinyThumb creative={creative} size={38} />
                        </td>
                        <td>
                          <div className="nm">{creative?.name ?? row.creativeId}</div>
                          <span className="id">{row.creativeId}</span>
                        </td>
                        <td>
                          <CountryCodes codes={creative?.countries ?? []} />
                        </td>
                        <td>{platformShort(row.platformKey)}</td>
                        <td>
                          <span className="pill p-warn">{t("st_ios")}</span>{" "}
                          <span style={{ color: "var(--muted)", fontSize: 12 }}>
                            {pick(creative?.noteSv, creative?.noteEn)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="note">{t("noteOS")}</div>
          </Card>
        </>
      ) : null}

      <div style={{ height: 8 }} />
      <Card>
        <div className="note" style={{ borderTop: 0, padding: 0 }}>
          <RealChip /> {t("attentionSub")}
        </div>
      </Card>
    </div>
  );
}
