**Title:** instrumentation.js (Pages Router)

**URL:** https://nextjs.org/docs/pages/api-reference/file-conventions/instrumentation

**Section:** API Reference

**Doc Path:** /docs/pages/api-reference/file-conventions/instrumentation

**Summary:** Defines the `instrumentation.js|ts` file for observability hooks, including optional `register` and `onRequestError` exports and runtime targeting.

**Key Sections:** Exports (register, onRequestError), Parameters, Specifying the runtime, Version History.

**Useful For:** Integrating monitoring/telemetry, capturing request errors, and routing instrumentation by runtime.

**Tags:** nextjs, pages-router, instrumentation, observability, monitoring, logging, error-handling, runtime

**Date Added:** 2025-12-26

**Last Reviewed:** 2025-12-26

**Notes:** File lives at project root (or `src`); `register` runs once per server instance and `onRequestError` receives request/context data. Last updated April 15, 2025.
