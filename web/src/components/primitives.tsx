import type { PlacementStatus, SheetStatus } from "@shared/types";
import type { CSSProperties, ReactNode } from "react";
import { useLang } from "@/i18n/lang";
import type { StringKey } from "@/i18n/strings";
import { IconInfo, Sparkle, SparkleInline, SPARK_PATH } from "./Icons";

/* ------------------------------------------------------------------ chips */

export function SampleChip() {
  const { t } = useLang();
  return <span className="chip-s">{t("sampleTag")}</span>;
}

export function RealChip() {
  const { t } = useLang();
  return <span className="chip-r">{t("realTag")}</span>;
}

/** Wraps a value that comes from sample data, giving it the dotted underline. */
export function Sample({ children }: { children: ReactNode }) {
  return <span className="smp">{children}</span>;
}

/* ------------------------------------------------------------ page chrome */

export function PageHead({ title, subtitle }: { title: StringKey; subtitle: StringKey }) {
  const { t } = useLang();
  return (
    <>
      <div className="h1wrap">
        <h1 className="h1">{t(title)}</h1>
        <Sparkle />
        <Sparkle className="s2 g" />
      </div>
      <p className="sub">{t(subtitle)}</p>
    </>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="divider">
      <span>{label}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={SPARK_PATH} />
      </svg>
    </div>
  );
}

/** The standing explanation of which numbers are real and which are examples. */
export function SampleBanner() {
  const { t } = useLang();
  return (
    <div className="banner">
      <IconInfo />
      <p>
        <b>{t("sampleTitle")}</b>
        <br />
        {t("sampleBody")}
        <br />
        <b>{t("noLiveYet")}</b>
      </p>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <div className="note">{children}</div>;
}

export function Empty({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { t } = useLang();
  return (
    <div className="empty">
      <b>{title ?? t("noResults")}</b>
      {subtitle ?? t("noResultsSub")}
    </div>
  );
}

export function Failure({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLang();
  return (
    <div className="failure">
      <b>{t("loadFailed")}</b>
      {t("loadFailedSub")}
      <br />
      <code>{message}</code>
      {onRetry ? (
        <>
          <br />
          <button type="button" onClick={onRetry}>
            {t("retry")}
          </button>
        </>
      ) : null}
    </div>
  );
}

export function Loading() {
  return (
    <div className="loadwrap" aria-busy="true">
      <div className="skel" style={{ height: 92 }} />
      <div className="skel" style={{ height: 180 }} />
      <div className="skel" style={{ height: 240 }} />
    </div>
  );
}

/* ---------------------------------------------------------------- pills */

const PLACEMENT_PILL: Record<PlacementStatus, { cls: string; key: StringKey }> = {
  live: { cls: "p-ok", key: "st_live" },
  paused: { cls: "p-warn", key: "st_paused" },
  planned: { cls: "p-acc", key: "st_planned" },
  rejected: { cls: "p-bad", key: "st_rejected" },
  notpub: { cls: "p-none", key: "st_notpub" },
  missing: { cls: "p-bad", key: "notFound" },
};

export function StatusPill({ status }: { status: PlacementStatus }) {
  const { t } = useLang();
  const cfg = PLACEMENT_PILL[status] ?? { cls: "p-none", key: "st_unknown" as StringKey };
  return <span className={`pill ${cfg.cls}`}>{t(cfg.key)}</span>;
}

const SHEET_PILL: Record<SheetStatus, { cls: string; key: StringKey }> = {
  yes: { cls: "p-ok", key: "st_uploaded" },
  ios: { cls: "p-warn", key: "st_ios" },
  rej: { cls: "p-bad", key: "st_rejected" },
  no: { cls: "p-none", key: "st_notpub" },
};

export function SheetStatusPill({ status }: { status: SheetStatus }) {
  const { t } = useLang();
  const cfg = SHEET_PILL[status];
  return <span className={`pill ${cfg.cls}`}>{t(cfg.key)}</span>;
}

export function sheetStatusLabel(status: SheetStatus, t: (k: StringKey) => string): string {
  return t(SHEET_PILL[status].key);
}

/** Cell colour used by both the platform matrix and the per-creative badges. */
export function sheetStatusClass(status: SheetStatus | undefined): string {
  if (status === "yes") return "c-ok";
  if (status === "ios") return "c-warn";
  if (status === "rej") return "c-bad";
  return "c-none";
}

export function sheetStatusGlyph(status: SheetStatus | undefined): string {
  if (status === "yes") return "✓";
  if (status === "ios") return "iOS";
  if (status === "rej") return "✕";
  return "–";
}

/* ----------------------------------------------------------- segmented -- */

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  solid,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  solid?: boolean;
}) {
  return (
    <div className={`seg${solid ? " solid" : ""}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- cards -- */

export function Card({
  children,
  pad0,
  style,
}: {
  children: ReactNode;
  pad0?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className={`card${pad0 ? " pad0" : ""}`} style={style}>
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sparkle,
  chip,
  right,
  count,
}: {
  title: string;
  sparkle?: boolean;
  chip?: ReactNode;
  right?: ReactNode;
  count?: number;
}) {
  return (
    <div className="cardhead">
      <h3>
        {sparkle ? <SparkleInline /> : null}
        {title}
      </h3>
      {chip}
      <div className="sp" />
      {count != null ? (
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{count}</span>
      ) : null}
      {right}
    </div>
  );
}

export function CountryCodes({ codes }: { codes: string[] }) {
  return (
    <>
      {codes.map((c) => (
        <span className="cc" key={c}>
          {c}
        </span>
      ))}
    </>
  );
}
