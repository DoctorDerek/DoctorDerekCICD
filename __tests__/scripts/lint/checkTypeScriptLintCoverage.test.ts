import { execFileSync, spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { ESLint } from "eslint"
import { afterEach, describe, expect, it, vi } from "vitest"
import checkTypeScriptLintCoverage, {
  runTypeScriptLintCoverage,
} from "@/scripts/lint/checkTypeScriptLintCoverage"

const temporaryDirectories: string[] = []
const sharedDirectory = process.cwd()
const cliPath = path.join(
  sharedDirectory,
  "scripts/lint/checkTypeScriptLintCoverage.ts",
)
const recommendedConfig = `
import tseslint from "typescript-eslint"
export default [
  ...tseslint.configs.recommended,
  { ignores: ["generated/**"] },
  { languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } } },
]
`

function createApplication(
  configuration: string,
  files: readonly string[] = ["src/example.ts"],
) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "shared-lint-test-"))
  temporaryDirectories.push(directory)
  fs.writeFileSync(path.join(directory, "package.json"), '{"type":"module"}')
  fs.writeFileSync(path.join(directory, "eslint.config.mjs"), configuration)
  fs.symlinkSync(
    path.join(sharedDirectory, "node_modules"),
    path.join(directory, "node_modules"),
    "junction",
  )
  execFileSync("git", ["init", "--quiet"], { cwd: directory })
  for (const filePath of files) {
    const target = path.join(directory, filePath)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, "export const value = 1\n")
  }
  if (files.length > 0)
    execFileSync("git", ["add", "--", ...files], {
      cwd: directory,
      stdio: "pipe",
    })
  return directory
}

afterEach(() => {
  vi.restoreAllMocks()
  for (const directory of temporaryDirectories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true })
})

describe("TypeScript lint configuration coverage", () => {
  it("checks all tracked extensions and surfaces, excluding private untracked files", async () => {
    const files = [
      "apps/web/view.tsx",
      "apps/mobile/view.tsx",
      "packages/domain/rules.ts",
      "e2e/example.spec.ts",
      "scripts/example.mts",
      "scripts/example.cts",
      "vitest.config.ts",
      "generated/types.d.ts",
    ]
    const cwd = createApplication(recommendedConfig, files)
    fs.writeFileSync(path.join(cwd, "private.ts"), "not valid TypeScript")
    const result = await checkTypeScriptLintCoverage(cwd)

    expect(result).toEqual({
      trackedFiles: files.length,
      coveredFiles: files.length - 1,
      ignoredFiles: ["generated/types.d.ts"],
      gaps: [],
    })
    const eslint = new ESLint({ cwd })
    for (const filePath of files.filter(
      (file) => !file.startsWith("generated/"),
    )) {
      const findings = await eslint.lintText("export const value: any = 1", {
        filePath,
      })
      expect(findings[0]?.fatalErrorCount).toBe(0)
      expect(findings[0]?.messages).toEqual([
        expect.objectContaining({
          ruleId: "@typescript-eslint/no-explicit-any",
        }),
      ])
    }
  }, 30_000)

  it("rejects JavaScript-only matching instead of treating absent config as an ignore", async () => {
    const cwd = createApplication(
      'export default [{ files: ["**/*.js"], rules: { "no-debugger": "error" } }]',
      ["src/view.tsx", "scripts/check.mts", "scripts/check.cts"],
    )
    const result = await checkTypeScriptLintCoverage(cwd)
    expect(result.coveredFiles).toBe(0)
    expect(result.ignoredFiles).toEqual([])
    expect(result.gaps).toEqual(
      ["scripts/check.cts", "scripts/check.mts", "src/view.tsx"].map(
        (filePath) => ({
          filePath,
          reason: "missing-configuration",
        }),
      ),
    )
  })

  it("rejects parser-only TypeScript without an active TypeScript ruleset", async () => {
    const cwd = createApplication(`
      import tseslint from "typescript-eslint"
      export default [{
        files: ["**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        rules: { "no-debugger": "warn" },
      }]
    `)
    expect((await checkTypeScriptLintCoverage(cwd)).gaps).toEqual([
      { filePath: "src/example.ts", reason: "missing-typescript-rules" },
    ])
  })

  it("detects a TSX-only coverage regression when ordinary TS is still covered", async () => {
    const cwd = createApplication(
      `
      import tseslint from "typescript-eslint"
      export default tseslint.config({
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommended],
      })
    `,
      ["src/example.ts", "src/view.tsx"],
    )
    const result = await checkTypeScriptLintCoverage(cwd)
    expect(result.coveredFiles).toBe(1)
    expect(result.gaps).toEqual([
      { filePath: "src/view.tsx", reason: "missing-configuration" },
    ])
  })

  it("preserves file-scoped rule exceptions and advisory severities", async () => {
    const cwd = createApplication(
      `
      import tseslint from "typescript-eslint"
      export default [
        ...tseslint.configs.recommended,
        { languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } } },
        { rules: { "@typescript-eslint/no-explicit-any": "warn" } },
        { files: ["test/**"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
      ]
    `,
      ["src/example.ts", "test/example.ts"],
    )
    expect((await checkTypeScriptLintCoverage(cwd)).gaps).toEqual([])
    const eslint = new ESLint({ cwd })
    const source = "export const value: any = 1"
    expect(
      (await eslint.lintText(source, { filePath: "src/example.ts" }))[0]
        ?.messages,
    ).toEqual([
      expect.objectContaining({
        ruleId: "@typescript-eslint/no-explicit-any",
        severity: 1,
      }),
    ])
    expect(
      (await eslint.lintText(source, { filePath: "test/example.ts" }))[0]
        ?.messages,
    ).toEqual([])
  })

  it("recognizes the TypeScript plugin under an application-owned namespace", async () => {
    const cwd = createApplication(`
      import tseslint from "typescript-eslint"
      export default [{
        files: ["**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        plugins: { typed: tseslint.plugin },
        rules: { "typed/no-explicit-any": "warn" },
      }]
    `)
    expect((await checkTypeScriptLintCoverage(cwd)).coveredFiles).toBe(1)
  })

  it("rejects a registered plugin whose rules are all off", async () => {
    const cwd = createApplication(`
      import tseslint from "typescript-eslint"
      export default [{
        files: ["**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        plugins: { "@typescript-eslint": tseslint.plugin },
        rules: { "@typescript-eslint/no-explicit-any": "off" },
      }]
    `)
    expect((await checkTypeScriptLintCoverage(cwd)).gaps).toEqual([
      { filePath: "src/example.ts", reason: "missing-typescript-rules" },
    ])
  })

  it("preserves explicit generated-file ignores even with no TypeScript selector", async () => {
    const cwd = createApplication(
      'export default [{ ignores: ["generated/**"] }, { files: ["**/*.js"] }]',
      ["generated/types.d.ts", "src/example.ts"],
    )
    const result = await checkTypeScriptLintCoverage(cwd)
    expect(result.ignoredFiles).toEqual(["generated/types.d.ts"])
    expect(result.gaps).toEqual([
      { filePath: "src/example.ts", reason: "missing-configuration" },
    ])
  })

  it("does not invent a TypeScript requirement in a JavaScript-only repository", async () => {
    const cwd = createApplication("export default []", ["src/example.js"])
    expect(await checkTypeScriptLintCoverage(cwd)).toEqual({
      trackedFiles: 0,
      coveredFiles: 0,
      ignoredFiles: [],
      gaps: [],
    })
  })

  it("checks only the selected application directory", async () => {
    const cwd = createApplication(recommendedConfig, [
      "src/example.ts",
      "sibling/example.ts",
    ])
    const result = await checkTypeScriptLintCoverage(path.join(cwd, "src"))
    expect(result.trackedFiles).toBe(1)
    expect(result.gaps).toEqual([])
  })
})

describe("coverage command", () => {
  it("returns successful coverage and a concise report", async () => {
    const cwd = createApplication(recommendedConfig)
    const stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true)
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true)
    expect(await runTypeScriptLintCoverage(cwd)).toBe(0)
    expect(stdout).toHaveBeenCalledWith(
      expect.stringContaining("1/1 tracked files covered"),
    )
    expect(stderr).not.toHaveBeenCalled()
  })

  it("returns failure with actionable missing-config paths", async () => {
    const cwd = createApplication('export default [{ files: ["**/*.js"] }]')
    vi.spyOn(process.stdout, "write").mockReturnValue(true)
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true)
    expect(await runTypeScriptLintCoverage(cwd)).toBe(1)
    expect(stderr).toHaveBeenCalledWith(
      "src/example.ts: missing-configuration\n",
    )
  })

  it.each(['new Error("broken config")', '"broken config"'])(
    "fails closed when the consumer configuration throws %s",
    async (thrownValue) => {
      const cwd = createApplication(`throw ${thrownValue}`)
      const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true)
      expect(await runTypeScriptLintCoverage(cwd)).toBe(1)
      expect(stderr).toHaveBeenCalledWith(
        expect.stringContaining("broken config"),
      )
    },
  )

  it.each([
    { config: recommendedConfig, status: 0 },
    { config: 'export default [{ files: ["**/*.js"] }]', status: 1 },
  ])(
    "runs with the consumer's working directory and dependencies: $status",
    ({ config, status }) => {
      const cwd = createApplication(config)
      const result = spawnSync(process.execPath, [cliPath], {
        cwd,
        encoding: "utf8",
      })
      expect(result.status).toBe(status)
      expect(result.stdout).toContain("TypeScript lint configuration:")
      if (status === 0) expect(result.stderr).toBe("")
      else
        expect(result.stderr).toContain("src/example.ts: missing-configuration")
    },
  )
})
