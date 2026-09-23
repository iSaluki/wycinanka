import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: false,
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
