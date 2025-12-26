**Title:** proxy.js (Pages Router)

**URL:** https://nextjs.org/docs/pages/api-reference/file-conventions/proxy

**Section:** API Reference

**Doc Path:** /docs/pages/api-reference/file-conventions/proxy

**Summary:** Defines `proxy.js|ts` (renamed from middleware) to run code before requests complete, enabling redirects, rewrites, header changes, or custom responses.

**Key Sections:** Exports (proxy function), Config (matcher), Params (request/NextResponse), Execution order, Runtime, Advanced flags, Examples, CORS, Migration to Proxy, Version history.

**Useful For:** Implementing auth, logging, redirects/rewrites, and request/response manipulation before rendering.

**Tags:** nextjs, pages-router, proxy, middleware, routing, headers, cookies, redirects, rewrites, cors, runtime, migration

**Date Added:** 2025-12-26

**Last Reviewed:** 2025-12-26

**Notes:** `middleware` is deprecated and renamed to `proxy`; file sits at project root (or `src`) and should align with pageExtensions. Last updated October 17, 2025.
