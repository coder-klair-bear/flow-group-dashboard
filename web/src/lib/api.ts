export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function toSearch(params?: QueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/** Stable cache key for a request, used as the effect dependency. */
export function requestKey(path: string, params?: QueryParams): string {
  return `${path}${toSearch(params)}`;
}

export async function getJson<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`/api${path}${toSearch(params)}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const body = (await res.json()) as { error?: string; detail?: string };
      detail = body.detail ?? body.error;
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(`Request failed: ${path}`, res.status, detail);
  }

  return (await res.json()) as T;
}

export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(`Request failed: ${path}`, res.status, res.statusText);
  return (await res.json()) as T;
}
