import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Loads the service worker's helpers without a browser: its top level only defines functions and listeners. */
function load(fetch: (url: string) => Promise<Response> = async () => new Response(null, { status: 404 })) {
  const src = readFileSync('public/sw.js', 'utf8');
  const self = { addEventListener: () => undefined, location: { origin: 'https://x' } };
  const stores = new Map<string, Map<string, Response>>();
  const caches = {
    open: async (name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const m = stores.get(name)!;
      return {
        keys: async () => [...m.keys()].map((k) => new Request(k)),
        match: async (k: string) => m.get(k),
        delete: async (r: Request) => m.delete(r.url),
        put: async (k: string, v: Response) => void m.set(k, v),
      };
    },
  };
  const fn = new Function('self', 'caches', 'fetch', `${src}\nreturn { answerRange, trim, refreshAppFiles, LIMITS, VOICE, ASSETS };`);
  return {
    ...(fn(self, caches, fetch) as {
      answerRange: (req: Request, res: Response) => Promise<Response>;
      trim: (n: string) => Promise<void>;
      refreshAppFiles: () => Promise<void>;
      LIMITS: Record<string, number>;
      VOICE: string;
      ASSETS: string;
    }),
    caches,
    stores,
  };
}

describe('service worker', () => {
  const { answerRange, trim, LIMITS, VOICE, caches, stores } = load();
  const whole = () => new Response(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), { headers: { 'content-type': 'audio/mpeg' } });

  it('answers a byte-range request for a recording from the whole file', async () => {
    const r = await answerRange(new Request('https://x/voice/a.mp3', { headers: { range: 'bytes=2-5' } }), whole());
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 2-5/10');
    expect([...new Uint8Array(await r.arrayBuffer())]).toEqual([2, 3, 4, 5]);
    const open = await answerRange(new Request('https://x/voice/a.mp3', { headers: { range: 'bytes=0-' } }), whole());
    expect(open.headers.get('content-range')).toBe('bytes 0-9/10');
    const plain = await answerRange(new Request('https://x/voice/a.mp3'), whole());
    expect(plain.status).toBe(200);
    expect((await answerRange(new Request('https://x/v', { headers: { range: 'bytes=20-' } }), whole())).status).toBe(416);
  });

  it('keeps each cache to its size, dropping the oldest first', async () => {
    const c = await caches.open(VOICE);
    for (let i = 0; i < LIMITS[VOICE] + 3; i++) await c.put(`https://x/voice/${i}.mp3`, whole());
    await trim(VOICE);
    const left = [...stores.get(VOICE)!.keys()];
    expect(left).toHaveLength(LIMITS[VOICE]);
    expect(left[0]).toBe('https://x/voice/3.mp3');
  });

  it('downloads the current build files for offline use and drops older ones', async () => {
    const fetched: string[] = [];
    const sw = load(async (url) => {
      fetched.push(url);
      if (url === '/app-files.json') return Response.json(['/assets/App-new.js', '/assets/index-new.css']);
      return new Response('x', { status: 200 });
    });
    const c = await sw.caches.open(sw.ASSETS);
    await c.put('https://x/assets/App-old.js', new Response('old'));
    await c.put('https://x/assets/index-new.css', new Response('kept'));
    await sw.refreshAppFiles();
    expect([...sw.stores.get(sw.ASSETS)!.keys()].sort()).toEqual(['https://x/assets/App-new.js', 'https://x/assets/index-new.css']);
    // Already cached: not downloaded again.
    expect(fetched).not.toContain('https://x/assets/index-new.css');
  });
});
