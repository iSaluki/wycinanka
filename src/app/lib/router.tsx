import { useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

/** A tiny History API router: enough for a dozen flat routes. */

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
window.addEventListener('popstate', notify);

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === location.pathname) return;
  if (opts.replace) history.replaceState(null, '', to);
  else history.pushState(null, '', to);
  notify();
  window.scrollTo({ top: 0 });
}

export function usePath(): string {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => location.pathname,
  );
}

/** Match "/lesson/:id" style patterns. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest} />;
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Wycinanka` : 'Wycinanka — learn Polish';
  }, [title]);
}
