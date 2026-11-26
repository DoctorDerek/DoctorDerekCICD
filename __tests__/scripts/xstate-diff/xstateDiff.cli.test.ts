import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const runUrl = "https://github.com/DoctorDerek/repo/actions/runs/1"
const requiredInputs =
  "XSTATE_DIFF_BASE_SHA, XSTATE_DIFF_HEAD_SHA, and XSTATE_DIFF_ACTIONS_RUN_URL are required."
const previousExitCode = process.exitCode
let outputDirectory: string

describe("XState CLI failure reports", () => {
  beforeEach(() => {
    vi.resetModules()
    outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "xstate-cli-"))
    vi.stubEnv("XSTATE_DIFF_OUTPUT_DIRECTORY", outputDirectory)
    vi.stubEnv("XSTATE_DIFF_BASE_SHA", "1111111")
    vi.stubEnv("XSTATE_DIFF_HEAD_SHA", "2222222")
    vi.stubEnv("XSTATE_DIFF_ACTIONS_RUN_URL", runUrl)
    vi.spyOn(process.stderr, "write").mockReturnValue(true)
  })

  afterEach(() => {
    process.exitCode = previousExitCode
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    fs.rmSync(outputDirectory, { recursive: true, force: true })
  })

  async function expectFailureReport(message: string, link: string) {
    await import("@/scripts/xstate-diff/xstateDiff.cli")
    expect(process.exitCode).toBe(1)
    expect(process.stderr.write).toHaveBeenCalledWith(`${message}\n`)
    expect(
      JSON.parse(
        fs.readFileSync(path.join(outputDirectory, "diagnostics.json"), "utf8"),
      ),
    ).toEqual({ error: message })
    const comment = fs.readFileSync(
      path.join(outputDirectory, "comment.md"),
      "utf8",
    )
    expect(comment).toContain("Static XState analysis is unavailable.")
    expect(comment).toContain(message)
    expect(comment).toContain(`[Inspect workflow run](${link})`)
  }

  it.each([
    ["XSTATE_DIFF_BASE_SHA", runUrl],
    ["XSTATE_DIFF_HEAD_SHA", runUrl],
    ["XSTATE_DIFF_ACTIONS_RUN_URL", "https://github.com"],
  ])("reports a missing %s", async (variable, link) => {
    vi.stubEnv(variable, undefined)
    await expectFailureReport(requiredInputs, link)
  })

  it.each(["http://github.com/org/repo", "https://example.org/run"])(
    "uses the GitHub fallback for %s",
    async (url) => {
      vi.stubEnv("XSTATE_DIFF_ACTIONS_RUN_URL", url)
      await expectFailureReport(
        "XState artifact URL must use https://github.com/.",
        "https://github.com",
      )
    },
  )

  it("sanitizes a non-Error diagnostic in the comment and artifact", async () => {
    const gitComparison =
      await import("@/scripts/xstate-diff/readGitMachineComparison")
    vi.spyOn(gitComparison, "readGitMachineComparison").mockImplementationOnce(
      () => {
        throw "`machine` <ready>\r\n  unavailable"
      },
    )
    await expectFailureReport("ˋmachineˋ ‹ready› unavailable", runUrl)
  })
})
