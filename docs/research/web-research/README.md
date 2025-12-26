# Web Research Registry

This folder contains research registries and site-level subfolders.

## Structure
- Each site gets its own subfolder (e.g. `docs/research/web-research/payloadcms.com/`).
- Each site subfolder contains `pages/` with one file per researched page.
- Each site subfolder contains a local `README.md` with a table of pages linking to page files.
- This file is the global registry of sites and pages.
- Tag definitions live in `docs/research/web-research/tags.md` and are shared by all entries.

## Page File Rules
- Each researched page must have its own file under `docs/research/web-research/<domain>/pages/`.
- File name (slug) is derived from Doc Path: drop leading `/docs/`, replace slashes with dashes, keep lowercase.
- The page file must follow the unified format listed below.

## Unified Page Research File Format (for page files)
**Title:**

**URL:**

**Section:**

**Doc Path:**

**Summary:**

**Key Sections:**

**Useful For:**

**Tags:**

**Date Added:**

**Last Reviewed:**

**Notes:**

## Site Registry (no URLs)
| Site | Description | Key Topics | Local README |
| --- | --- | --- | --- |
| payloadcms.com | Official Payload CMS documentation site. | payload, getting-started, configuration, database, installation, concepts | docs/research/web-research/payloadcms.com/README.md |
| nextjs.org | Official Next.js documentation site. | nextjs, cli, build, production | docs/research/web-research/nextjs.org/README.md |

## Page Registry (aggregated)
| Page Title | Site | Section | Summary | Tags | Page File | URL |
| --- | --- | --- | --- | --- | --- | --- |
| Payload Concepts | payloadcms.com | Getting Started | Overview of core Payload concepts: config, database adapters, collections/globals, fields, hooks, auth/access control, admin UI, and APIs. | payload, getting-started, concepts, config, database, collections, fields, api | docs/research/web-research/payloadcms.com/pages/getting-started-concepts.md | https://payloadcms.com/docs/getting-started/concepts |
| Installation | payloadcms.com | Getting Started | Installation requirements and setup paths: create-payload-app quickstart or adding to an existing Next.js app with required packages, DB adapters, plugin, and config. | payload, getting-started, installation, requirements, create-payload-app, nextjs, database-adapter, setup | docs/research/web-research/payloadcms.com/pages/getting-started-installation.md | https://payloadcms.com/docs/getting-started/installation |
| The Payload Config | payloadcms.com | Configuration | Central config overview: config options, TypeScript config, config location, telemetry, CORS, server vs client, compatibility flags, and bin scripts. | payload, configuration, config, typescript, cors, telemetry, server-client, scripts | docs/research/web-research/payloadcms.com/pages/configuration-overview.md | https://payloadcms.com/docs/configuration/overview |
| Collection Configs | payloadcms.com | Configuration | How collections define document schemas and generate local/REST/GraphQL APIs, plus collection-level options and admin features. | payload, configuration, collections, fields, access-control, hooks, admin-ui, graphql, typescript | docs/research/web-research/payloadcms.com/pages/configuration-collections.md | https://payloadcms.com/docs/configuration/collections |
| Global Configs | payloadcms.com | Configuration | Singleton content via globals: config structure, fields, access control, hooks, admin options, and API generation. | payload, configuration, globals, fields, access-control, hooks, admin-ui, graphql, typescript | docs/research/web-research/payloadcms.com/pages/configuration-globals.md | https://payloadcms.com/docs/configuration/globals |
| I18n | payloadcms.com | Configuration | Admin UI translations, adding languages, custom/project translations, language detection, and TypeScript/Node usage. | payload, configuration, i18n, admin-ui, translations, typescript | docs/research/web-research/payloadcms.com/pages/configuration-i18n.md | https://payloadcms.com/docs/configuration/i18n |
| Localization | payloadcms.com | Configuration | Content localization settings: locales, field localization, and retrieving localized documents. | payload, configuration, localization, locales, fields | docs/research/web-research/payloadcms.com/pages/configuration-localization.md | https://payloadcms.com/docs/configuration/localization |
| Environment Variables | payloadcms.com | Configuration | Environment variable usage for Next.js apps, client-side environments, and non-Next.js setups. | payload, configuration, environment-variables, nextjs, env | docs/research/web-research/payloadcms.com/pages/configuration-environment-vars.md | https://payloadcms.com/docs/configuration/environment-vars |
| Database Overview | payloadcms.com | Database | Database adapters overview and guidance for choosing between supported database types. | payload, database, database-adapter, postgres, mongodb, relational, non-relational | docs/research/web-research/payloadcms.com/pages/database-overview.md | https://payloadcms.com/docs/database/overview |
| Migrations | payloadcms.com | Database | Migration file structure and workflows for creating and running migrations, including production, transactional, and test guidance. | payload, database, migrations, transactions | docs/research/web-research/payloadcms.com/pages/database-migrations.md | https://payloadcms.com/docs/database/migrations |
| Transactions | payloadcms.com | Database | Transaction support and usage, including hook behavior, database support, and SQLite-specific notes. | payload, database, transactions, hooks, sqlite | docs/research/web-research/payloadcms.com/pages/database-transactions.md | https://payloadcms.com/docs/database/transactions |
| Indexes | payloadcms.com | Database | Index definitions at field and custom levels, text indexes, and notes on localized fields with MongoDB. | payload, database, indexes, fields, mongodb, localization | docs/research/web-research/payloadcms.com/pages/database-indexes.md | https://payloadcms.com/docs/database/indexes |
| Postgres | payloadcms.com | Database | Postgres adapter setup, env vars, configuration, Drizzle access, schema, and migrations. | payload, database, postgres, database-adapter, drizzle, migrations, environment-variables | docs/research/web-research/payloadcms.com/pages/database-postgres.md | https://payloadcms.com/docs/database/postgres |
| Troubleshooting | payloadcms.com | Troubleshooting | Common runtime/setup issues including dependency mismatches, monorepos, auth cookies, CORS/CSRF, and HMR over HTTPS. | payload, troubleshooting, dependencies, monorepo, auth, cookies, cors, csrf, hmr, websockets, environment-variables, nextjs, react, pnpm | docs/research/web-research/payloadcms.com/pages/troubleshooting-troubleshooting.md | https://payloadcms.com/docs/troubleshooting/troubleshooting |
| Plugins Overview | payloadcms.com | Plugins | How Payload plugins extend config and how to choose between official and community plugins. | payload, plugins, configuration, official-plugins, community | docs/research/web-research/payloadcms.com/pages/plugins-overview.md | https://payloadcms.com/docs/plugins/overview |
| Build Your Own Plugin | payloadcms.com | Plugins | How to build a custom plugin using the official template, test it, and publish to npm. | payload, plugins, plugin-development, plugin-template, npm, typescript | docs/research/web-research/payloadcms.com/pages/plugins-build-your-own.md | https://payloadcms.com/docs/plugins/build-your-own |
| Form Builder | payloadcms.com | Plugins | Official Form Builder plugin with configuration, fields, submissions, email, and payment workflows. | payload, plugins, form-builder, admin-ui, email, payments, typescript | docs/research/web-research/payloadcms.com/pages/plugins-form-builder.md | https://payloadcms.com/docs/plugins/form-builder |
| Import Export | payloadcms.com | Plugins | Import/Export plugin (beta) focused on export workflows with CSV/JSON formats and job processing. | payload, plugins, import-export, csv, json, jobs-queue, beta, admin-ui | docs/research/web-research/payloadcms.com/pages/plugins-import-export.md | https://payloadcms.com/docs/plugins/import-export |
| next build options (Pages Router) | nextjs.org | CLI | CLI flags for `next build`, including Turbopack/Webpack switches, debug/profiling, and experimental build modes. | nextjs, cli, build, profiling, linting, debug, turbopack, webpack, mangling, app-router, experimental, prerender | docs/research/web-research/nextjs.org/pages/pages-api-reference-cli-next-next-build-options.md | https://nextjs.org/docs/pages/api-reference/cli/next#next-build-options |
| Deploying (Pages Router) | nextjs.org | Getting Started | Deployment options for Pages Router: Node.js server, Docker, static export, and platform adapters with feature support notes. | nextjs, deployment, hosting, nodejs, docker, static-export, adapters, pages-router | docs/research/web-research/nextjs.org/pages/pages-getting-started-deploying.md | https://nextjs.org/docs/pages/getting-started/deploying |
| Deploying: Node.js server (Pages Router) | nextjs.org | Getting Started | Node.js server deployment details, including build/start scripts, full feature support, and custom server option. | nextjs, deployment, hosting, nodejs, pages-router, build, custom-server, templates | docs/research/web-research/nextjs.org/pages/pages-getting-started-deploying-nodejs-server.md | https://nextjs.org/docs/pages/getting-started/deploying#nodejs-server |
| Local Development (App Router) | nextjs.org | Guides | Local dev performance guide: differences vs production and diagnostics for faster builds and HMR. | nextjs, local-development, performance, dev, turbopack, webpack, tailwind, memory, server-components, hmr, docker, logging, tracing | docs/research/web-research/nextjs.org/pages/app-guides-local-development.md | https://nextjs.org/docs/app/guides/local-development |
| next CLI (App Router) | nextjs.org | API Reference | App Router CLI reference covering commands, global options, and flags for dev/build/start/info/telemetry/typegen/upgrade. | nextjs, cli, app-router, dev, build, start, telemetry, typegen, info, upgrade, experimental, debug, https, analysis | docs/research/web-research/nextjs.org/pages/app-api-reference-cli-next.md | https://nextjs.org/docs/app/api-reference/cli/next |
| instrumentation.js (Pages Router) | nextjs.org | API Reference | instrumentation file convention with register/onRequestError hooks and runtime targeting. | nextjs, pages-router, instrumentation, observability, monitoring, logging, error-handling, runtime | docs/research/web-research/nextjs.org/pages/pages-api-reference-file-conventions-instrumentation.md | https://nextjs.org/docs/pages/api-reference/file-conventions/instrumentation |
| proxy.js (Pages Router) | nextjs.org | API Reference | proxy file convention (renamed from middleware) for request interception, rewrites, redirects, and headers. | nextjs, pages-router, proxy, middleware, routing, headers, cookies, redirects, rewrites, cors, runtime, migration | docs/research/web-research/nextjs.org/pages/pages-api-reference-file-conventions-proxy.md | https://nextjs.org/docs/pages/api-reference/file-conventions/proxy |
| public Folder (Pages Router) | nextjs.org | API Reference | public folder for static assets with default caching and name conflict rules. | nextjs, pages-router, public-folder, static-assets, caching, headers, robots, favicon | docs/research/web-research/nextjs.org/pages/pages-api-reference-file-conventions-public-folder.md | https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder |
| src Directory (Pages Router) | nextjs.org | API Reference | src folder convention for placing pages/app while keeping config and public at root. | nextjs, pages-router, src-folder, project-structure, public-folder, config, env, tailwind, proxy | docs/research/web-research/nextjs.org/pages/pages-api-reference-file-conventions-src-folder.md | https://nextjs.org/docs/pages/api-reference/file-conventions/src-folder |
| Fast Refresh | nextjs.org | Architecture | How Fast Refresh preserves state vs triggers full reloads, and how errors and Hooks behave. | nextjs, architecture, fast-refresh, hmr, react, hooks, dev, error-handling | docs/research/web-research/nextjs.org/pages/architecture-fast-refresh.md | https://nextjs.org/docs/architecture/fast-refresh |
| Building without a DB connection | payloadcms.com | Production | Next.js SSG build without a DB connection using experimental build flags or opting out of SSG. | payload, production, nextjs, ssg, build, docker, environment-variables | docs/research/web-research/payloadcms.com/pages/production-building-without-a-db-connection.md | https://payloadcms.com/docs/production/building-without-a-db-connection |
| Deployment | payloadcms.com | Production | Deployment guidance for Payload apps: env vars, production DB, build/start steps, and deployment considerations. | payload, production, deployment, environment-variables, database, nextjs, build, hosting | docs/research/web-research/payloadcms.com/pages/production-deployment.md | https://payloadcms.com/docs/production/deployment |
