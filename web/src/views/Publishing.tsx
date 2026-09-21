import type { PublishingDto } from "@shared/types";
import {
  Card,
  CardHead,
  CountryCodes,
  Failure,
  Loading,
  PageHead,
  RealChip,
  SampleChip,
  SheetStatusPill,
  sheetStatusClass,
  sheetStatusGlyph,
  sheetStatusLabel,
  StatusPill,
} from "@/components/primitives";
import { StatCard } from "@/components/StatCard";
import { useLang } from "@/i18n/lang";
import { useFormat } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/state/meta";
import { useApiParams } from "@/state/params";

/** The "where and when" table is a sample stand-in; a few hundred rows is plenty. */
const MAX_LIVE_ROWS = 300;
const MAX_MISMATCH_ROWS = 40;

export function Publishing() {
  const { t, pick, lang } = useLang();
  const fmt = useFormat();
  const { meta, platformShort, platformName, appLabel, creativeOf } = useMeta();
  const params = useApiParams();

  const { data, error, loading, refreshing, reload } = useApi<PublishingDto>(
    "/publishing",
    params,
  );

  const head = <PageHead title="pb_h" subtitle="pb_s" />;

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

  const { summary, creatives, livePlacements, gaps, rejections, mismatches, duplicates } = data;

  return (
    <div className={refreshing ? "stale" : undefined}>
      {head}

      <div className="grid g5" style={{ marginBottom: 14 }}>
        <StatCard
          label={t("st_uploaded")}
          value={String(summary.uploaded)}
          sample={false}
          small
          valueColor="var(--ok)"
          footer={`${t("of")} ${summary.slots} ${t("slots")}`}
        />
        <StatCard
          label={t("st_notpub")}
          value={String(summary.missing)}
          sample={false}
          small
          valueColor="var(--none)"
          footer={t("gaps")}
        />
        <StatCard
          label={t("st_ios")}
          value={String(summary.iosOnly)}
          sample={false}
          small
          valueColor="var(--warn)"
          footer={`${t("os_android")} –`}
        />
        <StatCard
          label={t("st_rejected")}
          value={String(summary.rejected)}
          sample={false}
          small
          valueColor="var(--bad)"
          footer={t("rejectedList")}
        />
        <StatCard
          label={t("mismatch")}
          value={String(summary.mismatches)}
          small
          valueColor="var(--sample)"
          footer={t("onPlatform")}
        />
      </div>

      {/* Creative × platform matrix — real ---------------------------- */}
      <Card pad0 style={{ marginBottom: 14 }}>
        <CardHead title={t("matrix")} chip={<RealChip />} />
        <div className="tscroll">
          <table className="mx">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>{t("col_creative")}</th>
                <th>{t("col_country")}</th>
                {meta.platforms.map((p) => (
                  <th key={p.key} style={{ textAlign: "center" }}>
                    {p.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creatives.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="nm">{c.name}</div>
                    <span className="id">{c.id}</span>
                    {c.bundle ? (
                      <span className="pill p-plain p-acc"> {c.bundle} ×</span>
                    ) : null}
                  </td>
                  <td>
                    <CountryCodes codes={c.countries} />
                  </td>
                  {meta.platforms.map((p) => {
                    if (!p.inSheet) {
                      return (
                        <td className="cell" key={p.key}>
                          <span className="cellbox c-na" title={t("unity_none")}>
                            –
                          </span>
                        </td>
                      );
                    }
                    const status = c.statuses[p.key] ?? "no";
                    return (
                      <td className="cell" key={p.key}>
                        <span
                          className={`cellbox ${sheetStatusClass(status)}`}
                          title={`${platformName(p.key)}: ${sheetStatusLabel(status, t)}`}
                        >
                          {sheetStatusGlyph(status)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mxlegend">
          <span>
            <i style={{ background: "var(--okBg)" }} />
            {t("st_uploaded")}
          </span>
          <span>
            <i style={{ background: "var(--warnBg)" }} />
            {t("st_ios")}
          </span>
          <span>
            <i style={{ background: "var(--badBg)" }} />
            {t("st_rejected")}
          </span>
          <span>
            <i style={{ background: "var(--noneBg)" }} />
            {t("st_notpub")}
          </span>
          <span>
            <i style={{ border: "1px dashed var(--line2)" }} />
            {t("st_unknown")} (Unity)
          </span>
        </div>
        <div className="note">{t("unity_none")}</div>
      </Card>

      {/* Where and when — sample side -------------------------------- */}
      <Card pad0 style={{ marginBottom: 14 }}>
        <CardHead title={t("onPlatform")} count={livePlacements.length} />
        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>{t("col_creative")}</th>
                <th>{t("col_country")}</th>
                <th>{t("byPlatform")}</th>
                <th>{t("adAccount")}</th>
                <th>{t("col_campaign")}</th>
                <th>{t("col_adset")}</th>
                <th>{t("col_date")}</th>
                <th>{t("col_sheet")}</th>
                <th>{t("col_platform")}</th>
              </tr>
            </thead>
            <tbody>
              {livePlacements.slice(0, MAX_LIVE_ROWS).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="nm">{p.creativeName}</div>
                    <span className="id">{p.creativeId}</span>
                  </td>
                  <td>
                    <span className="cc">{p.countryCode}</span>
                  </td>
                  <td>{platformShort(p.platformKey)}</td>
                  <td>
                    <span className="id smp">{p.accountExternalId}</span>
                  </td>
                  <td>
                    <span className="id">{p.campaign}</span>
                  </td>
                  <td>
                    <span className="id">{p.adSet}</span>
                  </td>
                  <td className="smp">{fmt.date(p.publishedOn)}</td>
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
          <b>
            {t("col_campaign")} / {lang === "sv" ? "annonsgrupp" : "ad set"}:
          </b>{" "}
          {t("noteCampaign")}
          <br />
          {t("noteDate")}
        </div>
      </Card>

      {/* Gaps — real -------------------------------------------------- */}
      <Card pad0 style={{ marginBottom: 14 }}>
        <CardHead title={t("gaps")} chip={<RealChip />} count={gaps.length} />
        {gaps.length ? (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
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
                      <td style={{ color: "var(--muted)", fontSize: 12.5 }}>
                        {g.outOn.map((k) => platformShort(k)).join(", ")}
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
        <div className="note">{t("gapsSub")}</div>
      </Card>

      {/* Rejected — real --------------------------------------------- */}
      {rejections.length ? (
        <Card pad0 style={{ marginBottom: 14 }}>
          <CardHead title={t("rejectedList")} chip={<RealChip />} />
          <div className="tscroll">
            <table>
              <tbody>
                {rejections.map((r) => {
                  const creative = creativeOf(r.creativeId);
                  return (
                    <tr key={`${r.creativeId}-${r.platformKey}`}>
                      <td>
                        <div className="nm">{creative?.name ?? r.creativeId}</div>
                        <span className="id">{r.creativeId}</span>
                      </td>
                      <td>
                        <CountryCodes codes={creative?.countries ?? []} />
                      </td>
                      <td>
                        <span className="pill p-bad">{platformShort(r.platformKey)}</span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: 12.5 }}>
                        {pick(creative?.noteSv, creative?.noteEn)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {/* Mismatches — sample ----------------------------------------- */}
      <Card pad0 style={{ marginBottom: 14 }}>
        <CardHead title={t("mismatch")} chip={<SampleChip />} count={mismatches.length} />
        {mismatches.length ? (
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>{t("col_creative")}</th>
                  <th>{t("byPlatform")}</th>
                  <th>{t("inSheet")}</th>
                  <th>{t("onPlatform")}</th>
                </tr>
              </thead>
              <tbody>
                {mismatches.slice(0, MAX_MISMATCH_ROWS).map((m) => {
                  const sheetSide =
                    m.kind === "orphan" ? (
                      <span className="pill p-none">{t("st_notpub")}</span>
                    ) : (
                      <span className="pill p-ok">{t("st_uploaded")}</span>
                    );
                  const platformSide =
                    m.kind === "missing" ? (
                      <span className="pill p-bad">{t("notFound")}</span>
                    ) : m.kind === "orphan" ? (
                      <span className="pill p-acc">{t("found")}</span>
                    ) : (
                      <span className="pill p-warn">{t("st_paused")}</span>
                    );
                  return (
                    <tr key={m.placement.id}>
                      <td>
                        <div className="nm">{m.placement.creativeName}</div>
                        <span className="id">{m.placement.creativeId}</span>{" "}
                        <span className="cc">{m.placement.countryCode}</span>
                      </td>
                      <td>{platformShort(m.placement.platformKey)}</td>
                      <td>{sheetSide}</td>
                      <td className="smp">{platformSide}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">{t("noAlerts")}</div>
        )}
        <div className="note">{t("mismatchSub")}</div>
      </Card>

      {/* Duplicates and shared concepts — real ----------------------- */}
      <Card pad0>
        <CardHead title={t("dupes")} chip={<RealChip />} />
        {duplicates.length ? (
          <div className="tscroll">
            <table>
              <tbody>
                {duplicates.map((d) => (
                  <tr key={`${d.a}-${d.b}`}>
                    <td>
                      <span className="id">{d.a}</span> {creativeOf(d.a)?.name}
                    </td>
                    <td>
                      <span className="id">{d.b}</span> {creativeOf(d.b)?.name}
                    </td>
                    <td>
                      <CountryCodes codes={d.countries} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">{t("noDupes")}</div>
        )}

        {data.sharedConcepts.length ? (
          <div style={{ padding: "13px 15px", borderTop: "1px solid var(--line)" }}>
            <h4 style={{ margin: "0 0 9px", fontSize: 13.5, fontWeight: 600 }}>
              {t("sharedConcepts")}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.sharedConcepts.map((group) => (
                <div
                  key={group.creativeIds.join("-")}
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    fontSize: 12.5,
                  }}
                >
                  {group.creativeIds.map((id) => {
                    const c = creativeOf(id);
                    return (
                      <span className="pill p-plain p-none" key={id}>
                        <span className="id" style={{ color: "inherit" }}>
                          {id}
                        </span>
                        &nbsp;
                        {c ? `${appLabel(c.appKey)} ${c.countries.join("/")}` : ""}
                      </span>
                    );
                  })}
                  <span style={{ color: "var(--muted)" }}>{group.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="note">{t("dupesSub")}</div>
      </Card>
    </div>
  );
}
