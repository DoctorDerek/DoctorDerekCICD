# DoctorDerekCICD

[![Shared Helper Checks](https://github.com/DoctorDerek/DoctorDerekCICD/actions/workflows/verify.yml/badge.svg?branch=main)](https://github.com/DoctorDerek/DoctorDerekCICD/actions/workflows/verify.yml)
[![Codecov](https://codecov.io/gh/DoctorDerek/DoctorDerekCICD/branch/main/graph/badge.svg)](https://app.codecov.io/gh/DoctorDerek/DoctorDerekCICD)

Shared GitHub Actions workflows for TypeScript projects built with Next.js or Next.js + Expo.

I built this to keep testing and performance reporting consistent across my portfolio without maintaining separate implementations in every repository. Each application keeps its tests, configuration, and platform-compatible dependencies. Small caller workflows select the commands, report paths, and production URL.

## What it runs

- ESLint reporting and strict TypeScript checks.
- Vitest application coverage with Codecov, plus native Jest coverage where the application has native tests.
- Playwright browser tests against successful Vercel Preview deployments, with reports and PR summaries.
- XState v5 state-machine diff visualizations in pull requests.
- Production mobile Lighthouse measurements: five runs, with the median-Performance report published through GitHub Pages.

Test failures remain failures while available reports are retained for debugging. Application coverage stays with the application; this repository tests its shared XState and Lighthouse helpers separately.

## How it fits together

Three reusable workflows own the implementation. Each consumer pins a reviewed commit SHA, so shared changes reach an application through an explicit revision update.

See the complete caller examples for [Next.js](examples/nextjs/) and [Next.js + Expo](examples/nextjs-expo/), or read [USAGE.md](USAGE.md) for configuration and maintenance.

[DoctorDerek.com](https://www.doctorderek.com/) uses these three caller workflows:

- [eslint-vitest-xstate.yml](https://github.com/DoctorDerek/DoctorDerek.com/blob/main/.github/workflows/eslint-vitest-xstate.yml)
- [playwright.yml](https://github.com/DoctorDerek/DoctorDerek.com/blob/main/.github/workflows/playwright.yml)
- [lighthouse.yml](https://github.com/DoctorDerek/DoctorDerek.com/blob/main/.github/workflows/lighthouse.yml)

Built by [Dr. Derek Austin](https://www.doctorderek.com/).

## License

Copyright (c) 2026 Dr. Derek Austin, all rights reserved. See [LICENSE.txt](LICENSE.txt).
