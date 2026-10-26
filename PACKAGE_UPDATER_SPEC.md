# MA’AM — Minimal-Attention Automated Maintenance

Author and maintainer: Dr. Derek Austin

- Document type: Functional specification and acceptance contract
- Section prefix: PU
- Version: v0.4
- Status: Approved specification; implementation and activation are not established
- Created: Oct. 7, 2026
- Last updated: Oct. 25, 2026
- Canonical location: `DoctorDerekCICD/PACKAGE_UPDATER_SPEC.md`

## PU.1 — Purpose and success

Keep deployed projects reasonably current and secure automatically, without making package maintenance another recurring job for their owner.

The system maintains Node.js, pnpm, and application and development dependencies: select eligible versions, record coherent changes, verify the affected application, merge eligible candidates, rebuild through the existing release path, and verify the deployed result. It does not equate opening a pull request, completing an updater run, or passing installation with completed maintenance.

“Autoversioning” in this contract means updating dependency and toolchain versions. It does not mean changing the application's product version, publishing npm packages, automatically advancing shared-workflow references, or creating a release-tagging system. Pulling an owner's local checkout is not part of successful hosted maintenance.

A candidate that cannot complete safely remains unapplied with inspectable evidence. It does not generate a new obligation to review, repair, attend a meeting, or schedule maintenance. Security-related candidates follow the same approved policy; they do not establish an exceptional human on-call duty.

Successful upkeep reduces exposure to already-fixed defects while preserving working products. Neither package age nor a passing test suite certifies that a dependency is harmless or that every application behavior has been exercised. The acceptance contract below specifies the evidence required for authorized automation, not an unlimited guarantee.

## PU.2 — Authority, ownership, and scope

This specification owns requirements and the Definition of Done. The reviewed shared configuration owns executable policy. Consumer configuration owns only the substitutions listed in PU.12. Existing manifests, test configuration, release configuration, and repository governance remain authoritative for their respective responsibilities.

Git records the approved specification and configuration revision. The candidate pull request records its changes and existing checks record execution evidence. Private scratchsheets hold temporary work state; they are not a competing specification. The Agentic Helper should point here, not reproduce this contract or executable configuration. It continues to own general agent orchestration; this contract owns only the explicitly enrolled maintenance capability. Existing shared CI/CD remains the verification and reporting implementation, not a second updater.

The intended application profiles are:

- Next.js solo: a TypeScript/React web application.
- Next.js + Expo: a TypeScript/React monorepo with a Next.js web application, an Expo native application, and its actual shared packages; Turborepo is retained where present.

DoctorDerek.com is the sole initial application pilot. The first implementation must be independently usable and verifiable with only `DoctorDerek/DoctorDerek.com` enrolled; no second application, Expo pilot, or portfolio-wide migration is a prerequisite for completing this web pilot. Calendar, CRM, Pokedex, Weather, WAYVM, and Mapachess-Expo remain unenrolled and unchanged until separately authorized. Godot and confidential client projects are outside scope.

Keep policy hosting separate from update enrollment. DoctorDerekCICD may host the reviewed specification and opt-in preset without becoming an updater target itself. Add a new dedicated preset rather than alter an already-consumed shared policy or workflow in a way that changes other projects. The pilot consumer explicitly references that preset; do not introduce organization-wide inherited configuration, all-repository activation, or automatic future enrollment. Verify the approved app repository selection and actual effective target before enabling it. Publishing a shared policy is not authority to act on every repository that uses the shared CI/CD.

The specification PR in DoctorDerekCICD changes documentation only and enables nothing. A later implementation PR may publish the dedicated shared policy; a separate DoctorDerek.com PR supplies its explicit enrollment. Existing quality, Preview, and Lighthouse consumers must not acquire maintenance behavior merely by continuing to call the shared workflows. Before activation, verify both the selected-repository permission scope and the effective repository configuration; neither a published preset nor a repository-name comment proves isolation. Preserve unrelated installations rather than removing their access to manufacture a one-repository result.

The maintained hosted app supports selected-repository installation, and repository-hosted presets are consumed through explicit configuration references. Those capabilities support a one-repository design; they do not prove the current account selection or permissions have been configured. Inspect existing installation scope before any authorized change, preserving unrelated installations and behavior. [Repository selection](https://docs.renovatebot.com/getting-started/installing-onboarding/), [shared presets](https://docs.renovatebot.com/config-presets/)

The candidate implementation is a maintained hosted Renovate service consuming a shared preset from the existing DoctorDerekCICD repository. This selection remains conditional on the proof gates in PU.13. Do not build a new updater, merge controller, service, or reporting system to make the candidate fit unnoticed.

Application dependencies, development dependencies, workspace and transitive resolution, Node.js runtime versions, and pnpm versions are in scope. Existing overrides must be examined as real constraints, not silently deleted or treated as permanently correct. These targets share the attention and verification contract, but their compatibility and installation mechanisms are not interchangeable.

GitHub Actions SHA updates and shared-workflow revision propagation remain separate responsibilities, not an implied extension of “autoversioning.” Preserve their existing behavior unless a narrowly scoped cutover decision expressly includes it. This contract does not introduce operating-system patch management, a certificate-store service, PHP updates, or new hosting infrastructure.

### PU.2.1 — Canonical owners

| Responsibility                                             | Owner                                                                                          | Required boundary                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Intended maintenance behavior and Definition of Done       | This specification in DoctorDerekCICD                                                          | One approved contract; no competing full Google Doc.                                    |
| Executable selection, maturity, grouping, and merge policy | Dedicated shared configuration and only genuinely necessary existing-tool integration          | No default enrollment through general CI callers.                                       |
| Application constraints and exact installed graph          | Existing manifests, workspace settings, overrides, SDK constraints, and lockfile               | Preserve actual compatibility ownership rather than copying another project's versions. |
| Node selection                                             | Existing `.node-version`, package runtime declarations, CI setup, and hosting runtime controls | Reconcile existing owners; a CI-only change is not deployed-runtime proof.              |
| pnpm selection                                             | Existing `packageManager` declaration and supported provisioning path                          | Preserve an exact package-manager version and associated integrity metadata where used. |
| Validation and release evidence                            | Existing shared checks, application tests, and deployment records                              | Read actual outcomes; no duplicate state database or reporting controller.              |

## PU.3 — Approved policy direction

| Concern                        | Contract                                                                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routine maintenance            | Consider updates weekly within approved compatibility lines, including Node, pnpm, direct/development/transitive packages, lockfile-only improvements, and compatible SDK-constrained pin refreshes.                         |
| Compatibility-boundary changes | Retain the earlier quarterly consideration baseline for ordinary majors, Node/pnpm major changes, zero-major changes outside the approved range, and SDK migrations; compatible candidates may complete automatically.       |
| Timing                         | Weekly overnight consideration in `America/Los_Angeles`; choose and verify a supported weekly window in the implementation plan. The retained quarterly baseline is Jan./Apr./Jul./Oct. 23rd, 05:00–08:00 Pacific.           |
| Release maturity               | Require seven complete days for newly selected package and controllable toolchain releases, including transitive packages; seven days is 10,080 minutes for pnpm. Provider-managed runtime limits remain explicit in PU.5.1. |
| Ordinary ranges                | Preserve bare `^MAJOR` declarations; change the major only in the compatibility-boundary lane.                                                                                                                               |
| Exceptions                     | Preserve the repository’s zero-major convention and exact Expo SDK-compatible constraints.                                                                                                                                   |
| Release channels               | Stay on approved stable channels; do not introduce prereleases, replacements, new registries, or a new dependency ecosystem automatically.                                                                                   |
| Candidate grouping             | Keep genuinely coupled packages together; initially allow at most one open routine and one open compatibility-boundary candidate, with grouping and activity limits proved together.                                         |
| Attention                      | No requested reviewers, assignments, mentions, recurring reminders, or owner-facing maintenance deadline.                                                                                                                    |
| Failed attempts                | Keep production unchanged before merge, retain the failure honestly, and retry only under the bounded rules in PU.7.                                                                                                         |

The approved direction uses overnight hosted-service windows instead of an exact-minute promise. Hosted Renovate cannot promise a `:37` start: its schedule constrains eligibility when the hosted runner executes, and its cron syntax has no minute precision. Do not introduce a self-hosted scheduler solely to reproduce that minute. The exact supported window and timezone must be recorded and checked in the reviewed implementation configuration before enablement. [Renovate scheduling](https://docs.renovatebot.com/key-concepts/scheduling/)

The weekly direction replaces the former monthly routine window; it does not create a weekly owner appointment. Quarterly automatic compatibility-boundary consideration and an optional owner-requested repair session, potentially only yearly, are different activities. This specification retains the earlier quarterly automatic baseline rather than converting every major to manual review or assuming a new annual automatic schedule. Approval of this specification does not activate maintenance.

Routine and compatibility-boundary windows do not prove that one candidate finished before another started. A major candidate must still use a current base and current evidence. A failed major candidate must not prevent later compatible improvements within the supported major. Do not build a custom queue merely to force calendar ordering.

Candidate creation and automatic branch refresh are governed separately from completion of already-running validation and merge of an unchanged eligible candidate. Allow in-flight checks to finish; an otherwise eligible unchanged candidate need not wait for the next maintenance window solely because its creation window ended. A required refresh is a new candidate revision subject to the approved refresh window, activity budget, and fresh evidence. No failed check grants an exception to these controls.

Classify zero-major changes explicitly: for example, an update from `0.35.3` to `0.35.4` can remain within `^0.35.3`, while `0.36.0` crosses that range and belongs to quarterly compatibility-boundary consideration. These versions illustrate range semantics, not registry availability. An exact-pin change required for compatibility within the selected Expo SDK is not automatically an SDK migration; use the actual SDK constraints. [Caret-range semantics](https://github.com/npm/node-semver#caret-ranges-123-025-004)

## PU.4 — Candidate lifecycle

These are observable outcomes, not a requirement to implement a new state machine or database.

Read these outcomes from the existing PR, checks, and deployment records; do not add a combined status collector, extra success badge, or per-candidate monitoring service merely to restate them.

1. **No repository change:** Resolve the eligible package and toolchain update set for an enrolled repository. If no eligible file change exists, create no empty PR or branch churn. A provider-runtime refresh with unchanged source is a separate release action governed by PU.6.5, not a fabricated dependency update.
2. **Deferred before publication:** If maturity, compatibility, missing registry evidence, or a declared constraint prevents resolution, retain an inspectable reason using the updater’s existing records. Do not knowingly publish an age-ineligible lockfile and wait for application CI to reject it.
3. **Candidate prepared:** Produce the smallest coherent manifest, lockfile, and applicable runtime/package-manager declaration change. Record affected workspaces, toolchain changes, and upstream release information through the updater’s existing PR presentation. Do not edit application behavior, weaken checks, or amend workflow permissions as part of an automatic candidate.
4. **Validation pending:** Wait for the actual applicable checks and deployment evidence for that candidate revision. Missing, cancelled, timed-out, or failed required execution is not success.
5. **Candidate rejected or deferred:** Leave the candidate unmerged when required evidence fails. Keep available diagnostics and the exact failing revision. No automatic human assignment or escalation follows.
6. **Merged, release pending:** Only an eligible candidate may merge. Its merge must exercise the real existing main-branch release/event path. A green updater job is not evidence of that event path.
7. **Completed for the declared surface:** Existing production deployment and applicable post-release checks succeed for the merged revision. Identify web and native outcomes separately. A later release failure remains a release failure, not a completed update.

There must be one active update writer for each targeted dependency set/ecosystem. The cutover must prevent competing package, Node, or pnpm candidates. Inventory the old mechanism's actual responsibilities before removal: retire only those superseded by this policy, and preserve unrelated GitHub Actions or other toolchain behavior unless its retirement is separately approved. A mixed-purpose file is not wholly obsolete because one responsibility moved. Existing bot PRs are reconciled by identity and relevance during the approved cutover, not mass-closed because they are inconvenient.

Changes to the candidate invalidate prior candidate evidence. Changes to the base must be handled using the maintained updater and the approved repository merge policy; do not accept a known-stale test result after a dependency-affecting base change. Revalidation must not become an unbounded rebuild on every unrelated push.

## PU.5 — Maturity and installation coherence

Selection, lockfile generation, and frozen installation must enforce one policy. A weekly run may still encounter a release published today; cadence is not a maturity check.

Bare `^MAJOR` permits compatible resolution; it does not update a committed lockfile by itself. The candidate must intentionally advance eligible versions, record the graph, and then use reproducible frozen installation for validation and deployment. Do not replace frozen production installs with unrecorded latest-version resolution. [pnpm installation](https://pnpm.io/cli/install), [pnpm updates](https://pnpm.io/cli/update)

Require the newest eligible compatible version, not simply the highest published version. Verify registry timestamps rather than trusting a package’s self-authored metadata. An unavailable required timestamp is a reason to defer, not permission to assume sufficient age. Workspace links are not registry releases; preserve their ordinary semantics.

The same package-resolution maturity contract must hold in the updater environment, local package installation, shared CI, Vercel, and applicable Expo build paths. Express it in the existing package-manager configuration and maintained updater settings; PU.5.1 separately addresses tool bootstrap and provider-controlled runtime patches. A shared workflow correction is allowed only through an approved implementation plan if its current installation path demonstrably bypasses that configuration.

Security labels must not bypass age, schedule, grouping, merge checks, or the attention contract. Use the ordinary scheduled candidate path for eligible patched versions. For the proposed Renovate preset, explicitly disable the special vulnerability-triggered PR path rather than assume ordinary rules constrain it; that path bypasses schedules and selected rate limits. This does not disable package integrity checks, malware protections, or GitHub alert visibility. Reconcile any competing existing npm PR-generation path only during the narrowly approved cutover. Delegated lockfile resolution still requires the package-manager proof below. [Vulnerability PR configuration](https://docs.renovatebot.com/configuration-options/#vulnerabilityalerts), [minimum release age](https://docs.renovatebot.com/key-concepts/minimum-release-age/)

For pnpm, explicitly verify strict maturity enforcement, handling of missing publication times, and installation of an existing frozen lockfile using each supported pinned version. Do not bypass checks by trusting all lockfiles, disabling supply-chain enforcement, or adding broad age exclusions. Any retained version-specific exception must have a concrete existing reason and explicit review; do not invent an exception to make an update green. Current pnpm documentation describes both transitive enforcement and options that can relax it, so defaults are not a sufficient contract. [pnpm dependency resolution](https://pnpm.io/settings/dependency-resolution)

Preserve approved install-script restrictions, integrity checks, registry configuration, and exact compatibility constraints. A forced install, ignored peer conflict, or fabricated lockfile is not an acceptable repair. An override that holds a fixed package back belongs in the eventual candidate analysis; removing an override must be justified by its original purpose and the resulting dependency graph.

### PU.5.1 — Node and pnpm maintenance

Within the selected supported Node LTS line, consider eligible minor/patch releases weekly; treat a change of Node major as a compatibility-boundary candidate. Reconcile `.node-version`, `engines.node`, existing CI runtime selection, package-manager engine requirements, and the deployment platform's supported line. Do not add a second version-selection system, loosen runtime constraints to arbitrary future majors, or confuse `@types/node` with the Node executable.

For pnpm, update the existing exact `packageManager` version through its supported installation mechanism, retaining integrity metadata where used. Verify the proposed pnpm can run under the selected Node and resolve/install the actual workspace. Validate any resulting lockfile-format or resolution change with that candidate toolchain in CI and the release path; a green test under the previous package manager does not establish compatibility with the replacement. Node and pnpm may require a coherent grouped change, not forced independent updates.

Verify the seven-day policy for updater-selected Node and pnpm versions before those tools execute candidate resolution or tests. Application dependency age settings alone do not prove the tool bootstrap is covered. A missing reliable release timestamp defers that selection rather than silently exempting the tool. Maintained Renovate supports relevant Node declarations and package-manager fields, but that capability alone does not prove this repository's bootstrap, age enforcement, or release behavior. [Runtime and package-manager support](https://docs.renovatebot.com/node/)

Vercel exposes Node major selection and controls minor/patch rollout. The repository cannot promise an exact hosted patch pin or a seven-day delay on Vercel's own rollout merely by editing `.node-version`. Keep this provider-managed boundary visible in the implementation proposal and approval; do not silently count it as the updater enforcing release age. Node remains in scope: verify supported selection, the actual build/runtime evidence where available, and whether a new deployment obtains the intended provider runtime. No production diagnostic endpoint or hosting migration is introduced to manufacture proof. [Vercel Node version control](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

## PU.6 — Validation, merge, and release contract

### PU.6.1 — Shared validation semantics

Reuse the current shared ESLint/Vitest/XState, Preview Playwright, and Production Lighthouse responsibilities. Preserve strict TypeScript, genuine application coverage, and existing native test ownership. Do not add a second CI stack or permanent workflow-plumbing test suite.

Before enabling automatic merges, inspect the actual GitHub check names and outcomes produced by the current reusable workflows. Match their real identities, including any caller prefixes. Do not reproduce old display strings or infer that a missing expected check is intentionally inapplicable.

Setup, installation, strict type checking, applicable tests, and the required build/Preview E2E evidence must complete successfully. Preserve current advisory treatment of lint findings and XState findings; failure to execute required tooling is not an advisory lint finding. Preserve existing coverage policy without inventing a new numerical threshold. Available partial coverage after failure remains partial evidence, never a complete success baseline.

A legitimately inapplicable web deployment event keeps its existing skip semantics. But a dependency candidate that changes the deployed web dependency graph still needs qualifying web build and E2E evidence before unattended merge; an unrelated skipped run cannot substitute for it. If current event paths cannot supply that evidence, leave automatic merging disabled for that case until the specific gap is resolved and approved.

Exercise the actual delayed-Preview case: PR quality can finish before the separate deployment-status event produces Playwright evidence. All currently present checks being green is insufficient when an applicable required check has not yet appeared. Match both required execution identity and candidate revision; do not replace this proof with a delay or a new polling controller.

Production Lighthouse remains a post-release measurement. Do not move it into every PR, make its normal measurement variance a new merge gate, or suppress a real workflow failure. Preserve its existing trigger, reporting, and measurement policy.

### PU.6.2 — Next.js solo

Use the candidate's declared and actually selected runtime/package-manager versions, frozen installation, and existing strict TypeScript, application Vitest coverage, web build, and Preview Playwright commands. After a qualifying merge, verify the actual production deployment and existing Production Lighthouse run for the new revision. A Preview success is not a production deployment; a CI-only toolchain update is not a deployed-runtime update.

Do not change feature flags, licensed-asset handling, deployment secrets, production origins, Preview protection, or authentication to make a dependency candidate pass. These remain owned by their existing implementations.

### PU.6.3 — Next.js + Expo monorepo

Use the same policy and automation owner, with explicit web, shared, and native contributors. A root command is acceptable only if inspection proves which packages it runs and which reports it produces. Do not impose Turborepo aggregation on a repository whose approved coverage owner is root Vitest, or omit native Jest because web Vitest passed.

Treat Expo SDK, React Native, React, native modules, and their required peers as a compatibility set. Preserve authoritative SDK constraints and deliberate web/native version relationships. Do not apply a generic latest-version rule to SDK-governed dependencies. Routine changes within the current SDK can qualify automatically; major SDK candidates can also qualify if maintained tooling can produce the compatible update and the applicable validation/release contract is satisfied.

Preserving exact pins means preserving the required pinning strategy, not freezing those packages forever: a verified SDK-compatible update may change the exact pinned values together without loosening them into ordinary caret ranges. Compatibility with the selected SDK determines eligibility for that set.

Official Expo compatibility tooling may be used in the approved implementation, but its actual commands, package resolution, and any modifications must be inspected and verified. Node and pnpm follow this contract; other native build-system migrations, destructive native regeneration, new paid builds, and application rewrites require separate approval. SDK migration instructions identify compatible dependency alignment and checks; they are not blanket authorization for every migration action. [Expo SDK upgrade guidance](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)

Record three distinct results: source/lockfile updated, web released, and native release effect. JavaScript export is not a native binary build; a Vercel deployment is not an app-store release. A native-code change requires a compatible native runtime for distribution, rather than an incompatible over-the-air update. [Expo runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)

Before enabling an Expo profile, inspect its actual existing build/distribution path and record what is automated, validated only, or intentionally deferred. Reuse that path; do not create a store-release architecture as part of enrollment. If native publication is not automated, state that boundary prominently and do not label the native installed app updated. Whether source-only native updates may merge without immediate distribution is an explicit profile approval, not an assumption. A complete web pilot does not establish a complete native rollout.

Node and pnpm are also in scope for this profile, including the actual web and native build environments. Confirm the selected SDK and build tooling support the candidate versions; do not infer EAS toolchain compatibility from a Vercel build or a local JavaScript export. One shared policy still applies, with genuine platform constraints supplied by the existing owners.

### PU.6.4 — Narrow merge authority

The owner reviews and merges setup/configuration PRs and any agent-written application repair PRs. The separately approved dependency-bot exception permits only eligible package and Node/pnpm candidates to merge without that review. It is not permission for this agent to merge its own PRs or for the bot to modify arbitrary product, test, or infrastructure code.

Verify that the chosen bot identity and merge method trigger the existing release workflows. Do not add a second deployment pipeline to compensate for an unexamined event-suppression problem. Inspect current repository protections and permissions before changing them; preserve deletion protection and unrelated governance.

### PU.6.5 — Weekly release outcome and runtime refresh

The weekly opportunity aims to get eligible improvements into production, not merely refresh a branch. A passing changed candidate must follow the existing release path without an owner click. Record actual versions and release identity in existing build/deployment evidence when available; do not create a new telemetry service or public runtime-inspection route. Never persist credentials in diagnostics or public PR metadata.

An unchanged lockfile rebuild does not select newer npm versions. Separately, a provider-managed runtime may change without a repository diff. Before activation, the implementation proposal must resolve whether this project's no-change weeks require a bounded rebuild through its existing release mechanism to obtain intended runtime updates. Inspect platform behavior and cost first; do not silently promise a fresh production deployment every week while implementing only changed-PR releases. Do not manufacture empty commits or add a second deployment pipeline. This is an explicit release-policy decision, not a recurring task assigned to the owner.

A required but unavailable provider patch or unsupported runtime major is recorded as unavailable, not falsely completed or repaired through an unauthorized hosting change. Identify the platform limitation and the smallest supported option during the bounded pilot investigation. Later source, build, and deployed-runtime evidence remain distinct; successful rebuild alone cannot prove every underlying host or certificate-store update.

## PU.7 — Failure, repetition, and attention

Passing candidates should complete without owner interaction. A rejected candidate must leave the existing production release unchanged before merge and retain enough identity to investigate later: candidate/base revisions, package diff, policy reference, and links to available existing checks.

Preserve the original failure status. Do not turn a failed test green to publish diagnostics, classify an install failure as compatibility success, or treat a bot run that took no action as an updated application. Existing artifact retention is sufficient; later optional repair may reproduce expired evidence rather than require a new archival service.

Use the maintained updater’s grouping, concurrency, scheduling, and branch-update controls to limit churn. Start with at most one open routine and one open compatibility-boundary candidate per repository. An open-PR cap does not bound candidate commits, rebases, or the checks and deployments those revisions trigger. Before enablement, record and verify a concrete supported budget for automatic candidate revisions during each approved maintenance opportunity, including refreshes and replacement candidates. Verify the window, commit-rate control, and refresh behavior together; a per-hour limit alone is not proof of a per-opportunity bound. No custom counter, perpetual polling job, repeated same-revision re-dispatch, or continuous automatic rebase loop is permitted. [Maintained updater controls](https://docs.renovatebot.com/configuration-options/)

Grouping must balance useful completed updates with this activity budget. Do not force unrelated compatibility-boundary changes into one all-or-nothing candidate solely to minimize the visible PR count. Use the smallest supported grouping of genuinely coupled families without silently increasing concurrency or total activity. A mixed compatible/incompatible group must be part of proof: if the approved low-activity policy deliberately defers the whole failed group, state that outcome explicitly rather than claiming the compatible members shipped. No automatic bisection, per-package PR flood, or LLM repair service is authorized. Failure in the compatibility-boundary lane must not block independent routine maintenance within the approved compatibility line.

A failed group is not automatically split into many PRs to find one green dependency. New eligible releases, an explicitly requested retry, or the next permitted maintenance opportunity may justify a new attempt. Unchanged failures must not generate repeated owner-directed demands. A stopped or interrupted run must be recoverable from existing branch/PR identity without duplicate candidates or destructive cleanup.

Package-maintenance notification settings are part of acceptance, not a promise made by the bot’s configuration. Inspect the real GitHub and Vercel notification paths before creating the pilot candidates. The target is no routine success or rejected-candidate email, review request, assignment, or mention. Do not require a periodic manual scan as the price of this silence.

Change only separately approved notification settings. Do not disable billing, account-security, or unrelated failure notifications as a side effect. If the platforms cannot isolate the requested quiet behavior, report the precise tradeoff before enabling the pilot rather than adding a filtering service. Vercel documents deployment-failure notifications separately from other categories, but that is not proof of a bot-specific filter in the current account. [Vercel notifications](https://vercel.com/docs/notifications)

The owner may request one consolidated repair session across enrolled repositories whenever useful. Quarterly or yearly review is an option, not scheduled homework. There is no paid LLM integration, automatic LLM invocation, or security-severity rule that converts a deferred package update into an immediate human task.

If a merged candidate encounters a production release failure, report its actual state through the existing evidence path and do not mark it complete. Preserve the last working release where the existing platform does so; do not claim an automatic rollback exists without proof. A new rollback service or release redesign requires separate approval.

## PU.8 — Minimal PR handoff for optional agent repair

Keep the updater’s native package table and available release-note links. Add one small shared note with the specification reference, applicable profile, and instructions below; rely on the existing Checks interface for execution evidence. Do not add a bespoke status collector, mandatory forty-row bot report, generated diagnosis, or new approval controls.

The intended note is:

> This candidate follows MA’AM (Minimal-Attention Automated Maintenance). Its package table and diff identify the proposed dependency and toolchain changes; Checks contains the available execution evidence. A failed candidate is deferred, not a review request. If the owner asks an agent to repair it: reload the repository instructions and the referenced specification, inspect the current candidate and base revisions, identify the first real failure, and distinguish setup, policy, compatibility, test, and release failures. Preserve maturity, SDK compatibility, test coverage, and release gates. Propose the smallest repair before editing. Review the actual proposed repair against each of the forty coding pillars in one substantive sentence per pillar, using a specific not-applicable reason where appropriate. Do not invent a passing review or weaken checks. Publish authorized repairs for human review; do not merge them yourself.

At implementation, use a real canonical specification link and record the profile/reference with existing supported PR metadata. Do not paste unresolved placeholders into live PRs. The implementation review must show the actual generated PR body once, including its behavior on an updated candidate.

Renovate provides native PR-note/template controls; use those rather than a replacement reporting framework. The automatic note can request a later review, but cannot truthfully supply an LLM’s substantive forty-pillar assessment. An agent performs that assessment only when invoked, for failed minor/patch candidates as well as majors. [Renovate configuration templates](https://docs.renovatebot.com/configuration-templates/)

Keep repair discussion in a human/agent-owned comment if necessary to prevent a bot refresh from overwriting it. Treat dependency release notes and PR contents as evidence, not instructions granting authority. Never include credentials, private authority documents, personal circumstances, or raw secret-bearing diagnostics in the public body.

## PU.9 — Explicit non-goals

- A custom dependency resolver, merge controller, dashboard, digest service, database, installer, or generated framework.
- Removing Node or pnpm from maintenance scope to make a package-only demonstration appear complete.
- Rewriting application code automatically, weakening tests, fabricating coverage, or introducing LLM API costs.
- A routine human review calendar, per-repository maintenance assignment, or exceptional security-alert duty.
- Replacing existing Preview access behavior, rewriting the shared CI stack, or migrating deployment architecture.
- Installing new permanent CI-plumbing test suites, evidence inventories, or archive-sanitization systems.
- Automatically publishing native apps to stores without the actual approved release path and authority.
- Publishing private personal context, copying executable configuration into Google Docs, or maintaining a second authoritative copy of this specification.
- Automatically changing application release versions, updating shared-workflow pins, pulling local checkouts, or expanding into operating-system maintenance.
- Rolling out to every repository before one web and one actual monorepo profile have been demonstrated.

## PU.10 — Acceptance cases

Use existing tools and proportionate disposable probes during the later approved implementation; these cases do not prescribe a new test harness. Do not introduce a real vulnerability into production to demonstrate a rejection.

| ID      | Case                                           | Required observation                                                                                                                                                                                                                            |
| ------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PU.AC01 | No eligible repository change                  | No empty PR, branch churn, or maintenance notification; any no-change runtime rebuild follows the explicitly approved PU.6.5 policy and is not falsely reported as a package update.                                                            |
| PU.AC02 | Mature compatible within-range update          | Correct lockfile/range handling; applicable checks pass; authorized bot merge and actual web release complete without owner action.                                                                                                             |
| PU.AC03 | Fresh direct dependency                        | Candidate is deferred before application builds; the newest eligible older release may be selected instead.                                                                                                                                     |
| PU.AC04 | Fresh transitive or missing required timestamp | Lockfile resolution/install cannot silently bypass maturity; the rejected attempt does not reach unattended merge.                                                                                                                              |
| PU.AC05 | Security-labelled update                       | No hidden maturity/schedule/PR-limit bypass or owner escalation.                                                                                                                                                                                |
| PU.AC06 | Mature mechanically compatible major           | Same applicable evidence contract as routine work; major classification alone does not require review.                                                                                                                                          |
| PU.AC07 | Failed patch/minor or failed major             | Original failure remains visible, production is not changed by that unmerged candidate, and optional agent handoff is usable without an owner demand.                                                                                           |
| PU.AC08 | Missing, cancelled, or stale required checks   | No unattended merge based on absence, old revision evidence, or merely green updater execution.                                                                                                                                                 |
| PU.AC09 | Coupled packages and overrides                 | Coherent supported versions; no accidental cross-major adapter mismatch, removed constraint, or forced peer resolution.                                                                                                                         |
| PU.AC10 | Next.js + Expo profile                         | Actual web/shared/native contributors run; approved SDK pins and native release boundary are respected and reported separately.                                                                                                                 |
| PU.AC11 | Bot merge and production event path            | Existing release and Production Lighthouse triggers operate for the merged revision; no duplicate deployment architecture.                                                                                                                      |
| PU.AC12 | Interrupted run or repeated unchanged failure  | Existing candidate is reused or safely deferred; no duplicate PRs, endless rebuilds, or new reminder sequence.                                                                                                                                  |
| PU.AC13 | Notification behavior                          | Authorized pilot demonstrates absence of routine updater/failure email and review demands while preserving unrelated notification categories.                                                                                                   |
| PU.AC14 | Optional repair handoff                        | Native package details, policy/profile reference, and current evidence are accessible; a refreshed PR does not falsely claim an assessment or erase agent-owned repair findings.                                                                |
| PU.AC15 | Post-merge release failure                     | Outcome is not labelled completed; existing release/recovery behavior is observed without claiming unimplemented rollback.                                                                                                                      |
| PU.AC16 | Second profile and consumer adoption           | Consumers substitute only approved values; no independently invented controller, CI stack, or per-project reporting machinery.                                                                                                                  |
| PU.AC17 | Single-repository pilot isolation              | Effective updater targets contain only `DoctorDerek/DoctorDerek.com`; the shared preset host and other consumers are not enrolled or changed, and the web pilot completes independently of any Expo pilot.                                      |
| PU.AC18 | Candidate timing and bounded activity          | Creation and refresh obey the reviewed opportunity budget; unchanged eligible candidates can finish after the window, and repeated failures do not cause unlimited revisions or builds.                                                         |
| PU.AC19 | Mixed grouped outcomes                         | Coupled packages remain coherent; an incompatible group does not stall independent routine maintenance, and any deliberately deferred compatible members are reported honestly without automatic splitting.                                     |
| PU.AC20 | Zero-major compatibility boundary              | In-range zero-major updates enter routine consideration; out-of-range zero-major updates enter quarterly consideration rather than falling into neither category.                                                                               |
| PU.AC21 | Responsibility-scoped cutover                  | No competing package, Node, or pnpm writers remain in the pilot; unrelated Actions and other toolchain responsibilities are preserved unless separately authorized.                                                                             |
| PU.AC22 | Node selection and deployed-runtime evidence   | A mature supported candidate uses coherent runtime declarations and actual candidate checks; build and hosted-runtime evidence are distinguished, and provider-controlled patch/age limits are disclosed before enablement.                     |
| PU.AC23 | pnpm bootstrap and lockfile compatibility      | A mature pnpm candidate retains the supported exact-version/integrity form, executes with compatible Node, and validates frozen installation and the resulting lockfile with the selected toolchain; no fresh bootstrap bypass is assumed safe. |
| PU.AC24 | Shared hosting without enrollment              | Publishing this spec or a dedicated preset changes no other consumer's effective maintenance behavior; actual selected-repository scope and explicit DoctorDerek.com opt-in are verified before live activation.                                |

## PU.11 — Definition of Done and evidence limits

### PU.11.1 — Specification phase

The specification preserves the approved title and public-facing authorship, two real platform profiles, Node/pnpm/package scope, weekly routine direction, release-age policy, attention contract, non-goals, approval boundaries, and observable acceptance cases. Stable PU references are retained from the earlier draft. Implementation-owned choices and unresolved evidence are explicitly separated in PU.13. Its forty-pillar and seven-lens review remains a design assessment, not execution evidence. No unperformed local, hosted, deployment, or notification test is represented as passed. The v0.3 specification was approved for documentation publication on Oct. 24, 2026; implementation and activation retain separate approval gates.

### PU.11.2 — Web pilot

The shared policy and DoctorDerek.com consumer changes are reviewed and merged through the approved Git workflow. The implementation satisfies the web-applicable acceptance cases, including at least one real unattended candidate through production, a genuine rejection, coherent maturity enforcement, Node/pnpm candidate-path verification, actual deployment/runtime evidence at the approved platform fidelity, observed quiet notification behavior, and single-repository isolation. Demonstrate toolchain behavior using eligible real changes or proportionate disposable checks rather than manufacturing a production upgrade when none is available; label each evidence class honestly. Resolve the no-change-week runtime refresh policy before activation. Record tested tool versions and source/candidate/run identities in the implementation PR or its existing comments, not a new evidence system.

This is an independently complete pilot milestone. PU.AC10 and PU.AC16 concern future separately approved monorepo/consumer work and are not blockers or implied authorizations for completing DoctorDerek.com. They remain unperformed, not falsely marked passed. The specification can retain the future profile without implementing or enabling it during this pilot.

No implementation may be called complete merely because its configuration schema is valid. Local disposable checks establish only what they exercise. Actual artifact publication, bot merge, Preview qualification, native build/distribution, and production release require their respective hosted evidence.

### PU.11.3 — Portfolio-ready capability

This is a later, separately authorized milestone, not a prerequisite for the initial pilot. One actual Next.js + Expo repository also demonstrates its declared profile, including the explicitly approved native release boundary. Only then are the remaining approved consumers enrolled with narrow substitutions. If native distribution is deferred, the claim must remain source/native-validation plus web deployment, not automatic updating of installed native apps.

The result introduces no standing human maintenance duty, no new paid service, no duplicate update owner, and no divergent per-project implementation. Any unproved requirement remains listed as an unproved requirement; it is not silently deleted to declare completion.

## PU.12 — Permitted consumer substitutions

| Value                                    | Existing source of truth                                                                              | Verification                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Repository identity and selected profile | Actual repository/workspace structure                                                                 | Read manifests and existing CI callers.                                                                               |
| Runtime and package-manager selection    | Existing `.node-version`, `engines.node`, `packageManager`, CI provisioning, and hosting/EAS controls | Verify current and candidate compatibility plus actual build/runtime effects; do not maintain a second version owner. |
| Web/shared/native package ownership      | Manifests and test/coverage configuration                                                             | Confirm every applicable command and contributor, including native Jest.                                              |
| Registry, override, and SDK constraints  | Existing package-manager configuration and supported SDK contracts                                    | Inspect resolved graph and official compatibility evidence.                                                           |
| Required check identities                | Current hosted executions and existing governance                                                     | Verify actual names, outcomes, revisions, and legitimate applicability.                                               |
| Production origin and release path       | Existing application/release owners                                                                   | Verify the bot merge exercises the existing deployment architecture.                                                  |
| Native distribution boundary             | Actual native build/release configuration plus explicit approval                                      | Separate validation, binary creation, OTA, and store publication.                                                     |
| Enrollment and notification permissions  | Owner-approved app/account scope                                                                      | Demonstrate the approved account behavior without broadening access.                                                  |

Schedule, maturity, ordinary range policy, merge semantics, and failure/attention behavior are shared policy, not per-repository creative choices. Provider-managed runtime constraints and genuine SDK/native differences must be recorded and approved explicitly, not silently treated as equal enforcement. A real incompatibility requires a specific report and approval. Do not disguise a second implementation as an adaptation.

## PU.13 — Concrete proof gates before implementation is enabled

1. Verify the chosen hosted updater supports coherent grouping, range preservation, maturity, compatibility-boundary eligibility, and bounded retry/refresh behavior without a custom controller; inspect its actual deployed capabilities rather than assuming the documentation version is the hosted version.
2. Prove selection, lockfile generation, and frozen installation on the current and applicable candidate Node/pnpm versions, including tool-bootstrap age, transitive and missing-timestamp cases, and existing overrides. Verify actual hosting runtime ownership and no-change rebuild behavior. Repeat profile-specific proof only when another profile is separately enrolled.
3. Inspect current app permissions, required checks, merge behavior, notification settings, and release events; establish the effective pilot target as only `DoctorDerek/DoctorDerek.com` and obtain approval for any necessary change before generating live candidate noise.
4. For a later separately authorized Expo pilot, establish its actual compatible update mechanism and native release boundary; a production-named EAS profile is not proof of automatic publication, and this future work must not delay the website-only pilot.
5. Verify the generated handoff uses existing metadata and evidence links, without a new collector or fabricated review.

These are bounded implementation feasibility checks, not recurring owner chores. If maintained tooling cannot meet a requirement, stop at that specific gap and present the smallest alternative. Do not silently add machinery, relax the contract, or make the owner discover the deviation in a failed deployment email.

The initial proof and implementation must stop at the DoctorDerek.com pilot boundary. Do not make readiness contingent on resolving other repositories, changing their accounts/configuration, or completing portfolio-wide enrollment. Read-only shared-policy inspection and separately reviewed shared-policy hosting do not grant consumer mutation authority.

### PU.13.1 — Decisions and evidence still required

| Item                                                                                         | Classification                                                 | Closure                                                                                                                                                               |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weekly cadence, seven-day maturity, Node/pnpm scope, no recurring owner duty, and sole pilot | Approved direction                                             | Preserve in the reviewed implementation; do not reopen as generic questions.                                                                                          |
| Exact weekly overnight window and supported refresh/activity limits                          | Implementation-owned proposal                                  | Select supported settings within the approved cadence/timezone and show them in the implementation plan; no custom scheduler or counters.                             |
| Quarterly compatibility-boundary baseline                                                    | Approved retained prior policy                                 | Keep distinct from optional yearly human repair; changing the automatic cadence requires an explicit decision, not an inference.                                      |
| Provider-managed Node patch selection and seven-day enforceability                           | Demonstrated platform limit plus project-specific evidence gap | Record the actual control boundary and obtain scoped approval of the implementation's achievable runtime policy before enablement; no false exact-pin guarantee.      |
| Production refresh during a week with no repository change                                   | Release-policy decision pending bounded platform inspection    | Recommend the smallest existing-mechanism behavior and its build cost for approval; do not silently turn the requested fresh-release outcome into PR-only automation. |
| Actual notification isolation, app scope, merge events, and applicable checks                | Hosted proof requirements                                      | Inspect and verify the pilot paths with separately authorized mutations; documentation alone is insufficient.                                                         |
| Expo SDK/build/distribution integration                                                      | Deferred profile proof                                         | Retain its requirements, but do not block or expand the independent website pilot.                                                                                    |

## PU.14 — Change and publication discipline

Draft approval authorizes the contract, not a live app installation, account-setting change, bot merge, or native release. The next implementation plan names the exact files, permissions, validation, cutover, and genuinely cohesive commits. Follow repository issue/branch/PR governance and retain human review of those setup changes.

After finished-draft approval, publish the specification through a documentation PR in DoctorDerekCICD, linked to its issue. That PR enables no updater. Shared implementation, DoctorDerek.com enrollment, and live activation retain their separately scoped approvals. Setup and agent-authored repair PRs remain for human review and merge; no document approval grants an agent authority to merge them.

Subsequent amendments must distinguish a requirement change from an implementation correction. Do not rewrite this specification for ordinary package-version changes. Preserve version/date history and Git identity without a new tracking system or a second authoritative Google Doc. Use Dr. Derek Austin for public authorship and neutral owner/maintainer language; private rationale and transient checkpoints remain out of Git.

The later Agentic Helper amendment is a separately reviewed pointer and consistency correction: identify this canonical contract and shared implementation, preserve explicit opt-in and task scope, and remove conflicting maintenance wording such as treating a committed lockfile as an automatic update mechanism. Do not replace the general orchestrator, duplicate this specification, or paste executable workflows into the live document. Existing working CI/CD responsibilities remain intact.

Revision record: v0.1 established the draft on Oct. 7, 2026; v0.2 integrated the five approved self-review corrections and made DoctorDerek.com the sole independently completable pilot; v0.3, Oct. 24, 2026, adopts the approved public title/authorship, weekly routine cadence, Node/pnpm scope, explicit hosting-versus-enrollment boundaries, and runtime-release acceptance. These revisions describe the proposed capability, not proof that it is implemented or enabled.
