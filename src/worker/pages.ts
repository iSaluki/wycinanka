/**
 * Pages (HTML) go through the Worker so each gets its own Content Security Policy nonce. Cloudflare adds scripts
 * of its own to pages on this zone: Bot Fight Mode's JavaScript Detections (an inline script that can't be turned
 * off) and the Web Analytics beacon. Cloudflare reads the nonce from this header and puts it on the scripts it
 * injects, so they run without allowing inline scripts in general. Everything else about the policy matches
 * public/_headers, which still covers every other file.
 */

/** Cloudflare Web Analytics: the beacon script and where it reports to. */
const ANALYTICS_SCRIPT = 'https://static.cloudflareinsights.com';
const ANALYTICS_REPORT = 'https://cloudflareinsights.com';

export function pagePolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${ANALYTICS_SCRIPT}`,
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data:",
    `connect-src 'self' ${ANALYTICS_REPORT}`,
    "media-src 'self' blob:",
    'frame-src https://www.youtube-nocookie.com',
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function newNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Headers public/_headers gives every file. Files served through the Worker don't get _headers applied
 * (Cloudflare applies it only to assets served directly), so the Worker sets them here, kept in step with _headers
 * by test/unit/headers.test.ts.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(self), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};

/** The policy for everything that isn't a page: no scripts but our own, and nothing inline. */
export const FILE_POLICY = pagePolicy('').replace(` 'nonce-' ${ANALYTICS_SCRIPT}`, '').replace(` ${ANALYTICS_REPORT}`, '');

/** Adds the security headers to a file served through the Worker, and a fresh nonce to a page's policy. */
export function withPagePolicy(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  const page = (res.headers.get('content-type') ?? '').startsWith('text/html');
  headers.set('Content-Security-Policy', page ? pagePolicy(newNonce()) : FILE_POLICY);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
