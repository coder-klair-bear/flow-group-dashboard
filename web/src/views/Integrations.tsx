import type { IntegrationState, IntegrationsDto } from "@shared/types";
import { IconPlug } from "@/components/Icons";
import {
  Card,
  CardHead,
  Divider,
  Failure,
  Loading,
  PageHead,
  SampleChip,
} from "@/components/primitives";
import { useLang } from "@/i18n/lang";
import { useFormat } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/state/meta";
import { useStore } from "@/state/store";

function StateChip({ state }: { state: IntegrationState }) {
  const { t } = useLang();
  if (state === "ok") return <span className="pill p-ok">{t("st_connected")}</span>;
  if (state === "err") return <span className="pill p-bad">{t("st_error")}</span>;
  return <span className="pill p-none">{t("st_notconnected")}</span>;
}

export function Integrations() {
  const { t, lang } = useLang();
  const fmt = useFormat();
  const { today, refreshedAt, nonce } = useMeta();
  const { app, integrationPreview, set } = useStore();

  const { data, error, loading, reload } = useApi<IntegrationsDto>("/integrations", { _r: nonce });

  const head = <PageHead title="in_h" subtitle="in_s" />;

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

  // The lineage example is written out with one concrete row so the shape of
  // what gets stored is obvious rather than abstract.
  const lineage: { label: string; value: string }[] = [
    { label: t("l_platform"), value: "Meta Ads" },
    { label: t("l_account"), value: "act_418902266" },
    { label: t("l_where"), value: "Sveapanelen · SE · SVE_SE_MT_INSTALL" },
    { label: t("l_creative"), value: "SVE-002" },
    { label: t("l_os"), value: "iOS" },
    { label: t("l_when"), value: `${fmt.date(today)} ${fmt.time(refreshedAt)}` },
  ];

  return (
    <>
      {head}

      <Card
        style={{
          marginBottom: 14,
          display: "flex",
          gap: 11,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <IconPlug
          style={{
            width: 19,
            height: 19,
            stroke: "var(--accent)",
            fill: "none",
            strokeWidth: 1.8,
            flex: "none",
          }}
        />
        <span style={{ fontSize: 13, color: "var(--ink2)", flex: 1, minWidth: 200 }}>
          {t("noFakeAfter")}
        </span>
        <button
          type="button"
          className={`iconbtn${integrationPreview ? " primary" : ""}`}
          aria-pressed={integrationPreview}
          onClick={() => set("integrationPreview", !integrationPreview)}
        >
          {integrationPreview ? t("previewOn") : t("previewStates")}
        </button>
      </Card>

      <div className="intg">
        {data.sources.map((source) => {
          const state: IntegrationState = integrationPreview ? source.demoState : source.state;
          // The card shows the account for whichever app is selected; "all apps"
          // falls back to Sveapanelen so the field is never blank.
          const account =
            source.kind === "ads"
              ? (source.accounts.find((a) => a.appKey === (app === "rewly" ? "rewly" : "sveapanelen")) ??
                source.accounts[0])
              : null;

          return (
            <div className="icard" key={source.key}>
              <div className="ihead">
                <span className="ilogo" style={{ background: source.color }}>
                  {source.logo}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4>{source.name}</h4>
                  <small>{source.kind === "sheet" ? (source.detail ?? "") : source.apiName}</small>
                </div>
                <StateChip state={state} />
              </div>

              <div className="irows">
                <div className="irow">
                  <span>{t("apiUsed")}</span>
                  <span>{source.apiName}</span>
                </div>

                {account ? (
                  <>
                    <div className="irow">
                      <span>{t("adAccount")}</span>
                      <span>
                        {state === "ok" ? (
                          <>
                            {account.name} <SampleChip />
                          </>
                        ) : (
                          "–"
                        )}
                      </span>
                    </div>
                    <div className="irow">
                      <span>{t("accountId")}</span>
                      <span className="id">{state === "ok" ? account.externalId : "–"}</span>
                    </div>
                  </>
                ) : (
                  <div className="irow">
                    <span>{t("sheetsWord")}</span>
                    <span>{source.detail ?? "–"}</span>
                  </div>
                )}

                <div className="irow">
                  <span>{t("lastSync")}</span>
                  <span className={state === "ok" ? "smp" : undefined}>
                    {state === "ok" ? (
                      `${fmt.date(today)} ${fmt.time(refreshedAt)}`
                    ) : state === "err" ? (
                      <span style={{ color: "var(--bad)" }}>{t("syncFailed")}</span>
                    ) : (
                      "–"
                    )}
                  </span>
                </div>

                <div className="irow">
                  <span>{t("whatINeed")}</span>
                  <span>{lang === "sv" ? source.needsSv : source.needsEn}</span>
                </div>
              </div>

              <div className="ifoot">
                <button type="button" className="iconbtn" disabled>
                  {t("connectBtn")}
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {source.kind === "sheet" ? t("connectSheets") : t("connectSoon")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Divider label={t("lineage")} />

      <Card pad0>
        <CardHead title={t("lineage")} sparkle chip={<SampleChip />} />
        <div className="tscroll">
          <table>
            <tbody>
              {lineage.map((row) => (
                <tr key={row.label}>
                  <td style={{ color: "var(--muted)", width: 210 }}>{row.label}</td>
                  <td>
                    <span className="id">{row.value}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="note">{t("lineageSub")}</div>
      </Card>
    </>
  );
}
