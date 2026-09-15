import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["scripts/**/*.ts", "scripts/**/*.mjs"],
      reporter: ["text", "lcov"],
      reportOnFailure: true,
    },
  },
})
