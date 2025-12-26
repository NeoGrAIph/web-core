**Title:** Fast Refresh

**URL:** https://nextjs.org/docs/architecture/fast-refresh

**Section:** Architecture

**Doc Path:** /docs/architecture/fast-refresh

**Summary:** Explains how Fast Refresh works in Next.js, when it preserves component state vs triggers full reloads, and how errors and Hooks behave during refresh.

**Key Sections:** How It Works, Error Resilience (Syntax Errors, Runtime Errors), Limitations, Tips, Fast Refresh and Hooks.

**Useful For:** Understanding live reload behavior, diagnosing unexpected reloads/state resets, and writing code that is resilient to refresh.

**Tags:** nextjs, architecture, fast-refresh, hmr, react, hooks, dev, error-handling

**Date Added:** 2025-12-26

**Last Reviewed:** 2025-12-26

**Notes:** Enabled by default since Next.js 9.4; shows how syntax errors disappear without reload, runtime errors show an overlay, and error boundaries retry on the next edit. Lists state reset cases (class components, non-component exports, HOC returning class, anonymous default exports) and the `// @refresh reset` directive. Last updated October 27, 2025.
