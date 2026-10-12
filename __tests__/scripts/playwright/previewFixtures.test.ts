import { test as base, type FullProject, type TestInfo } from "@playwright/test"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import type { PreviewIdentityResolver } from "../../../scripts/playwright/previewIdentity"

type Headers = Record<string, string> | undefined
type PreviewFixtures = {
  resolvePreviewIdentity: [
    (
      context: Record<never, never>,
      provide: (identity: PreviewIdentityResolver | null) => Promise<void>,
      worker: { project: { use: Pick<FullProject["use"], "trace"> } },
    ) => Promise<void>,
    { scope: "worker" },
  ]
  extraHTTPHeaders: (
    context: {
      baseURL?: string
      extraHTTPHeaders: Headers
      resolvePreviewIdentity: PreviewIdentityResolver | null
    },
    provide: (headers: Headers) => Promise<void>,
    testInfo: Pick<TestInfo, "timeout" | "annotations">,
  ) => Promise<void>
}

const { extend, loadRuntimeModule } = vi.hoisted(() => ({
  extend: vi.fn<(fixtures: PreviewFixtures) => typeof base>(),
  loadRuntimeModule: vi.fn<() => { default: typeof createPreviewTest }>(),
}))

vi.mock("@playwright/test", () => ({ test: { extend } }))
vi.mock("jiti", () => ({ createJiti: () => loadRuntimeModule }))

const { default: createPreviewTest } = await vi.importActual<
  typeof import("../../../scripts/playwright/createPreviewTest")
>("../../../scripts/playwright/createPreviewTest.ts")

const initialTime = Date.UTC(2026, 9, 12)
const request = vi.fn<typeof fetch>()

beforeEach(() => {
  extend.mockClear().mockReturnValue(base)
  loadRuntimeModule.mockReturnValue({ default: createPreviewTest })
  vi.stubEnv("PLAYWRIGHT_VERCEL_TRUSTED_OIDC", "true")
  vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_URL", "https://issuer.example.test")
  vi.stubEnv("ACTIONS_ID_TOKEN_REQUEST_TOKEN", "synthetic-request-token")
  vi.stubEnv("GITHUB_ACTIONS", "false")
  vi.spyOn(Date, "now").mockReturnValue(initialTime)
  request.mockReset().mockImplementation(async () =>
    Response.json({
      value: `e30.${Buffer.from(JSON.stringify({ exp: (Date.now() + 300_000) / 1000 })).toString("base64url")}.synthetic-signature`,
    }),
  )
  vi.stubGlobal("fetch", request)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function registerFixtures(minimumValidityMs?: number): PreviewFixtures {
  expect(createPreviewTest(base, { minimumValidityMs })).toBe(base)
  const fixtures = extend.mock.calls[0]?.[0]
  if (!fixtures) throw new Error("Preview fixtures were not registered")
  expect(fixtures.resolvePreviewIdentity[1]).toEqual({ scope: "worker" })
  return fixtures
}

it("exports the same fixture factory through the runtime entry", async () => {
  const entry = await vi.importActual<{
    default: typeof createPreviewTest
  }>("../../../scripts/playwright/createPreviewTest.mjs")
  expect(entry.default).toBe(createPreviewTest)
})

it("preserves local headers without requesting an identity", async () => {
  vi.stubEnv("PLAYWRIGHT_VERCEL_TRUSTED_OIDC", "false")
  const fixtures = registerFixtures()
  const provide = vi.fn<(headers: Headers) => Promise<void>>()
  await fixtures.resolvePreviewIdentity[0](
    {},
    async (resolvePreviewIdentity) => {
      expect(resolvePreviewIdentity).toBeNull()
      await fixtures.extraHTTPHeaders(
        {
          baseURL: "http://localhost:3106",
          extraHTTPHeaders: { "x-existing": "preserved" },
          resolvePreviewIdentity,
        },
        provide,
        { timeout: 30_000, annotations: [] },
      )
    },
    { project: { use: { trace: "on" } } },
  )
  expect(provide).toHaveBeenCalledWith({ "x-existing": "preserved" })
  expect(request).not.toHaveBeenCalled()
})

it.each([
  { trace: "off", githubActions: true },
  { trace: { mode: "off" }, githubActions: true },
  { trace: "off", githubActions: false },
] as const)(
  "renews and annotates identities with trace $trace and GitHub Actions $githubActions",
  async ({ trace, githubActions }) => {
    vi.stubEnv("GITHUB_ACTIONS", String(githubActions))
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true)
    const fixtures = registerFixtures(90_000)
    const annotations: TestInfo["annotations"] = []
    const provide = vi.fn<(headers: Headers) => Promise<void>>()
    await fixtures.resolvePreviewIdentity[0](
      {},
      async (resolvePreviewIdentity) => {
        expect(resolvePreviewIdentity).toBeTypeOf("function")
        for (const elapsedMs of [0, 60_000, 240_000]) {
          vi.mocked(Date.now).mockReturnValue(initialTime + elapsedMs)
          await fixtures.extraHTTPHeaders(
            {
              baseURL: "https://preview.vercel.app",
              extraHTTPHeaders: { "x-existing": "preserved" },
              resolvePreviewIdentity,
            },
            provide,
            { timeout: 30_000, annotations },
          )
        }
      },
      { project: { use: { trace } } },
    )
    const headers = provide.mock.calls.map(([value]) => value)
    expect(headers[0]).toEqual(headers[1])
    expect(headers[2]).not.toEqual(headers[1])
    for (const value of headers) {
      expect(value).toEqual({
        "x-existing": "preserved",
        "x-vercel-trusted-oidc-idp-token": expect.stringContaining(
          "synthetic-signature",
        ),
      })
    }
    expect(request).toHaveBeenCalledTimes(2)
    expect(write.mock.calls).toEqual(
      githubActions
        ? [
            [
              `::add-mask::${headers[0]?.["x-vercel-trusted-oidc-idp-token"]}\n`,
            ],
            [
              `::add-mask::${headers[2]?.["x-vercel-trusted-oidc-idp-token"]}\n`,
            ],
          ]
        : [],
    )
    expect(annotations).toEqual([
      {
        type: "preview-identity-renewed",
        description: `Valid until ${new Date(initialTime + 300_000).toISOString()}`,
      },
      {
        type: "preview-identity-renewed",
        description: `Valid until ${new Date(initialTime + 540_000).toISOString()}`,
      },
    ])
  },
)

it("honors a test timeout longer than the configured reserve", async () => {
  const fixtures = registerFixtures(30_000)
  const resolvePreviewIdentity = vi.fn<PreviewIdentityResolver>(async () => ({
    token: "synthetic-token",
    expiresAt: initialTime + 300_000,
    wasRenewed: false,
  }))
  await fixtures.extraHTTPHeaders(
    {
      baseURL: "https://preview.vercel.app",
      extraHTTPHeaders: undefined,
      resolvePreviewIdentity,
    },
    async () => {},
    { timeout: 90_000, annotations: [] },
  )
  expect(resolvePreviewIdentity).toHaveBeenCalledWith(90_000)
})

it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
  "rejects invalid reserve %s before extending the runner",
  (minimumValidityMs) => {
    expect(() => createPreviewTest(base, { minimumValidityMs })).toThrow(
      "Preview identity validity reserve must be finite and nonnegative",
    )
    expect(extend).not.toHaveBeenCalled()
  },
)

it.each([undefined, "on", { mode: "retain-on-failure" }] as const)(
  "rejects credential-bearing trace configuration %j",
  async (trace) => {
    const fixtures = registerFixtures()
    await expect(
      fixtures.resolvePreviewIdentity[0]({}, async () => {}, {
        project: { use: { trace } },
      }),
    ).rejects.toThrow(
      "Protected-preview tests require trace recording to be off",
    )
    expect(request).not.toHaveBeenCalled()
  },
)

it.each(["ACTIONS_ID_TOKEN_REQUEST_URL", "ACTIONS_ID_TOKEN_REQUEST_TOKEN"])(
  "rejects missing %s without attempting authentication",
  async (name) => {
    vi.stubEnv(name, "")
    const fixtures = registerFixtures()
    await expect(
      fixtures.resolvePreviewIdentity[0]({}, async () => {}, {
        project: { use: { trace: "off" } },
      }),
    ).rejects.toThrow(
      "Protected previews require GitHub OIDC request credentials",
    )
    expect(request).not.toHaveBeenCalled()
  },
)

it.each([
  undefined,
  "http://preview.vercel.app",
  "https://vercel.app.untrusted.example",
])("rejects untrusted target %s before resolving identity", async (baseURL) => {
  const fixtures = registerFixtures()
  const resolvePreviewIdentity = vi.fn<PreviewIdentityResolver>()
  await expect(
    fixtures.extraHTTPHeaders(
      { baseURL, extraHTTPHeaders: undefined, resolvePreviewIdentity },
      async () => {},
      { timeout: 30_000, annotations: [] },
    ),
  ).rejects.toThrow(
    "Protected-preview identity requires an HTTPS Vercel deployment",
  )
  expect(resolvePreviewIdentity).not.toHaveBeenCalled()
})

it("rejects unbounded test duration before resolving identity", async () => {
  const fixtures = registerFixtures()
  const resolvePreviewIdentity = vi.fn<PreviewIdentityResolver>()
  await expect(
    fixtures.extraHTTPHeaders(
      {
        baseURL: "https://preview.vercel.app",
        extraHTTPHeaders: undefined,
        resolvePreviewIdentity,
      },
      async () => {},
      { timeout: 0, annotations: [] },
    ),
  ).rejects.toThrow("Protected-preview tests require a finite positive timeout")
  expect(resolvePreviewIdentity).not.toHaveBeenCalled()
})
