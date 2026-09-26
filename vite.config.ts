import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
