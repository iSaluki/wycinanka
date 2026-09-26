/** Thin JSON client for the Worker API. Same-origin cookies only; errors carry the server's message. */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}

/**
 * Longest wait for an answer. A request on a network that has gone quiet (weak mobile signal, a captive Wi-Fi
 * page) can otherwise hang for minutes, and the app waits for /auth/me before showing anything.
 */
const TIMEOUT_MS = 20_000;

export async function api<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
  let res: Response;
  let text: string;
  const abort = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = abort ? setTimeout(() => abort.abort(), TIMEOUT_MS) : undefined;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined || method !== 'GET' ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : method !== 'GET' ? '{}' : undefined,
      signal: abort?.signal,
    });
    text = await res.text();
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok) {
    const d = (data ?? {}) as { error?: string; field?: string };
    throw new ApiError(res.status, d.error ?? `The server returned an error (${res.status}).`, d.field);
  }
  return data as T;
}
