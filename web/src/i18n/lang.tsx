import type { Lang } from "@shared/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STRINGS, type StringKey } from "./strings";

const STORAGE_KEY = "fg_lang";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Look up a phrase by key. */
  t: (key: StringKey) => string;
  /** Pick the right half of a bilingual field that came from the API. */
  pick: (sv: string | null | undefined, en: string | null | undefined) => string;
  locale: string;
}

const LangContext = createContext<LangContextValue | null>(null);

function readStored(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "sv" || stored === "en") return stored;
  } catch {
    // Private windows and blocked site data both throw here; Swedish is the
    // right default either way.
  }
  return "sv";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStored);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A remembered language is a convenience, never a requirement.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === "sv" ? "Flow Group — Annonspanel" : "Flow Group — Ad dashboard";
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => STRINGS[key][lang] ?? STRINGS[key].en,
      pick: (sv, en) => (lang === "sv" ? (sv ?? en ?? "") : (en ?? sv ?? "")),
      locale: lang === "sv" ? "sv-SE" : "en-GB",
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
