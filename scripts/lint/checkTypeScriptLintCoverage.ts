import { execFileSync } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"
import type { Linter } from "eslint"

const TYPESCRIPT_EXTENSIONS = ["ts", "tsx", "mts", "cts"] as const
const TYPESCRIPT_FILE_PATTERN = `**/*.{${TYPESCRIPT_EXTENSIONS.join(",")}}`

type CoverageGap = Readonly<{
  filePath: string
  reason: "missing-configuration" | "missing-typescript-rules"
}>

export type TypeScriptLintCoverage = Readonly<{
  trackedFiles: number
  coveredFiles: number
  ignoredFiles: readonly string[]
  gaps: readonly CoverageGap[]
}>

function hasTypeScriptRules(config: Linter.Config): boolean {
  const namespaces = Object.entries(config.plugins ?? {})
    .filter(
      ([namespace, plugin]) =>
        namespace === "@typescript-eslint" ||
        plugin.meta?.name === "@typescript-eslint/eslint-plugin",
    )
    .map(([namespace]) => `${namespace}/`)

  return Object.entries(config.rules ?? {}).some(([rule, entry]) => {
    const severity = Array.isArray(entry) ? entry[0] : entry
    return (
      namespaces.some((namespace) => rule.startsWith(namespace)) &&
      (severity === "warn" ||
        severity === "error" ||
        severity === 1 ||
        severity === 2)
    )
  })
}

export default async function checkTypeScriptLintCoverage(
  applicationDirectory: string,
): Promise<TypeScriptLintCoverage> {
  const cwd = path.resolve(applicationDirectory)
  const trackedPaths = execFileSync(
    "git",
    [
      "ls-files",
      "--cached",
      "-z",
      "--",
      ...TYPESCRIPT_EXTENSIONS.map((extension) => `*.${extension}`),
    ],
    { cwd, encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean)
  const ignoredFiles: string[] = []
  const gaps: CoverageGap[] = []
  let coveredFiles = 0

  if (trackedPaths.length === 0)
    return { trackedFiles: 0, coveredFiles, ignoredFiles, gaps }

  const requireFromApplication = createRequire(path.join(cwd, "package.json"))
  const { ESLint }: typeof import("eslint") = requireFromApplication("eslint")
  const eslint = new ESLint({ cwd })
  const ignoreInspector = new ESLint({
    cwd,
    overrideConfig: [{ files: [TYPESCRIPT_FILE_PATTERN] }],
  })

  for (const filePath of trackedPaths) {
    const config: Linter.Config | undefined =
      await eslint.calculateConfigForFile(filePath)

    if (!config) {
      if (await ignoreInspector.isPathIgnored(filePath))
        ignoredFiles.push(filePath)
      else gaps.push({ filePath, reason: "missing-configuration" })
    } else if (!hasTypeScriptRules(config)) {
      gaps.push({ filePath, reason: "missing-typescript-rules" })
    } else coveredFiles++
  }

  return { trackedFiles: trackedPaths.length, coveredFiles, ignoredFiles, gaps }
}

export async function runTypeScriptLintCoverage(
  applicationDirectory: string,
): Promise<number> {
  try {
    const result = await checkTypeScriptLintCoverage(applicationDirectory)
    process.stdout.write(
      `TypeScript lint configuration: ${result.coveredFiles}/${result.trackedFiles} tracked files covered; ${result.ignoredFiles.length} explicitly ignored; ${result.gaps.length} gaps.\n`,
    )
    for (const { filePath, reason } of result.gaps)
      process.stderr.write(`${filePath}: ${reason}\n`)
    return result.gaps.length > 0 ? 1 : 0
  } catch (error: unknown) {
    process.stderr.write(
      `TypeScript lint configuration check failed: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    return 1
  }
}

if (import.meta.main)
  process.exitCode = await runTypeScriptLintCoverage(process.argv[2] ?? ".")
