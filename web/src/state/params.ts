import { useMemo } from "react";
import type { QueryParams } from "@/lib/api";
import { useMeta } from "./meta";
import { resolveRange, useStore } from "./store";

/**
 * The query every view sends: the app switch, the filter bar, the date range,
 * and the refresh nonce. Views add their own dimension or granularity on top.
 */
export function useApiParams(extra?: QueryParams): QueryParams {
  const { app, filters, range } = useStore();
  const { today, nonce } = useMeta();

  const resolved = resolveRange(range, today);
  const extraKey = JSON.stringify(extra ?? {});

  return useMemo<QueryParams>(
    () => ({
      app,
      country: filters.country,
      platform: filters.platform,
      os: filters.os,
      campaign: filters.campaign,
      status: filters.status,
      q: filters.q,
      pubFrom: filters.pubFrom,
      pubTo: filters.pubTo,
      from: resolved.from,
      to: resolved.to,
      _r: nonce,
      ...(extra ?? {}),
    }),
    [
      app,
      filters.country,
      filters.platform,
      filters.os,
      filters.campaign,
      filters.status,
      filters.q,
      filters.pubFrom,
      filters.pubTo,
      resolved.from,
      resolved.to,
      nonce,
      // `extra` is a fresh object on every render, so its serialised form is
      // the dependency rather than its identity.
      extraKey,
    ],
  );
}

/** The resolved date range, for labelling rather than querying. */
export function useResolvedRange(): { from: string; to: string } {
  const { range } = useStore();
  const { today } = useMeta();
  return resolveRange(range, today);
}
