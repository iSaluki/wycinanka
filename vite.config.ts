import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

/**
 * Writes app-files.json: the build files the app needs to open offline (its scripts, styles and the Latin
 * font files Polish uses). The service worker downloads them all as soon as it installs, so the app opens
 * without a connection after a single visit, not only after the second.
 */
function appFiles(): Plugin {
  return {
    name: 'app-files',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        .filter((f) => f.startsWith('assets/') && (/\.(js|css)$/.test(f) || /-latin(-ext)?-.*\.woff2$/.test(f)))
        .sort()
        .map((f) => `/${f}`);
      this.emitFile({ type: 'asset', fileName: 'app-files.json', source: `${JSON.stringify(files)}\n` });
    },
  };
}

export default defineConfig({
  plugins: [react(), appFiles()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: false,
    // Vite's default only reaches Safari 16.4. Older iPads stop at iPadOS 12, 15 or 16, and every iPad browser
    // (Brave, Chrome, Firefox) runs on the system's Safari engine, so aim low enough for all of them.
    target: ['es2019', 'safari12', 'chrome87', 'firefox78', 'edge88'],
    cssTarget: ['safari12', 'chrome87', 'firefox78', 'edge88'],
    // Keep every asset a real file: the CSP does not allow data: fonts.
    assetsInlineLimit: 0,
    // Course content ships with the app (no API reads for lessons), so the main chunk is large by design.
    chunkSizeWarningLimit: 700,
  },
  server: {
    // `npm run dev` serves the UI; run `npx wrangler dev` alongside it for the API.
    proxy: { '/api': 'http://localhost:8787' },
  },
});
