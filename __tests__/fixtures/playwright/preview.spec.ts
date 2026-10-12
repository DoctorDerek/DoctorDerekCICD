import { expect, test as base } from "@playwright/test"
import createPreviewTest from "doctorderek-cicd/playwright"

const initialTime = Date.UTC(2026, 9, 12)
let currentTime = initialTime
let requests = 0
Date.now = () => currentTime
globalThis.fetch = async () => {
  requests++
  return Response.json({
    value: `e30.${Buffer.from(JSON.stringify({ exp: (currentTime + 300_000) / 1000 })).toString("base64url")}.synthetic-signature`,
  })
}
const test = createPreviewTest(base, {
  minimumValidityMs: Number(
    process.env.PREVIEW_FIXTURE_MINIMUM_VALIDITY_MS ?? 90_000,
  ),
})

if (process.env.PLAYWRIGHT_VERCEL_TRUSTED_OIDC !== "true") {
  test("keeps public and local runs unauthenticated", async ({
    extraHTTPHeaders,
  }) => {
    expect(extraHTTPHeaders).toEqual({ "x-existing-header": "preserved" })
    expect(requests).toBe(0)
  })
} else {
  test("requests the first identity and retains existing headers", async ({
    extraHTTPHeaders,
  }) => {
    expect(extraHTTPHeaders?.["x-existing-header"]).toBe("preserved")
    expect(extraHTTPHeaders?.["x-vercel-trusted-oidc-idp-token"]).toContain(
      "synthetic-signature",
    )
    expect(requests).toBe(1)
    currentTime += 240_000
  })

  test("renews before the next context outlives the original identity", async ({
    extraHTTPHeaders,
  }) => {
    const expectedClaims = Buffer.from(
      JSON.stringify({ exp: (currentTime + 300_000) / 1000 }),
    ).toString("base64url")
    expect(extraHTTPHeaders?.["x-vercel-trusted-oidc-idp-token"]).toBe(
      `e30.${expectedClaims}.synthetic-signature`,
    )
    expect(requests).toBe(2)
    currentTime += 60_000
  })

  test("reuses an identity that covers the whole reserved duration", async ({
    extraHTTPHeaders,
  }) => {
    expect(extraHTTPHeaders?.["x-vercel-trusted-oidc-idp-token"]).toContain(
      "synthetic-signature",
    )
    expect(requests).toBe(2)
  })
}
