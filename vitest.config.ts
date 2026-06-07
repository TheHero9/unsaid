/**
 * Vitest config - Next.js Server Components are not loaded here; we only test
 * pure logic (lib/*) and small client utilities.
 *
 * - `environment: node` - pure logic needs no DOM. If we add React component
 *   tests later, swap to `jsdom` per-file via `// @vitest-environment jsdom`.
 * - Path alias mirrors tsconfig (`@/* → ./*`) so test files can import as the
 *   app does.
 */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "lib/**/*.test.tsx",
      "schemas/**/*.test.ts",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
    ],
    exclude: ["node_modules", ".next"],
    globals: false,
  },
});
