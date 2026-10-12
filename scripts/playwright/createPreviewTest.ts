import type { test } from "@playwright/test"
import createPreviewIdentityResolver, {
  type PreviewIdentityResolver,
} from "./previewIdentity"

type PreviewWorkerFixtures = {
  resolvePreviewIdentity: PreviewIdentityResolver | null
}

export default function createPreviewTest(
  base: typeof test,
  { minimumValidityMs = 0 }: Readonly<{ minimumValidityMs?: number }> = {},
): typeof test {
  if (!Number.isFinite(minimumValidityMs) || minimumValidityMs < 0)
    throw new Error(
      "Preview identity validity reserve must be finite and nonnegative",
    )

  return base.extend<Record<never, never>, PreviewWorkerFixtures>({
    resolvePreviewIdentity: [
      async ({}, provide, workerInfo) => {
        if (process.env.PLAYWRIGHT_VERCEL_TRUSTED_OIDC !== "true") {
          await provide(null)
          return
        }
        const trace = workerInfo.project.use.trace
        if (
          trace !== "off" &&
          (typeof trace !== "object" || trace.mode !== "off")
        )
          throw new Error(
            "Protected-preview tests require trace recording to be off",
          )
        const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL
        const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN
        if (!requestUrl || !requestToken)
          throw new Error(
            "Protected previews require GitHub OIDC request credentials",
          )
        await provide(
          createPreviewIdentityResolver({
            requestUrl,
            requestToken,
            maskToken:
              process.env.GITHUB_ACTIONS === "true"
                ? (token) => {
                    process.stdout.write(`::add-mask::${token}\n`)
                  }
                : undefined,
          }),
        )
      },
      { scope: "worker" },
    ],
    extraHTTPHeaders: async (
      { baseURL, extraHTTPHeaders, resolvePreviewIdentity },
      provide,
      testInfo,
    ) => {
      if (resolvePreviewIdentity === null) {
        await provide(extraHTTPHeaders)
        return
      }
      const deployment = baseURL ? new URL(baseURL) : null
      if (
        deployment?.protocol !== "https:" ||
        !deployment.hostname.endsWith(".vercel.app")
      )
        throw new Error(
          "Protected-preview identity requires an HTTPS Vercel deployment",
        )
      if (testInfo.timeout <= 0)
        throw new Error(
          "Protected-preview tests require a finite positive timeout",
        )

      const identity = await resolvePreviewIdentity(
        Math.max(testInfo.timeout, minimumValidityMs),
      )
      if (identity.wasRenewed)
        testInfo.annotations.push({
          type: "preview-identity-renewed",
          description: `Valid until ${new Date(identity.expiresAt).toISOString()}`,
        })
      await provide({
        ...extraHTTPHeaders,
        "x-vercel-trusted-oidc-idp-token": identity.token,
      })
    },
  })
}
