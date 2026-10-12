import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"

it.each([
  {
    name: "renews protected contexts through the actual runner",
    environment: {},
    status: 0,
    expected: "3 passed",
  },
  {
    name: "preserves local headers without requesting an identity",
    environment: { PLAYWRIGHT_VERCEL_TRUSTED_OIDC: "false" },
    status: 0,
    expected: "1 passed",
  },
  {
    name: "rejects missing runner credentials explicitly",
    environment: { ACTIONS_ID_TOKEN_REQUEST_TOKEN: "" },
    status: 1,
    expected: "Protected previews require GitHub OIDC request credentials",
  },
  {
    name: "refuses credential-bearing traces",
    environment: { PREVIEW_FIXTURE_TRACE: "on" },
    status: 1,
    expected: "Protected-preview tests require trace recording to be off",
  },
  {
    name: "rejects untrusted preview targets",
    environment: { PREVIEW_FIXTURE_BASE_URL: "https://untrusted.example.test" },
    status: 1,
    expected: "Protected-preview identity requires an HTTPS Vercel deployment",
  },
  {
    name: "rejects an invalid validity reserve before registering fixtures",
    environment: { PREVIEW_FIXTURE_MINIMUM_VALIDITY_MS: "-1" },
    status: 1,
    expected:
      "Preview identity validity reserve must be finite and nonnegative",
  },
  {
    name: "rejects an unbounded protected test timeout",
    environment: { PREVIEW_FIXTURE_TIMEOUT_MS: "0" },
    status: 1,
    expected: "Protected-preview tests require a finite positive timeout",
  },
  {
    name: "masks renewed identities in GitHub Actions",
    environment: { GITHUB_ACTIONS: "true" },
    status: 0,
    expected: "3 passed",
  },
])(
  "$name",
  ({ environment, status, expected }) => {
    const output = mkdtempSync(path.join(tmpdir(), "shared-preview-fixture-"))
    try {
      const result = spawnSync(
        process.execPath,
        [
          fileURLToPath(import.meta.resolve("@playwright/test/cli")),
          "test",
          "--config",
          "__tests__/fixtures/playwright/playwright.config.ts",
        ],
        {
          encoding: "utf8",
          timeout: 30_000,
          env: {
            ...process.env,
            GITHUB_ACTIONS: "false",
            PLAYWRIGHT_VERCEL_TRUSTED_OIDC: "true",
            ACTIONS_ID_TOKEN_REQUEST_URL:
              "https://synthetic-issuer.example.test",
            ACTIONS_ID_TOKEN_REQUEST_TOKEN: "synthetic-request-token",
            PREVIEW_FIXTURE_OUTPUT: output,
            ...environment,
          },
        },
      )
      expect(result.error).toBeUndefined()
      expect(result.stdout).not.toContain("synthetic-request-token")
      expect(result.status, result.stdout + result.stderr).toBe(status)
      expect(result.stdout + result.stderr).toContain(expected)
      const maskedIdentities = result.stdout.match(/::add-mask::/g) ?? []
      expect(maskedIdentities).toHaveLength(
        environment.GITHUB_ACTIONS === "true" ? 2 : 0,
      )
    } finally {
      rmSync(output, { recursive: true, force: true })
    }
  },
  35_000,
)
