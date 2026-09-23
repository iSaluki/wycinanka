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

export async function api<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined || method !== 'GET' ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : method !== 'GET' ? '{}' : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  const text = await res.text();
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
