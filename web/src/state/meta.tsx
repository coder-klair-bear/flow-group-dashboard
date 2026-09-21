import type { CreativeDto, MetaDto, PlatformDto } from "@shared/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLang } from "@/i18n/lang";
import { getJson, postJson } from "@/lib/api";

interface MetaValue {
  meta: MetaDto;
  /** Server's today, so "this week" means the same thing on both sides. */
  today: string;
  sheetPlatforms: PlatformDto[];
  platformOf: (key: string) => PlatformDto | undefined;
  platformShort: (key: string) => string;
  platformName: (key: string) => string;
  countryName: (code: string) => string;
  appLabel: (key: string) => string;
  appColor: (key: string) => string;
  creativeOf: (id: string) => CreativeDto | undefined;
  /** Bumped by the refresh button; every view passes it so all data refetches. */
  nonce: number;
  refreshedAt: Date;
  refresh: () => Promise<void>;
}

const MetaContext = createContext<MetaValue | null>(null);

export function MetaProvider({ children }: { children: ReactNode }) {
  const { t, lang } = useLang();
  const [meta, setMeta] = useState<MetaDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  const load = useCallback(async () => {
    try {
      const dto = await getJson<MetaDto>("/meta");
      setMeta(dto);
      setError(null);
      setRefreshedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    // Clears the server's catalogue cache first, so a reseed shows up at once.
    try {
      await postJson("/refresh");
    } catch {
      // A failed cache drop is not worth blocking the refetch over.
    }
    await load();
    setNonce((n) => n + 1);
  }, [load]);

  const value = useMemo<MetaValue | null>(() => {
    if (!meta) return null;
    const platforms = new Map(meta.platforms.map((p) => [p.key, p]));
    const countries = new Map(meta.countries.map((c) => [c.code, c]));
    const apps = new Map(meta.apps.map((a) => [a.key, a]));
    const creatives = new Map(meta.creatives.map((c) => [c.id, c]));

    return {
      meta,
      today: meta.today,
      sheetPlatforms: meta.platforms.filter((p) => p.inSheet),
      platformOf: (key) => platforms.get(key),
      platformShort: (key) => platforms.get(key)?.short ?? key,
      platformName: (key) => platforms.get(key)?.name ?? key,
      countryName: (code) => {
        const c = countries.get(code);
        return c ? (lang === "sv" ? c.nameSv : c.nameEn) : code;
      },
      appLabel: (key) => apps.get(key)?.label ?? key,
      appColor: (key) => apps.get(key)?.color ?? "var(--accent)",
      creativeOf: (id) => creatives.get(id),
      nonce,
      refreshedAt,
      refresh,
    };
  }, [meta, lang, nonce, refreshedAt, refresh]);

  if (error && !meta) {
    return (
      <div style={{ padding: 24, maxWidth: 560 }}>
        <div className="failure">
          <b>{t("loadFailed")}</b>
          {t("loadFailedSub")}
          <br />
          <code>{error}</code>
          <br />
          <button type="button" onClick={() => void load()}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!value) {
    return (
      <div style={{ padding: 24, color: "var(--muted)", fontSize: 13.5 }}>{t("loading")}</div>
    );
  }

  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
}

export function useMeta(): MetaValue {
  const ctx = useContext(MetaContext);
  if (!ctx) throw new Error("useMeta must be used inside <MetaProvider>");
  return ctx;
}
