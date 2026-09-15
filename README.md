# DoctorDerekCICD

Shared GitHub Actions workflows for DoctorDerek's TypeScript portfolio: Next.js applications and Next.js + Expo monorepos.

This repository extracts the verified quality, Preview Playwright, XState visualization, and Production Lighthouse implementation from [DoctorDerek.com PR #213](https://github.com/DoctorDerek/DoctorDerek.com/pull/213). Product tests, application configuration, and platform-compatible dependencies remain in each consumer.

## Reviewed source identities

The initial extraction is under review in [issue #1](https://github.com/DoctorDerek/DoctorDerekCICD/issues/1). No shared release is approved for portfolio-wide adoption yet.

- Original pilot: `DoctorDerek/DoctorDerek.com@e679c7c31a7c74513f3b4ee3c21a7ba4029b3bf6`.
- Shared helper source: `f6ccad1da06de4dd8492cbf4b7e4a32e97737b57`.
- Reusable workflow revision: `93e29ba0fcf1d35d8ff0040002816c36d763d966`.

The complete examples in this documentation revision call that exact workflow revision. Copy from a reviewed documentation commit, not a moving branch. Keep the full SHA in each caller. The workflows themselves pin their shared helper checkout; consumers do not need a second helper-version setting.

## Adopt without reconstructing the implementation

Copy the three files from `examples/nextjs/` or `examples/nextjs-expo/` into the consumer's `.github/workflows/`. The solo example uses DoctorDerek.com values; the monorepo example uses Mapachess values. Substitute the verified values below. Do not copy product tests or replace application configuration.

| Input                     | Source of truth                                                                                | Default                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `application-directory`   | Directory in which existing test/typecheck commands run; paths below remain workspace-relative | `.`                                           |
| `node-version-file`       | Existing Node version file, workspace-relative                                                 | `.node-version`                               |
| `typecheck-command`       | Existing complete web/shared/native typecheck command                                          | Required                                      |
| `vitest-command`          | Existing application coverage command, retaining failure-time coverage                         | Root Vitest with coverage and reportOnFailure |
| `coverage-files`          | Actual LCOV files; comma-separated for multiple contributors                                   | `coverage/lcov.info`                          |
| `coverage-artifact-paths` | Actual coverage directories, newline-separated                                                 | `coverage/`                                   |
| `native-command`          | Existing native-renderer Jest coverage command                                                 | Empty; native job skipped                     |
| `native-coverage-files`   | Existing native LCOV path                                                                      | `coverage/native/lcov.info`                   |
| `playwright-command`      | Existing browser test command                                                                  | `pnpm exec playwright test`                   |
| `report-paths`            | Existing HTML report and test-results directories, newline-separated                           | `playwright-report/` and `test-results/`      |
| `trusted-oidc`            | Existing working Vercel Trusted Sources configuration, not assistant browser access            | `false`                                       |
| `production-url`          | Canonical public Production origin and route                                                   | Required                                      |

Only quality accepts the explicit optional `CODECOV_TOKEN` secret. Do not use `secrets: inherit`. Callers retain triggers, concurrency, and maximum permissions. The quality caller needs `actions: read` for artifact download and `pull-requests: write` for comments. Preview needs `id-token: write` when using existing Trusted Sources. Lighthouse needs the existing Pages environment/permissions. Do not change account settings during adoption.

All current consumers install from their repository-root pnpm workspace. `application-directory` changes run-step working directories, not the package manifest used by setup or the workspace-relative artifact paths. Report files are declared from the workspace root. Do not guess a different layout; stop if the existing project cannot fit these inputs.

### Existing repository adaptations

| Repository                     | Solo/example difference                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DoctorDerek.com                | Complete `examples/nextjs` values                                                                                                                             |
| doctorderek-portfolio-crm      | Canonical Production URL; verify current root LCOV                                                                                                            |
| doctorderek-portfolio-calendar | `coverage-files: coverage/vitest/lcov.info`; verify artifact directory and Production URL                                                                     |
| doctorderek-portfolio-pokedex  | `coverage-files: coverage/vitest/lcov.info`; verify artifact directory and Production URL                                                                     |
| doctorderek-portfolio-weather  | `coverage-files: coverage/vitest/lcov.info`; verify artifact directory and Production URL                                                                     |
| mapachess-expo                 | Complete `examples/nextjs-expo` values; preserve its nine contributors                                                                                        |
| what-are-your-values-mapache   | Root Vitest rather than Turbo aggregation; native command `pnpm --filter @game/mobile test:coverage`; use its own Production URL and the full typecheck below |

WAYVM's audited typecheck command is:

```sh
pnpm --filter @game/web exec next typegen && pnpm exec tsc -p apps/web/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p apps/mobile/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p packages/data/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p packages/machines/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p packages/utils/tsconfig.json --noEmit --incremental false
```

Recheck these repository-owned values against the current consumer before adoption. Do not introduce another native workflow, force Expo dependencies into a solo project, or represent partial package coverage as a complete aggregate. Keep application coverage thresholds and tests unchanged.

## Preserved behavior

Quality retains advisory ESLint findings, blocking tool/setup/type/test errors, ordinary failure-time coverage, Codecov reporting, and stable PR comments. The native job is conditional on a real native command. XState analysis and publication remain advisory and operate on the caller's Git history, not this repository's history. Product state management is untouched.

Preview resolves the successful deployment to the current open PR and runs its existing browser tests. No matching PR is a legitimate skip; setup/test errors are failures. Existing public Previews need no credential. For an existing OIDC-protected Preview, retain the consumer's `PLAYWRIGHT_VERCEL_TRUSTED_OIDC_TOKEN` header configuration and disable credential-bearing traces; keep local trace behavior. No sanitizer or account change is introduced here. A token must never be printed or included in diagnostics.

Production Lighthouse waits for the matching main deployment, measures the explicitly supplied canonical URL five times, publishes the median-Performance report and existing JSON format through Pages, and preserves current retention/cancellation behavior. It is not invoked on PRs. No application package install or asset decryption is needed for that measurement job: the shared tool has its own frozen lockfile.

## Verification and limits

The extracted capability code passes 45 existing tests across eight files on Node 24.18.0, pnpm 11.9.0, TypeScript 6.0.3 and Vitest 4.1.10. Formatting, ESLint and strict TypeScript pass. All three reusable workflows and their embedded JavaScript parse; all 18 shell blocks parse with Bash. The runner test executes shared code from a different working directory, preserving consumer-root independence. Lighthouse requires an explicit target instead of defaulting another repository to DoctorDerek.com.

These checks do not prove hosted uploads, OIDC or Pages publication. The DoctorDerek.com pilot PR supplies hosted quality/XState evidence. Preview's `deployment_status` workflow is read from the default branch, so a pre-merge Preview pass can still be the previous implementation. Shared Preview and Production Lighthouse require their normal post-merge events before those specific hosted paths are called verified. No extra paid deployment is required solely to change that claim.

Keep application tests in consumers. Existing pure XState/Lighthouse capability tests belong here. Do not add tests of workflow text, evidence inventories, diagnostic processors or a new conformance framework.

## Maintaining this implementation

Change a capability once here, verify it, and review it. When helper source changes, commit that source first and update the central checkout SHA in the reusable workflows. Then update the complete examples to the new workflow SHA. Consumers take a small explicit revision bump; a shared merge does not silently change every project's deployed automation.

A conforming consumer needs no PR. Differences outside the listed inputs require a specific incompatibility report and approval, not a local fork or an invented mechanism. No installer, published npm package, service or release bot is part of this repository.
