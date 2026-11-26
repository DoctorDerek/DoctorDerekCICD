import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  extractLighthouseScores,
  prepareLighthouseReports,
  selectMedianPerformanceRun,
} from "@/scripts/lighthouse/prepareLighthouseReports"

const temporaryDirectories: string[] = []

const createLighthouseResult = (
  performance: number,
  accessibility = 1,
  bestPractices = 1,
  seo = 1,
) => ({
  categories: {
    performance: { score: performance },
    accessibility: { score: accessibility },
    "best-practices": { score: bestPractices },
    seo: { score: seo },
  },
})

const createTemporaryDirectory = () => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "doctor-derek-lighthouse-"),
  )
  temporaryDirectories.push(temporaryDirectory)
  return temporaryDirectory
}

const writeReports = (
  resultsDirectory: string,
  performances: readonly number[],
) => {
  const manifest = performances.map((performance, runIndex) => {
    const jsonPath = path.join(resultsDirectory, `run-${runIndex}.json`)
    const htmlPath = path.join(resultsDirectory, `run-${runIndex}.html`)
    fs.writeFileSync(
      jsonPath,
      JSON.stringify(createLighthouseResult(performance, 0.99, 0.98, 0.97)),
    )
    fs.writeFileSync(htmlPath, `report-${performance}`)
    return { htmlPath, jsonPath }
  })
  fs.writeFileSync(
    path.join(resultsDirectory, "manifest.json"),
    JSON.stringify(manifest),
  )
}

describe("prepareLighthouseReports", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    for (const temporaryDirectory of temporaryDirectories.splice(0))
      fs.rmSync(temporaryDirectory, { force: true, recursive: true })
  })

  it("selects the stable median performance run and publishes its reports", () => {
    const resultsDirectory = createTemporaryDirectory()
    const publishedDirectory = path.join(resultsDirectory, "published")
    writeReports(resultsDirectory, [0.91, 0.72, 0.83])

    const scores = prepareLighthouseReports({
      publishedDirectory,
      resultsDirectory,
    })

    expect(scores).toEqual({
      performance: 83,
      accessibility: 99,
      bestPractices: 98,
      seo: 97,
    })
    expect(
      fs.readFileSync(path.join(publishedDirectory, "index.html"), "utf8"),
    ).toBe("report-0.83")
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(publishedDirectory, "lighthouse-results.json"),
          "utf8",
        ),
      ),
    ).toEqual(scores)
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(resultsDirectory, "lighthouse-summary.json"),
          "utf8",
        ),
      ),
    ).toEqual(scores)
  })

  it.each([
    { options: "defaults", results: undefined, publish: false },
    {
      options: "only a publishing directory",
      results: undefined,
      publish: true,
    },
    { options: "only a results directory", results: "audit", publish: false },
  ])("prepares the CLI report with $options", async ({ results, publish }) => {
    const directory = createTemporaryDirectory()
    const resultsDirectory = path.join(
      directory,
      results ?? "lighthouse-results",
    )
    const publishedDirectory = path.join(directory, "site")
    fs.mkdirSync(resultsDirectory)
    writeReports(resultsDirectory, [0.83])

    vi.resetModules()
    vi.spyOn(process, "cwd").mockReturnValue(directory)
    vi.stubEnv("LIGHTHOUSE_RESULTS_DIRECTORY", results)
    vi.stubEnv("LIGHTHOUSE_PUBLISHED_DIRECTORY", publish ? "site" : undefined)
    await import("@/scripts/lighthouse/prepareLighthouseReports.cli")

    const summary = fs.readFileSync(
      path.join(resultsDirectory, "lighthouse-summary.json"),
      "utf8",
    )
    expect(JSON.parse(summary)).toEqual({
      performance: 83,
      accessibility: 99,
      bestPractices: 98,
      seo: 97,
    })
    expect(fs.existsSync(publishedDirectory)).toBe(publish)
    if (publish) {
      expect(
        fs.readFileSync(path.join(publishedDirectory, "index.html"), "utf8"),
      ).toBe("report-0.83")
      expect(
        fs.readFileSync(
          path.join(publishedDirectory, "lighthouse-results.json"),
          "utf8",
        ),
      ).toBe(summary)
    }
  })

  it("rejects malformed manifests, categories, and empty runs", () => {
    const resultsDirectory = createTemporaryDirectory()
    fs.writeFileSync(path.join(resultsDirectory, "manifest.json"), "{}")
    expect(() => prepareLighthouseReports({ resultsDirectory })).toThrow(
      "manifest must contain an array",
    )

    fs.writeFileSync(
      path.join(resultsDirectory, "manifest.json"),
      JSON.stringify([null]),
    )
    expect(() => prepareLighthouseReports({ resultsDirectory })).toThrow(
      "manifest entry 0 is invalid",
    )

    fs.writeFileSync(
      path.join(resultsDirectory, "manifest.json"),
      JSON.stringify([{}]),
    )
    expect(() => prepareLighthouseReports({ resultsDirectory })).toThrow(
      "missing report paths",
    )

    expect(() => extractLighthouseScores(null)).toThrow("invalid result")
    expect(() => extractLighthouseScores({})).toThrow("missing categories")
    expect(() =>
      extractLighthouseScores({ categories: { performance: {} } }),
    ).toThrow("numeric performance score")
    expect(() => selectMedianPerformanceRun([])).toThrow("completed runs")
  })

  it("uses source order to break equal-performance median ties", () => {
    const selectedRun = selectMedianPerformanceRun([
      {
        lighthouseResult: {},
        manifestEntry: { htmlPath: "second", jsonPath: "second" },
        manifestIndex: 1,
        performanceScore: 0.9,
      },
      {
        lighthouseResult: {},
        manifestEntry: { htmlPath: "first", jsonPath: "first" },
        manifestIndex: 0,
        performanceScore: 0.9,
      },
      {
        lighthouseResult: {},
        manifestEntry: { htmlPath: "third", jsonPath: "third" },
        manifestIndex: 2,
        performanceScore: 0.9,
      },
    ])

    expect(selectedRun.manifestIndex).toBe(1)
  })
})
