**Title:** next CLI (App Router)

**URL:** https://nextjs.org/docs/app/api-reference/cli/next

**Section:** API Reference

**Doc Path:** /docs/app/api-reference/cli/next

**Summary:** App Router CLI reference for `next`, listing core commands (dev, build, start, info, telemetry, typegen, upgrade, experimental-analyze) with command-specific options and debugging helpers.

**Key Sections:** Basic usage, Options, Commands, next dev options, next build options, next start options, next info options, next telemetry options, next typegen options, next upgrade options, next experimental-analyze options, Debugging prerender errors, Building specific routes, Changing the default port, Using HTTPS during development, Configuring a timeout for downstream proxies, Passing Node.js arguments.

**Useful For:** Running dev/build/start workflows, controlling CLI flags in CI, generating route types, debugging builds, and managing telemetry.

**Tags:** nextjs, cli, app-router, dev, build, start, telemetry, typegen, info, upgrade, experimental, debug, https, analysis

**Date Added:** 2025-12-26

**Last Reviewed:** 2025-12-26

**Notes:** `next` is an alias for `next dev`. Includes flags like `--debug-prerender`/`--debug-build-paths`, `--experimental-build-mode`, HTTPS dev flags, and `next typegen` guidance for CI type checks; `next start` supports `--keepAliveTimeout` for proxy keep-alive tuning. `--no-lint` is slated for removal from `next build` in Next 16. `next experimental-analyze` uses Turbopack, produces no build artifacts, and supports `--output`; page updated Dec 19, 2025.
