import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const lintCoverageHelper =
  /(?:^|[\\/])scripts[\\/]lint[\\/]checkTypeScriptLintCoverage\.ts$/

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    server: { deps: { external: [lintCoverageHelper] } },
    watchTriggerPatterns: [
      {
        pattern: lintCoverageHelper,
        testsToRun: () =>
          "__tests__/scripts/lint/checkTypeScriptLintCoverage.test.ts",
      },
    ],
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      autoAttachSubprocess: true,
      include: ["scripts/**/*.ts", "scripts/**/*.mjs"],
      reporter: ["text", "lcov"],
      reportOnFailure: true,
    },
  },
})
