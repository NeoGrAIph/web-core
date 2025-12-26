**Title:** next build options (Pages Router)

**URL:** https://nextjs.org/docs/pages/api-reference/cli/next#next-build-options

**Section:** CLI

**Doc Path:** /docs/pages/api-reference/cli/next#next-build-options

**Summary:** Lists the command-line options for `next build`, including Turbopack/Webpack switches, debug and profiling flags, linting control, and experimental build modes.

**Key Sections:** -h/--help, [directory], --turbopack/--turbo, --webpack, -d/--debug, --profile, --no-lint, --no-mangling, --experimental-app-only, --experimental-build-mode, --debug-prerender, --debug-build-paths.

**Useful For:** Controlling build behavior in CI/CD, diagnosing build issues, and profiling/optimizing builds.

**Tags:** nextjs, cli, build, profiling, linting, debug, turbopack, webpack, mangling, app-router, experimental, prerender

**Date Added:** 2025-12-26

**Last Reviewed:** 2025-12-26

**Notes:** `--no-lint` will be removed from `next build` in Next 16; with Next 15.5+ non-eslint linters do not run during build. `--debug-prerender` is for development-only debugging.
