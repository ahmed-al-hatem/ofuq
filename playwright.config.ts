import { defineConfig, devices } from "@playwright/test"

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
const shouldManageWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== "1"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
      },
    },
  ],
  webServer: shouldManageWebServer
    ? {
        command:
          "node ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000",
        url: `${baseURL}/login`,
        reuseExistingServer: true,
        timeout: 180_000,
      }
    : undefined,
})
