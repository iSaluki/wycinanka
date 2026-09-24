import type { Context, MiddlewareHandler } from 'hono';
import type { ZodType } from 'zod';
import type { AppEnv } from './env';
import { ipKey } from '../shared/ip';

export class HttpError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 413 | 415 | 429 | 500 | 503,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** Parse and validate a JSON body. Unknown keys and wrong types are rejected with a 400. */
export async function readJson<T>(c: Context<AppEnv>, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new HttpError(400, 'The request body must be valid JSON.');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    throw new HttpError(400, 'Some of the details sent were not valid.', { fields });
  }
  return parsed.data;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence for cookie-authenticated requests: state-changing requests must come from our own
 * origin (Origin header, or Sec-Fetch-Site as a fallback) and carry a JSON body.
 */
export const sameOriginOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (SAFE_METHODS.has(c.req.method)) return next();
  const expected = new URL(c.req.url).origin;
  const origin = c.req.header('origin');
  const site = c.req.header('sec-fetch-site');
  const allowed = origin ? origin === expected : site === 'same-origin';
  if (!allowed) throw new HttpError(403, 'Cross-site requests are not allowed.');
  // Every state-changing endpoint takes JSON. Requiring it also blocks "simple" cross-site form posts.
  const type = c.req.header('content-type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'Send the request as JSON.');
  }
  return next();
};

/** Reject bodies larger than `max` bytes, using Content-Length and the actual body size. */
export function bodyLimit(max: number): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const len = Number(c.req.header('content-length') ?? '0');
    if (len > max) throw new HttpError(413, 'That request is too large.');
    if (!SAFE_METHODS.has(c.req.method)) {
      const buf = await c.req.raw.clone().arrayBuffer();
      if (buf.byteLength > max) throw new HttpError(413, 'That request is too large.');
    }
    return next();
  };
}

export const apiHeaders: MiddlewareHandler<AppEnv> = async (c, next) => {
  await next();
  const h = c.res.headers;
  h.set('Cache-Control', 'no-store');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'no-referrer');
  h.set('X-Frame-Options', 'DENY');
  h.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  h.set('Cross-Origin-Resource-Policy', 'same-origin');
  h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
};

/**
 * Who a request comes from, for throttling. IPv6 users are usually given a whole /64 network, so rotating
 * addresses inside it would dodge every per-IP limit: IPv6 is keyed by its /64 prefix instead.
 */
export const clientIp = (c: Context<AppEnv>) => ipKey(c.req.header('cf-connecting-ip') ?? 'unknown');

