import type { BreakdownDim, Granularity, MetricKey, OsFilter, RankKey } from "@shared/types";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { addDays, fromIso, monthStart, toIso, weekStart } from "@/lib/dates";

export type ViewKey =
  | "overview"
  | "creatives"
  | "performance"
  | "top"
  | "unpub"
  | "publish"
  | "settings";

export type RangePreset = "today" | "yesterday" | "week" | "month" | "custom";

export interface RangeState {
  preset: RangePreset;
  from: string;
  to: string;
}

export interface FiltersState {
  country: string;
  platform: string;
  os: OsFilter;
  campaign: string;
  status: string;
  q: string;
  pubFrom: string;
  pubTo: string;
}

export const EMPTY_FILTERS: FiltersState = {
  country: "all",
  platform: "all",
  os: "all",
  campaign: "all",
  status: "all",
  q: "",
  pubFrom: "",
  pubTo: "",
};

export interface AppState {
  view: ViewKey;
  app: string;
  crView: "cards" | "table";
  range: RangeState;
  filters: FiltersState;
  ovDim: BreakdownDim;
  pfGran: Granularity;
  pfDim: BreakdownDim;
  pfMetric: MetricKey;
  tpRank: RankKey;
  tpDim: "app" | "country" | "platform" | "os";
  integrationPreview: boolean;
}

const INITIAL: AppState = {
  view: "overview",
  app: "all",
  crView: "cards",
  range: { preset: "month", from: "", to: "" },
  filters: EMPTY_FILTERS,
  ovDim: "app",
  pfGran: "day",
  pfDim: "platform",
  pfMetric: "spend",
  tpRank: "installs",
  tpDim: "app",
  integrationPreview: false,
};

interface StoreValue extends AppState {
  set: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  clearFilters: () => void;
  setApp: (app: string) => void;
  setView: (view: ViewKey) => void;
  setRangePreset: (preset: RangePreset, today: string) => void;
  setRangeBound: (which: "from" | "to", value: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL);

  const set = useCallback(<K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const setFilter = useCallback(
    <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
      setState((s) => ({ ...s, filters: { ...s.filters, [key]: value } }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setState((s) => ({ ...s, filters: EMPTY_FILTERS }));
  }, []);

  /**
   * Switching app clears country and campaign: both are app-specific, and a
   * stale selection would silently show an empty dashboard.
   */
  const setApp = useCallback((app: string) => {
    setState((s) => ({
      ...s,
      app,
      filters: { ...s.filters, country: "all", campaign: "all" },
    }));
  }, []);

  const setView = useCallback((view: ViewKey) => {
    setState((s) => ({ ...s, view }));
    window.scrollTo(0, 0);
  }, []);

  const setRangePreset = useCallback((preset: RangePreset, today: string) => {
    setState((s) => {
      if (preset !== "custom") return { ...s, range: { ...s.range, preset } };
      // Seed a custom range with the last fortnight so the pickers are never empty.
      const from = s.range.from || toIso(addDays(fromIso(today), -13));
      const to = s.range.to || today;
      return { ...s, range: { preset, from, to } };
    });
  }, []);

  const setRangeBound = useCallback((which: "from" | "to", value: string) => {
    setState((s) => ({ ...s, range: { ...s.range, preset: "custom", [which]: value } }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      set,
      setFilter,
      clearFilters,
      setApp,
      setView,
      setRangePreset,
      setRangeBound,
    }),
    [state, set, setFilter, clearFilters, setApp, setView, setRangePreset, setRangeBound],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** Turns the chosen preset into the concrete dates the API is asked for. */
export function resolveRange(range: RangeState, today: string): { from: string; to: string } {
  const todayDate = fromIso(today);
  switch (range.preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = toIso(addDays(todayDate, -1));
      return { from: y, to: y };
    }
    case "week":
      return { from: toIso(weekStart(todayDate)), to: today };
    case "custom": {
      if (!range.from || !range.to) return { from: toIso(monthStart(todayDate)), to: today };
      return range.from <= range.to
        ? { from: range.from, to: range.to }
        : { from: range.to, to: range.from };
    }
    case "month":
    default:
      return { from: toIso(monthStart(todayDate)), to: today };
  }
}
