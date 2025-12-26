**Title:** Troubleshooting

**URL:** https://payloadcms.com/docs/troubleshooting/troubleshooting

**Section:** Troubleshooting

**Doc Path:** /docs/troubleshooting/troubleshooting

**Summary:** Covers common runtime and setup issues such as dependency version mismatches (including React/React DOM), monorepo/Next.js version skew, auth cookie problems (CORS/CSRF), and HMR over HTTPS, with checks and fixes.

**Key Sections:** Dependency mismatches, Confirm whether duplicates exist, If no duplicates are found, Fixing dependency issues, If the error persists, Monorepos, Unauthorized login request, Using --experimental-https.

**Useful For:** Diagnosing build/runtime errors, dependency duplication, auth login failures, and development HMR issues.

**Tags:** payload, troubleshooting, dependencies, monorepo, auth, cookies, cors, csrf, hmr, websockets, environment-variables, nextjs, react, pnpm

**Date Added:** 2025-12-26

**Last Reviewed:** 2025-12-26

**Notes:** Emphasizes version pinning, duplicate detection (pnpm or manual), @payloadcms/ui import rules, yarn 1.x not supported, and fixes like pnpm store prune/dedupe, Syncpack, or temporary Webpack aliases; also covers CORS/CSRF/cookie checks with Set-Cookie inspection and USE_HTTPS/PAYLOAD_HMR_URL_OVERRIDE for HMR over HTTPS.
