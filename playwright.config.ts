import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E suite. Targets the local dev server at :3000 by default;
 * set E2E_PORT to run against another port (e.g. when :3000 is taken by a
 * different project's dev server).
 *
 * Run: `npm run test:e2e`           - headless
 *      `npm run test:e2e -- --ui`   - interactive
 */
const PORT = process.env.E2E_PORT ?? "3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Local: 1 retry to absorb dev-mode-under-load flakes. CI keeps 2.
  retries: process.env.CI ? 2 : 1,
  timeout: 60_000,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Chromium-based mobile device so we don't need to install WebKit.
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
