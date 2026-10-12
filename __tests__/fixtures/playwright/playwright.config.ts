import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: ".",
  testMatch: "preview.spec.ts",
  workers: 1,
  retries: 0,
  reporter: "line",
  outputDir: process.env.PREVIEW_FIXTURE_OUTPUT,
  use: {
    baseURL:
      process.env.PREVIEW_FIXTURE_BASE_URL ||
      "https://synthetic-preview.vercel.app",
    trace: process.env.PREVIEW_FIXTURE_TRACE === "on" ? "on" : "off",
    extraHTTPHeaders: { "x-existing-header": "preserved" },
  },
})
