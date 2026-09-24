# Using DoctorDerekCICD

This is the configuration and maintenance reference for the shared workflows. See the [README](README.md) for the project overview.

## Reviewed source

The shared implementation was merged in [DoctorDerekCICD PR #2](https://github.com/DoctorDerek/DoctorDerekCICD/pull/2), followed by the [DoctorDerek.com pilot integration](https://github.com/DoctorDerek/DoctorDerek.com/pull/215).

| Source                                                                                                      | Commit                                     |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Original implementation, [DoctorDerek.com PR #213](https://github.com/DoctorDerek/DoctorDerek.com/pull/213) | `e679c7c31a7c74513f3b4ee3c21a7ba4029b3bf6` |
| Shared helper source                                                                                        | `f6ccad1da06de4dd8492cbf4b7e4a32e97737b57` |
| Reusable workflows                                                                                          | `93e29ba0fcf1d35d8ff0040002816c36d763d966` |
| Reviewed caller examples                                                                                    | `dbf880ada33888464713046132f2616879ea7925` |

The examples at that revision pin the workflow commit above. The workflows pin their shared helper checkout; consumers do not need a separate helper-version input. Retrieve examples from the reviewed commit rather than a moving branch, and retain the full workflow SHA in each caller.

## Adopt the existing callers

Copy the three files from the reviewed [Next.js examples](https://github.com/DoctorDerek/DoctorDerekCICD/tree/dbf880ada33888464713046132f2616879ea7925/examples/nextjs) or [Next.js + Expo examples](https://github.com/DoctorDerek/DoctorDerekCICD/tree/dbf880ada33888464713046132f2616879ea7925/examples/nextjs-expo) into the application repository’s `.github/workflows/`:

- `eslint-vitest-xstate.yml`: application linting, types, tests, coverage, and XState PR visualization.
- `playwright.yml`: browser tests after a successful matching Preview deployment.
- `lighthouse.yml`: Production measurements after a push to `main`, with manual dispatch available.

The solo example contains DoctorDerek.com values; the monorepo example contains Mapachess values. Substitute the application’s verified commands, paths, and production URL. Keep its product tests, configuration, compatible dependencies, and coverage thresholds unchanged.

### Inputs

| Input                     | Source of truth                                                        | Default                                                      |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `application-directory`   | Working directory for application test/typecheck commands              | `.`                                                          |
| `node-version-file`       | Existing Node version file, workspace-relative                         | `.node-version`                                              |
| `typecheck-command`       | Existing complete web/shared/native typecheck command                  | Required                                                     |
| `vitest-command`          | Existing application coverage command, retaining failure-time coverage | `pnpm exec vitest run --coverage --coverage.reportOnFailure` |
| `coverage-files`          | Actual LCOV files, comma-separated for multiple contributors           | `coverage/lcov.info`                                         |
| `coverage-artifact-paths` | Actual coverage directories, newline-separated                         | `coverage/`                                                  |
| `native-command`          | Existing native-renderer Jest coverage command                         | Empty; native job skipped                                    |
| `native-coverage-files`   | Existing native LCOV path                                              | `coverage/native/lcov.info`                                  |
| `playwright-command`      | Existing browser test command                                          | `pnpm exec playwright test`                                  |
| `report-paths`            | HTML report and test-results directories, newline-separated            | `playwright-report/` and `test-results/`                     |
| `trusted-oidc`            | Existing working Vercel Trusted Sources configuration                  | `false`                                                      |
| `production-url`          | Canonical public Production URL                                        | Required                                                     |

The quality workflow accepts the explicit optional `CODECOV_TOKEN` secret. Do not use `secrets: inherit`. Preserve the caller examples’ triggers, concurrency, and permissions: quality includes artifact access and PR comments; Preview includes OIDC permissions; Lighthouse includes deployment access and Pages publication. Do not change account settings during adoption.

The supported callers install from a repository-root pnpm workspace. `application-directory` changes run-step working directories, not the root package manifest used by setup. Node-version and artifact paths remain workspace-relative. Stop if an application cannot fit these inputs rather than inventing a different setup.

### Initial repository adaptation notes

These notes record the extraction’s inspected layouts, not current adoption status. Recheck repository-owned values before using them.

| Repository                     | Adaptation                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DoctorDerek.com                | Complete `examples/nextjs` values                                                                                                                       |
| doctorderek-portfolio-crm      | Its Production URL; verify current root LCOV                                                                                                            |
| doctorderek-portfolio-calendar | `coverage-files: coverage/vitest/lcov.info`; verify artifact directory and Production URL                                                               |
| doctorderek-portfolio-pokedex  | `coverage-files: coverage/vitest/lcov.info`; verify artifact directory and Production URL                                                               |
| doctorderek-portfolio-weather  | `coverage-files: coverage/vitest/lcov.info`; verify artifact directory and Production URL                                                               |
| mapachess-expo                 | `examples/nextjs-expo`; nine Vitest LCOV contributors plus a separate native command                                                                    |
| what-are-your-values-mapache   | Root Vitest rather than Turbo aggregation; native command `pnpm --filter @game/mobile test:coverage`; its Production URL and complete typecheck command |

WAYVM’s typecheck command recorded during extraction:

```sh
pnpm --filter @game/web exec next typegen && pnpm exec tsc -p apps/web/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p apps/mobile/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p packages/data/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p packages/machines/tsconfig.json --noEmit --incremental false && pnpm exec tsc -p packages/utils/tsconfig.json --noEmit --incremental false
```

Enable native testing only where native tests exist. Do not force Turbo aggregation into a root-Vitest project, copy Expo dependencies into a solo project, or describe partial package coverage as a complete aggregate.

## Behavior and failure handling

### Quality and XState

ESLint findings are advisory. Setup failures, inability to run tooling, TypeScript errors, and test failures remain blocking. Available coverage is retained after test failures; absent coverage is unavailable evidence, and retained coverage may be partial. Codecov receives the configured application reports.

The native job runs only when `native-command` is supplied. XState analysis and publication remain advisory and inspect the application’s PR history, not the shared repository’s history. Existing PR comments are updated in place. Product state management is unchanged.

### Preview Playwright

The workflow matches a successful Vercel Preview deployment to an open PR at the same commit, then runs the application’s browser tests. No matching PR is a legitimate skip; setup and test errors are failures. Available reports are retained without clearing the failing test result.

The application’s Playwright configuration must consume `PLAYWRIGHT_TEST_BASE_URL`. Public Previews need no credential; use `trusted-oidc: false`. For an existing OIDC-protected Preview, use `trusted-oidc: true` and retain the application’s `PLAYWRIGHT_VERCEL_TRUSTED_OIDC_TOKEN` header configuration. Disable credential-bearing traces for that CI run while retaining local trace behavior. Tokens must not appear in logs or diagnostics. Adoption does not introduce a sanitizer or change account settings.

### Production Lighthouse

The workflow waits for the matching `main` deployment, measures `production-url` five times, and publishes the median-Performance report and score JSON through GitHub Pages. It does not run on PRs. Measurement uses the shared tooling’s frozen lockfile without installing the application or decrypting its assets.

Preserve the existing retention and cancellation behavior. The workflows retain ordinary coverage, Playwright, XState, and complete Lighthouse artifacts for 14 days.

## Verification

The shared repository’s [checks](https://github.com/DoctorDerek/DoctorDerekCICD/actions/workflows/verify.yml) run formatting, ESLint, TypeScript, and helper tests on PRs and `main`, then upload helper coverage to Codecov. They do not deploy a website or run consumer application tests.

Recorded hosted evidence for the initial integration:

- [Shared-helper checks and Codecov upload](https://github.com/DoctorDerek/DoctorDerekCICD/actions/runs/34932496450): passed.
- [DoctorDerek.com Preview Playwright, attempt 2](https://github.com/DoctorDerek/DoctorDerek.com/actions/runs/34925498520/attempts/2): passed using workflow revision `93e29ba0fcf1d35d8ff0040002816c36d763d966`.
- [DoctorDerek.com Production Lighthouse](https://github.com/DoctorDerek/DoctorDerek.com/actions/runs/34934638819): passed using the same workflow revision.

These runs verify the shared source and web pilot, not every consumer or native-device behavior. Inspect a run’s `referenced_workflows` when confirming which revision executed. A local check alone does not prove hosted uploads, Preview access, or Pages publication.

### Local checks

Use the Node version in `.node-version` and pnpm version in `package.json`, then run from this repository’s root:

```sh
pnpm install --frozen-lockfile
pnpm exec prettier --check .
pnpm lint
pnpm typecheck
pnpm test --coverage
```

`pnpm format` applies formatting fixes. Keep application tests in their application repositories. Existing XState/Lighthouse capability tests belong here; do not add workflow-text tests, evidence inventories, diagnostic processors, or a conformance framework during adoption.

## Maintenance

Change a capability here, verify it, and review it. When helper source changes, commit it first and update the helper checkout SHA in the reusable workflows. Then update the complete caller examples to the reviewed workflow SHA. Consumers adopt that revision explicitly; a shared merge does not silently update their automation.

A conforming consumer needs no PR. Differences outside the documented inputs require a specific incompatibility report and approval. Do not fork the implementation locally or add an installer, npm package, service, or release bot.

## License

Copyright (c) 2026 Dr. Derek Austin, all rights reserved. See [LICENSE.txt](LICENSE.txt).
