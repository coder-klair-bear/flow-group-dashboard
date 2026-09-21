import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getJson, requestKey, type QueryParams } from "./api";

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  /** True only on the very first load; a refetch keeps the previous data visible. */
  loading: boolean;
  /** True while a refetch is in flight over data that is already on screen. */
  refreshing: boolean;
  reload: () => void;
}

/**
 * A small fetch hook rather than a data-fetching library: there are seven
 * endpoints, each view uses one, and keeping the previous response on screen
 * while the next one loads is the only clever behaviour needed.
 */
export function useApi<T>(path: string, params?: QueryParams): ApiResult<T> {
  const key = requestKey(path, params);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const [nonce, setNonce] = useState(0);
  const hasData = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setPending(true);

    getJson<T>(path, params, controller.signal)
      .then((result) => {
        if (cancelled) return;
        hasData.current = true;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        const message =
          err instanceof ApiError
            ? (err.detail ?? err.message)
            : err instanceof Error
              ? err.message
              : "Unknown error";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // `key` encodes path and params; params itself is a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data,
    error,
    loading: pending && !hasData.current,
    refreshing: pending && hasData.current,
    reload,
  };
}
