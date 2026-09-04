import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // These suites share one live Postgres instance (no per-test
    // transaction/rollback isolation). Running spec files in parallel lets
    // one file's writes leak into another's read window (e.g. the summary
    // test's grand-total delta) — force sequential execution.
    fileParallelism: false,
  },
});
