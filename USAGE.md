# Using DoctorDerekCICD

This is the configuration and maintenance reference for the shared workflows. See the [README](README.md) for the project overview.

## Source revisions

The shared implementation was merged in [DoctorDerekCICD PR #2](https://github.com/DoctorDerek/DoctorDerekCICD/pull/2), followed by the [DoctorDerek.com pilot integration](https://github.com/DoctorDerek/DoctorDerek.com/pull/215).

| Source                                                                                                      | Commit                                     |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Original implementation, [DoctorDerek.com PR #213](https://github.com/DoctorDerek/DoctorDerek.com/pull/213) | `e679c7c31a7c74513f3b4ee3c21a7ba4029b3bf6` |
| Shared helper source                                                                                        | `f6ccad1da06de4dd8492cbf4b7e4a32e97737b57` |
| Reusable workflows                                                                                          | `93e29ba0fcf1d35d8ff0040002816c36d763d966` |
| Reviewed caller examples                                                                                    | `dbf880ada33888464713046132f2616879ea7925` |
| Shared Playwright runner contract                                                                           | `0bcbfc0a2e2a8f210e3d445a92615f5701591f17` |

The first four commits record the initial integration. The Playwright contract below replaces that revision's full-command input; the current Playwright examples pin the implementation of the new contract. Existing consumers stay on their selected immutable revision until they explicitly adopt a reviewed update. The workflows pin their shared helper checkout; consumers do not need a separate helper-version input. Retain the full workflow SHA in each caller.

## Adopt the existing callers

Use the [Next.js examples](examples/nextjs/) or [Next.js + Expo examples](examples/nextjs-expo/) from the reviewed revision being adopted. Each caller pins its workflow implementation. Copy the applicable files into the application repository's `.github/workflows/`:

- `eslint-vitest-xstate.yml`: application linting, types, tests, coverage, and XState PR visualization.
- `playwright.yml`: browser tests after a successful matching Preview deployment.
- `lighthouse.yml`: Production measurements after a push to `main`, with manual dispatch available.

The solo example contains DoctorDerek.com values; the monorepo example contains Mapachess values. Substitute the application’s verified commands, paths, and production URL. Keep its product tests, configuration, compatible dependencies, and coverage thresholds unchanged.

### Inputs

| Input                     | Source of truth                                                         | Default                                                      |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| `application-directory`   | Working directory for application test/typecheck commands               | `.`                                                          |
| `node-version-file`       | Existing Node version file, workspace-relative                          | `.node-version`                                              |
| `typecheck-command`       | Existing complete web/shared/native typecheck command                   | Required                                                     |
| `vitest-command`          | Existing application coverage command, retaining failure-time coverage  | `pnpm exec vitest run --coverage --coverage.reportOnFailure` |
| `coverage-files`          | Actual LCOV files, comma-separated for multiple contributors            | `coverage/lcov.info`                                         |
| `coverage-artifact-paths` | Actual coverage directories, newline-separated                          | `coverage/`                                                  |
| `native-command`          | Existing native-renderer Jest coverage command                          | Empty; native job skipped                                    |
| `native-coverage-files`   | Existing native LCOV path                                               | `coverage/native/lcov.info`                                  |
| `prepare-command`         | Optional application preparation before shared browser-test execution   | Empty; preparation skipped                                   |
| `job-timeout-minutes`     | Complete Playwright job ceiling, positive integer at most 360           | `75`                                                         |
| `suite-timeout-minutes`   | Playwright suite ceiling, positive integer smaller than the job ceiling | `60`                                                         |
| `report-paths`            | HTML report and test-results directories, newline-separated             | `playwright-report/` and `test-results/`                     |
| `trusted-oidc`            | Existing working Vercel Trusted Sources configuration                   | `false`                                                      |
| `production-url`          | Canonical public Production URL                                         | Required                                                     |

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

The workflow matches a successful Vercel Preview deployment to an open PR at the same commit, then runs the application's browser tests. No matching PR is a legitimate skip; setup and test errors are failures. Available reports are retained without clearing the failing test result.

After frozen dependency installation and browser setup, an optional `prepare-command` runs in `application-directory` with Bash error and pipeline failure handling. It is for application preparation, such as compiling imported workspace packages, and must not start the test suite. A preparation failure prevents the test step from running. Omit preparation where the tests already import executable source.

The shared workflow runs `pnpm exec playwright test` with line and HTML reporters. It retains per-test console progress and produces an HTML report without starting a report server. Browser projects, test discovery, retries, assertions, and per-test timeouts remain in the application's Playwright configuration. Shared reporting and the suite deadline are supplied by the workflow rather than duplicated in each application.

The default complete-job ceiling is 75 minutes; the Playwright suite ceiling is 60 minutes. Both are shared inputs, in positive integer minutes, with the suite shorter than the job. The fifteen-minute difference allows for setup, preparation, and report handling; it does not guarantee report upload if setup consumes the allowance or GitHub terminates the job. A suite timeout remains a failure and can produce a report before the outer job ceiling. Increasing a ceiling is not evidence that a stalled test has been fixed. See [Playwright suite timeouts](https://playwright.dev/docs/test-timeouts#global-timeout) and [reporters](https://playwright.dev/docs/test-reporters).

The application's Playwright configuration must consume `PLAYWRIGHT_TEST_BASE_URL`. Public Previews need no credential; use `trusted-oidc: false`. For an existing OIDC-protected Preview, use `trusted-oidc: true` and the shared fixture below. The workflow exposes `PLAYWRIGHT_VERCEL_TRUSTED_OIDC=true`; the fixture requests and renews the existing GitHub identity as needed. Protected runs force `--trace=off`; unprotected and local runs retain their configured trace behavior.

#### Canonical protected-preview identity lifecycle

Automatic renewal is shared CI behavior, not a new account-setup decision. Do not ask for a bypass secret or a Vercel protection change to repair an expired existing GitHub identity. This implementation promotes WAYVM's existing expiry-aware fixture into one shared owner. A once-per-suite token is insufficient for a suite that can outlive it.

The existing private `doctorderek-cicd` package exports `doctorderek-cicd/playwright`. Add this repository as a dev-only Git dependency pinned to a reviewed full commit SHA and commit the resolved pnpm lockfile. There is no registry publication, install/build hook, background service or separate test command. The export uses the existing jiti runtime; the caller supplies its own Playwright `test` object, avoiding a second runner instance.

Create the application's small fixture entry, then import its `test` in every protected-preview spec instead of importing `test` directly from Playwright. Continue importing `expect` and Playwright types normally:

```ts
import { test as base } from "@playwright/test"
import createPreviewTest from "doctorderek-cicd/playwright"

export const test = createPreviewTest(base, { minimumValidityMs: 90_000 })
```

The reserve above matches Mapachess's existing longest individual test. Verify it for each consumer. Prefer declaring longer test timeouts before fixtures initialize; when tests extend their timeout inside the body, the reserve must cover that longer duration. This reserve does not increase any test timeout. Unbounded tests or tests longer than a newly issued identity's validity fail explicitly rather than running with stale authentication.

Each worker caches its identity. Before creating a test's browser or API context, the fixture requires enough remaining validity for the greater of its current timeout and the reserve, plus a 30-second clock-skew allowance. It reads the issuer's actual `exp`, not an assumed token lifetime. It uses `ACTIONS_ID_TOKEN_REQUEST_URL` and `ACTIONS_ID_TOKEN_REQUEST_TOKEN` already supplied by GitHub with `id-token: write`; no application secret is introduced. Requests have a bounded timeout, reject redirects and sanitize errors. New tokens are masked before use; report annotations contain only expiry timestamps. Protected traces must be off. The fixture accepts only HTTPS `.vercel.app` preview targets; local/unprotected tests make no identity request and retain existing headers.

Remove static `PLAYWRIGHT_VERCEL_TRUSTED_OIDC_TOKEN` headers from consumer configuration when adopting this workflow revision. That one-shot token output is no longer provided. The workflow pin and fixture dependency pin are explicit review boundaries; changing shared main does not silently migrate applications. Keep application tests, browser projects, timeout policy, data, and Vercel settings unchanged. See [GitHub's OIDC request contract](https://docs.github.com/en/actions/reference/security/oidc) and [Playwright fixture ownership](https://playwright.dev/docs/test-fixtures).

Mapachess is the initial integration pilot. WAYVM already has working renewal and should replace its local resolver/fixture with this owner on reviewed adoption, not maintain a fork or undergo new credential setup. Verify other consumers before selective adoption; do not modify unrelated projects automatically.

#### Migrate a full-command caller

The new workflow revision removes `playwright-command`. Update the pinned SHA and its inputs together; older pinned consumers continue using their old contract until explicitly migrated.

For Mapachess, replace its build-and-test command with:

```yaml
with:
  trusted-oidc: true
  prepare-command: pnpm --filter @mapachess/profile... build
```

For WAYVM, retain `trusted-oidc: true` and remove the command that previously set the authentication flag and `--trace off`; the shared runner supplies both. Adopt the shared fixture above instead of its local renewal implementation. It does not need Mapachess's compiled-workspace preparation.

Review any other caller's command before updating its pin. Callers currently relying on additional flags such as `--pass-with-no-tests` require a separately reviewed compatible input before adoption; silently dropping an option or replacing it with a preparation command is not a migration. Do not add arbitrary shell arguments that can bypass shared execution policy.

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

A conforming consumer needs no PR. Differences outside the documented inputs require a specific incompatibility report and approval. Do not fork the implementation locally or add an installer, separately published npm package, service, or release bot. The existing repository's dev-only fixture export is consumed by immutable Git revision.

## License

Copyright (c) 2026 Dr. Derek Austin, all rights reserved. See [LICENSE.txt](LICENSE.txt).
