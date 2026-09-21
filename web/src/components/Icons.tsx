/** The prototype's icon set, as components. Stroke and fill come from CSS. */

import type { CSSProperties } from "react";

export const SPARK_PATH =
  "M12 2c.8 6.2 3.8 9.2 10 10-6.2.8-9.2 3.8-10 10-.8-6.2-3.8-9.2-10-10 6.2-.8 9.2-3.8 10-10z";

type IconProps = { className?: string };

const nav = (className?: string) => `ic${className ? ` ${className}` : ""}`;

export function IconOverview({ className }: IconProps) {
  return (
    <svg className={nav(className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="8" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconCreatives({ className }: IconProps) {
  return (
    <svg className={nav(className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 15l4.5-4 3.5 3 4-5 5 6" />
      <circle cx="8.5" cy="8.5" r="1.4" />
    </svg>
  );
}

export function IconPerformance({ className }: IconProps) {
  return (
    <svg className={nav(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 19h18" />
      <path d="M6 16V9" />
      <path d="M11 16V5" />
      <path d="M16 16v-4" />
      <path d="M20.5 16v-8" />
    </svg>
  );
}

export function IconTop({ className }: IconProps) {
  return (
    <svg className={nav(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.2l5.9-.8z" />
    </svg>
  );
}

export function IconUnpub({ className }: IconProps) {
  return (
    <svg className={nav(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V6a2 2 0 0 1 2-2h7l5 5v12a2 2 0 0 1-2 2z" />
      <path d="M14 4v5h5" />
      <path d="M9.5 15.5l5-5M9.5 10.5l5 5" />
    </svg>
  );
}

export function IconPublish({ className }: IconProps) {
  return (
    <svg className={nav(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="18" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg className={nav(className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.4 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.4-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.4 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z" />
    </svg>
  );
}

export function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2.3 6.1" />
      <path d="M20 5v6h-6" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l10-6.5z" />
    </svg>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 16l5-4.5 3.5 3L15 10l6 5.5" />
      <circle cx="8.5" cy="9.5" r="1.3" />
    </svg>
  );
}

export function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPlug({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path d="M9 3v6M15 3v6" />
      <path d="M6 9h12v3a6 6 0 0 1-12 0z" />
      <path d="M12 18v3" />
    </svg>
  );
}

/** A decorative twinkling sparkle, positioned by its class. */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg className={`spark ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true">
      <path d={SPARK_PATH} />
    </svg>
  );
}

/** The same sparkle inline in a heading, not absolutely positioned. */
export function SparkleInline() {
  return (
    <svg className="hs" viewBox="0 0 24 24" aria-hidden="true">
      <path d={SPARK_PATH} />
    </svg>
  );
}

export const NAV_ICONS = {
  overview: IconOverview,
  creatives: IconCreatives,
  performance: IconPerformance,
  top: IconTop,
  unpub: IconUnpub,
  publish: IconPublish,
  settings: IconSettings,
} as const;
