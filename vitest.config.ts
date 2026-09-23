import { defineConfig } from 'vitest/config';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

// The Worker config points at the built SPA; tests only need the directory to exist.
if (!existsSync('./dist/client/index.html')) {
  mkdirSync('./dist/client', { recursive: true });
  writeFileSync('./dist/client/index.html', '<!doctype html><title>Wycinanka</title>');
}

export default defineConfig(async () => {
  const migrations = await readD1Migrations('./migrations');
  return {
    test: {
      projects: [
        {
          test: { name: 'unit', include: ['test/unit/**/*.test.ts'], environment: 'node' },
        },
        {
          plugins: [
            cloudflareTest({
              wrangler: { configPath: './wrangler.jsonc' },
              miniflare: {
                bindings: {
                  TEST_MIGRATIONS: migrations,
                  PEPPER: 'test-pepper-not-for-production-0123456789',
                  PBKDF2_ITERATIONS: '20000',
                },
              },
            }),
          ],
          test: {
            name: 'worker',
            include: ['test/worker/**/*.test.ts'],
            setupFiles: ['./test/worker/apply-migrations.ts'],
          },
        },
      ],
    },
  };
});
