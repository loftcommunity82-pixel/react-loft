import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "VITE_USE_JSON_DATA=false npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: false,
      timeout: 60_000,
      cwd: "./",
    },
    {
      command: "npm run dev",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: false,
      timeout: 60_000,
      cwd: "../../loft-api",
    },
  ],
})
