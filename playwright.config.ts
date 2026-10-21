import { defineConfig, devices } from "@playwright/test";
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: 1,
  use: { baseURL },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "node node_modules/next/dist/bin/next start",
        url: baseURL,
        reuseExistingServer: false,
        env: { YOUCAM_MODE: "mock", SCAN_CAP_PER_IP: "1000", SCAN_CAP_GLOBAL: "1000" },
      },
});
