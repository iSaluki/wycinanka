import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    // `npm run dev` serves the UI; run `npx wrangler dev` alongside it for the API.
    proxy: { '/api': 'http://localhost:8787' },
  },
});
