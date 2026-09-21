import type { CreativeDto } from "@shared/types";
import type { CSSProperties } from "react";
import { useLang } from "@/i18n/lang";
import { hueFor } from "@/lib/format";
import { useMeta } from "@/state/meta";
import { IconFolder, IconImage, IconPlay } from "./Icons";
import { CountryCodes, sheetStatusClass, sheetStatusLabel } from "./primitives";

/**
 * Drive does not give us thumbnails we can embed, and several sheet rows point
 * at a folder rather than a file. Rather than show a broken image, every
 * creative gets a stable coloured tile derived from its id — the same creative
 * looks the same everywhere in the dashboard.
 */
export function TinyThumb({ creative, size }: { creative: CreativeDto | undefined; size?: number }) {
  if (!creative) return null;

  const hue = hueFor(creative.id);
  const background = `linear-gradient(135deg,hsl(${hue},62%,64%),hsl(${(hue + 38) % 360},58%,48%))`;
  const style: CSSProperties = size
    ? { width: size, height: size, background }
    : { background };

  const tile = (
    <span className="tn" style={style} title={creative.name}>
      {creative.type === "video" ? <IconPlay className="t" /> : <IconImage className="t" />}
      <span className="tid">{creative.id.split("-")[1]}</span>
    </span>
  );

  if (!creative.link) return tile;
  return (
    <a
      href={creative.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", flex: "none" }}
    >
      {tile}
    </a>
  );
}

/** The larger placeholder at the top of a creative card. */
export function Thumb({ creative }: { creative: CreativeDto }) {
  const { t } = useLang();

  const inner =
    creative.linkType === "file" ? (
      <div className="ph">
        <IconPlay />
        <span>{t("openDrive")}</span>
      </div>
    ) : creative.linkType === "folder" ? (
      <div className="ph">
        <IconFolder />
        <span>{t("folderOnly")}</span>
      </div>
    ) : (
      <div className="ph">
        <IconImage />
        <span>{t("noLink")}</span>
      </div>
    );

  const body = (
    <div className="thumb">
      <span className={`tag pill p-plain ${creative.type === "video" ? "p-acc" : "p-none"}`}>
        {creative.type === "video" ? t("video") : t("image")}
      </span>
      {inner}
    </div>
  );

  if (!creative.link) return body;
  return (
    <a
      href={creative.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      {body}
    </a>
  );
}

const PLATFORM_CODE: Record<string, string> = {
  tiktok: "TT",
  meta: "MT",
  google: "GG",
  snap: "SN",
  unity: "UN",
};

export function platformCode(key: string): string {
  return PLATFORM_CODE[key] ?? key.slice(0, 2).toUpperCase();
}

/** One badge per platform, coloured by what the sheet says. */
export function PlatformBadges({
  creative,
  forceNone,
}: {
  creative: CreativeDto;
  forceNone?: boolean;
}) {
  const { t } = useLang();
  const { sheetPlatforms, platformName } = useMeta();

  return (
    <div className="plats">
      {sheetPlatforms.map((p) => {
        const status = creative.statuses[p.key] ?? "no";
        const cls = forceNone ? "c-none" : sheetStatusClass(status);
        return (
          <span
            key={p.key}
            className={`pf ${cls}`}
            title={`${platformName(p.key)}: ${sheetStatusLabel(status, t)}`}
          >
            {platformCode(p.key)}
          </span>
        );
      })}
    </div>
  );
}

export function CreativeCard({ creative }: { creative: CreativeDto }) {
  const { pick } = useLang();
  const { appLabel } = useMeta();
  const note = pick(creative.noteSv, creative.noteEn);

  return (
    <article className="cc-card">
      <Thumb creative={creative} />
      <div className="cc-body">
        <div className="meta">
          <span className="id">{creative.id}</span>
          <CountryCodes codes={creative.countries} />
          {creative.bundle ? (
            <span className="pill p-plain p-acc">{creative.bundle} ×</span>
          ) : null}
        </div>
        <h4>{creative.name}</h4>
        <div className="meta">{appLabel(creative.appKey)}</div>
        {note ? (
          <div className="meta" style={{ color: "var(--warn)" }}>
            {note}
          </div>
        ) : null}
        <PlatformBadges creative={creative} />
      </div>
    </article>
  );
}

/** Used on the unpublished view, where nothing is out on any platform. */
export function UnpublishedCard({ creative }: { creative: CreativeDto }) {
  const { t } = useLang();
  const { appLabel } = useMeta();

  const caption =
    creative.linkType === "folder"
      ? t("folderOnly")
      : creative.linkType === "none"
        ? t("noLink")
        : t("openDrive");

  return (
    <article className="cc-card">
      <div className="thumb" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
        <span className="tag pill p-plain p-bad">{t("st_notpub")}</span>
        <div className="ph">
          <TinyThumb creative={creative} size={54} />
          <span>{caption}</span>
        </div>
      </div>
      <div className="cc-body">
        <div className="meta">
          <span className="id">{creative.id}</span>
          <CountryCodes codes={creative.countries} />
        </div>
        <h4>{creative.name}</h4>
        <div className="meta">
          {appLabel(creative.appKey)} · {creative.type === "video" ? t("video") : t("image")}
        </div>
        <PlatformBadges creative={creative} forceNone />
      </div>
    </article>
  );
}
