# Прогресс: обработка Payload Website template

Этот файл — **детальный журнал** по каждому файлу/папке из `upstream-payload-website.tree.json`.
Структура upstream остаётся неизменной; здесь фиксируем решения, статус и назначение.

## Легенда решений
- `shared` — вынос в shared‑пакеты (`packages/*`)
- `app` — остаётся в app‑коде
- `admin` — админ‑слой (`@/admin-ui/*` или shared‑admin‑пакеты)
- `ignore` — не переносим / не используем

## Легенда статусов
- `pending` — не начинали
- `in_progress` — в работе
- `done` — завершено
- `blocked` — есть блокер/зависимость

## Журнал (по разделам)

Каждый файл описывается отдельным подразделом в формате:

### `<path>`
- **Group:** ...
- **Status:** pending | in_progress | done | blocked
- **Decision:** shared | app | admin | ignore
- **Destination:** ...
- **Date:** YYYY-MM-DD
- **Owner:** ...
- **Source Path:** ...
- **Checked in payload-dev:** yes | no | n/a
- **Promoted to payload-core/prod:** yes | no | n/a
- **Notes:** ...
- **Dependencies / Blockers:** ...

### `packages/next-config` (module)
- **Group:** infra/config
- **Status:** done
- **Decision:** shared
- **Destination:** packages/next-config
- **Date:** 2025-12-21
- **Owner:** codex
- **Source Path:** old_packages/next-config/README.md
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Пакет перенесён: `index.js`, `package.json`, README (инфраструктура закрыта).
- **Dependencies / Blockers:** Next.js, @payloadcms/next

### `packages/eslint-config` (module)
- **Group:** infra/config
- **Status:** done
- **Decision:** shared
- **Destination:** packages/eslint-config
- **Date:** 2025-12-21
- **Owner:** codex
- **Source Path:** old_packages/eslint-config/README.md
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Пакет перенесён: `index.js`, `package.json`, README (инфраструктура закрыта).
- **Dependencies / Blockers:** eslint, eslint-config-next

### `packages/typescript-config` (module)
- **Group:** infra/config
- **Status:** done
- **Decision:** shared
- **Destination:** packages/typescript-config
- **Date:** 2025-12-21
- **Owner:** codex
- **Source Path:** old_packages/typescript-config/README.md
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Пакет перенесён: `base.json`, `nextjs.json`, `package.json`, README (инфраструктура закрыта).
- **Dependencies / Blockers:** TypeScript

### `packages/plugins` (module)
- **Group:** plugins
- **Status:** pending
- **Decision:** shared
- **Destination:** packages/plugins
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** old_packages/plugins/README.md
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Общая зона для внутренних Payload plugins.
- **Dependencies / Blockers:** Payload plugins contracts

### `packages/cms-ecommerce` (module)
- **Group:** cms/schema
- **Status:** pending
- **Decision:** shared
- **Destination:** packages/cms-ecommerce
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** old_packages/cms-ecommerce/README.md
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Опциональный модуль, переносить при старте ecommerce.
- **Dependencies / Blockers:** ecommerce template decisions

### `.editorconfig`
- **Group:** infra/config
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (используем корневые конфиги монорепы)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.editorconfig
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Общий .editorconfig берём из корня monorepo; шаблонный файл не переносим.
- **Dependencies / Blockers:** -

### `.env.example`
- **Group:** infra/env
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/.env.example (адаптировать под env‑контракт)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.env.example
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Содержит Mongo/PG пример; в web-core используем Postgres и правила из runbook-env-contract.
- **Dependencies / Blockers:** runbook-env-contract.md

### `.gitignore`
- **Group:** infra/config
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (корневой .gitignore)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.gitignore
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Используем корневой .gitignore monorepo.
- **Dependencies / Blockers:** -

### `.npmrc`
- **Group:** infra/config
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (настройки pnpm в корне)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.npmrc
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Настройки для standalone template; в monorepo действует корневой .npmrc.
- **Dependencies / Blockers:** -

### `.prettierignore`
- **Group:** infra/config
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (корневой prettier config)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.prettierignore
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Используем корневые настройки форматирования monorepo.
- **Dependencies / Blockers:** -

### `.prettierrc.json`
- **Group:** infra/config
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (корневой prettier config)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.prettierrc.json
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Используем корневые настройки форматирования monorepo.
- **Dependencies / Blockers:** -

### `.vscode/extensions.json`
- **Group:** infra/devx
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.vscode/extensions.json
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** VSCode рекомендации не переносим в monorepo.
- **Dependencies / Blockers:** -

### `.vscode/launch.json`
- **Group:** infra/devx
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.vscode/launch.json
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** VSCode launch config не переносим в monorepo.
- **Dependencies / Blockers:** -

### `.vscode/settings.json`
- **Group:** infra/devx
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/.vscode/settings.json
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** VSCode settings не переносим в monorepo.
- **Dependencies / Blockers:** -

### `Dockerfile`
- **Group:** infra/docker
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (используем web-core Docker/CI/GitOps)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/Dockerfile
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Шаблонный Dockerfile для standalone; в web-core используются другие образы/пайплайн.
- **Dependencies / Blockers:** -

### `README.md`
- **Group:** docs
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (документация web-core отдельно)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/README.md
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Используем как справку по функциональности шаблона, в код не переносим.
- **Dependencies / Blockers:** -

### `components.json`
- **Group:** infra/ui
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/components.json
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Shadcn config для standalone; в web-core UI‑слой выстраиваем через packages/ui.
- **Dependencies / Blockers:** -

### `docker-compose.yml`
- **Group:** infra/dev
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/docker-compose.yml
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Локальный docker-compose для шаблона; не используем в web-core.
- **Dependencies / Blockers:** -

### `eslint.config.mjs`
- **Group:** infra/lint
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/eslint.config.mjs (через shared eslint-config)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/eslint.config.mjs
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Правила базовые; в web-core используем packages/eslint-config и общую конфигурацию.
- **Dependencies / Blockers:** packages/eslint-config

### `next-env.d.ts`
- **Group:** infra/ts
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/next-env.d.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/next-env.d.ts
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Типовой файл Next.js, переносим как есть.
- **Dependencies / Blockers:** -

### `next-sitemap.config.cjs`
- **Group:** infra/seo
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/next-sitemap.config.cjs
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/next-sitemap.config.cjs
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Нужна адаптация под домены и правила web-core; использовать NEXT_PUBLIC_SERVER_URL из env‑контракта.
- **Dependencies / Blockers:** runbook-env-contract.md

### `next.config.js`
- **Group:** infra/next
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/next.config.mjs (через @synestra/next-config)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/next.config.js
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Содержит withPayload, extensionAlias и redirects; переносить через shared next-config.
- **Dependencies / Blockers:** packages/next-config

### `package.json`
- **Group:** infra/package
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/package.json (workspace)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/package.json
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Использовать как референс зависимостей; в web-core зависимости оформлены как workspace-пакеты и требуют обновления engines (node>=22, pnpm@10).
- **Dependencies / Blockers:** root/package.json

### `playwright.config.ts`
- **Group:** tests/e2e
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/playwright.config.ts (если сохраняем e2e)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/playwright.config.ts
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Шаблонный e2e конфиг; согласовать с web-core test-пайплайном.
- **Dependencies / Blockers:** tests strategy

### `pnpm-lock.yaml`
- **Group:** infra/package
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a (используем корневой pnpm-lock.yaml)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/pnpm-lock.yaml
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Локальный lockfile шаблона не переносим.
- **Dependencies / Blockers:** -

### `postcss.config.js`
- **Group:** infra/css
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/postcss.config.js
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/postcss.config.js
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Tailwind + autoprefixer; сохранить для app, если Tailwind используется.
- **Dependencies / Blockers:** tailwind config

### `public/favicon.ico`
- **Group:** assets/public
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/public/favicon.ico
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/public/favicon.ico
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Базовый favicon шаблона; можно заменить на брендовый.
- **Dependencies / Blockers:** -

### `public/favicon.svg`
- **Group:** assets/public
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/public/favicon.svg
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/public/favicon.svg
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Векторный favicon; можно заменить на брендовый.
- **Dependencies / Blockers:** -

### `public/website-template-OG.webp`
- **Group:** assets/public
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/public/website-template-OG.webp
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/public/website-template-OG.webp
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** OG‑картинка шаблона; заменить на брендовый ассет.
- **Dependencies / Blockers:** -

### `redirects.js`
- **Group:** infra/next
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/redirects.js
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/redirects.js
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Содержит IE redirect; решить необходимость и перенести в app при необходимости.
- **Dependencies / Blockers:** next.config

### `src/Footer/Component.tsx`
- **Group:** layout/footer
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/Footer/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Footer/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Footer renderer; зависит от ThemeSelector и CMSLink.
- **Dependencies / Blockers:** ThemeSelector, getGlobals, CMSLink

### `src/Footer/RowLabel.tsx`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/Footer/RowLabel.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Footer/RowLabel.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** RowLabel для admin UI (Footer nav items).
- **Dependencies / Blockers:** admin import map

### `src/Footer/config.ts`
- **Group:** cms/globals
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/globals/Footer.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Footer/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Глобал Footer; зависит от cms-fields/link и revalidate hook.
- **Dependencies / Blockers:** cms-fields/link, revalidateFooter

### `src/Footer/hooks/revalidateFooter.ts`
- **Group:** cms/hooks
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/Footer/hooks/revalidateFooter.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Footer/hooks/revalidateFooter.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Next revalidateTag('global_footer'); app‑локально.
- **Dependencies / Blockers:** next/cache

### `src/Header/Component.client.tsx`
- **Group:** layout/header
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/Header/Component.client.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Header/Component.client.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Client header с theme и nav.
- **Dependencies / Blockers:** HeaderTheme, Logo, CMSLink

### `src/Header/Component.tsx`
- **Group:** layout/header
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/Header/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Header/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Серверный Header, берёт global header.
- **Dependencies / Blockers:** getGlobals

### `src/Header/Nav/index.tsx`
- **Group:** layout/header
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/Header/Nav/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Header/Nav/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Навигация header; app‑локально.
- **Dependencies / Blockers:** CMSLink, search icon

### `src/Header/RowLabel.tsx`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/Header/RowLabel.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Header/RowLabel.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** RowLabel для admin UI (Header nav items).
- **Dependencies / Blockers:** admin import map

### `src/Header/config.ts`
- **Group:** cms/globals
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/globals/Header.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Header/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Глобал Header; зависит от cms-fields/link и revalidate hook.
- **Dependencies / Blockers:** cms-fields/link, revalidateHeader

### `src/Header/hooks/revalidateHeader.ts`
- **Group:** cms/hooks
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/Header/hooks/revalidateHeader.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/Header/hooks/revalidateHeader.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Next revalidateTag('global_header'); app‑локально.
- **Dependencies / Blockers:** next/cache

### `src/access/anyone.ts`
- **Group:** cms/access
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/access/anyone.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/access/anyone.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный access helper, без зависимостей от app.
- **Dependencies / Blockers:** -

### `src/access/authenticated.ts`
- **Group:** cms/access
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/access/authenticated.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/access/authenticated.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный access helper; убрать импорт app‑типа User (использовать payload AccessArgs без app‑types).
- **Dependencies / Blockers:** payload types refactor

### `src/access/authenticatedOrPublished.ts`
- **Group:** cms/access
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/access/authenticatedOrPublished.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/access/authenticatedOrPublished.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный access helper; оставить как есть.
- **Dependencies / Blockers:** -

### `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`
- **Group:** routes/sitemaps
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Sitemap для pages; зависит от env NEXT_PUBLIC_SERVER_URL.
- **Dependencies / Blockers:** env contract, next-sitemap

### `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts`
- **Group:** routes/sitemaps
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Sitemap для posts; зависит от env NEXT_PUBLIC_SERVER_URL.
- **Dependencies / Blockers:** env contract, next-sitemap

### `src/app/(frontend)/[slug]/page.client.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/[slug]/page.client.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/[slug]/page.client.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Клиентская логика header theme.
- **Dependencies / Blockers:** HeaderTheme provider

### `src/app/(frontend)/[slug]/page.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/[slug]/page.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/[slug]/page.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Основной page renderer; зависит от blocks/hero/seed/redirects.
- **Dependencies / Blockers:** blocks registry, heroes, payload seed

### `src/app/(frontend)/globals.css`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/globals.css
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/globals.css
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Tailwind globals + CSS vars; адаптировать к tokens `--syn-ui-*`.
- **Dependencies / Blockers:** ui-layer tokens

### `src/app/(frontend)/layout.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/layout.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/layout.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Root layout, подключает AdminBar/Header/Footer/Providers.
- **Dependencies / Blockers:** providers, admin bar, header/footer

### `src/app/(frontend)/next/exit-preview/route.ts`
- **Group:** routes/preview
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/next/exit-preview/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/next/exit-preview/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Выключение draft mode.
- **Dependencies / Blockers:** draftMode

### `src/app/(frontend)/next/preview/route.ts`
- **Group:** routes/preview
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/next/preview/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/next/preview/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Preview‑endpoint; требует auth + PREVIEW_SECRET.
- **Dependencies / Blockers:** PREVIEW_SECRET, payload auth

### `src/app/(frontend)/next/seed/route.ts`
- **Group:** routes/seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/next/seed/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/next/seed/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed endpoint; должен требовать SEED_KEY в stage/prod.
- **Dependencies / Blockers:** runbook-payload-seeding.md, SEED_KEY

### `src/app/(frontend)/not-found.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/not-found.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/not-found.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** 404 страница; зависит от UI Button.
- **Dependencies / Blockers:** UI button

### `src/app/(frontend)/page.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/page.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/page.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Прокси на [slug]; оставить.
- **Dependencies / Blockers:** -

### `src/app/(frontend)/posts/[slug]/page.client.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/posts/[slug]/page.client.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/posts/[slug]/page.client.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Клиентская логика header theme.
- **Dependencies / Blockers:** HeaderTheme provider

### `src/app/(frontend)/posts/[slug]/page.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/posts/[slug]/page.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/posts/[slug]/page.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендер поста; зависит от PostHero, RichText, RelatedPosts.
- **Dependencies / Blockers:** posts collection, heroes

### `src/app/(frontend)/posts/page.client.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/posts/page.client.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/posts/page.client.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Клиентская логика header theme.
- **Dependencies / Blockers:** HeaderTheme provider

### `src/app/(frontend)/posts/page.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/posts/page.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/posts/page.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Листинг постов; зависит от Pagination, PageRange.
- **Dependencies / Blockers:** posts collection

### `src/app/(frontend)/posts/page/[pageNumber]/page.client.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/posts/page/[pageNumber]/page.client.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/posts/page/[pageNumber]/page.client.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Клиентская логика header theme.
- **Dependencies / Blockers:** HeaderTheme provider

### `src/app/(frontend)/posts/page/[pageNumber]/page.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/posts/page/[pageNumber]/page.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/posts/page/[pageNumber]/page.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Пагинация постов; зависит от posts collection.
- **Dependencies / Blockers:** posts collection

### `src/app/(frontend)/search/page.client.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/search/page.client.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/search/page.client.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Клиентская логика header theme.
- **Dependencies / Blockers:** HeaderTheme provider

### `src/app/(frontend)/search/page.tsx`
- **Group:** routes/frontend
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(frontend)/search/page.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(frontend)/search/page.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Поиск по коллекции search; зависит от plugin-search.
- **Dependencies / Blockers:** plugin-search

### `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/admin/[[...segments]]/not-found.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/admin/[[...segments]]/not-found.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Сгенерированный Payload файл; обновляется через payload generate.
- **Dependencies / Blockers:** payload generate

### `src/app/(payload)/admin/[[...segments]]/page.tsx`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/admin/[[...segments]]/page.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/admin/[[...segments]]/page.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Сгенерированный Payload файл; обновляется через payload generate.
- **Dependencies / Blockers:** payload generate

### `src/app/(payload)/admin/importMap.js`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/admin/importMap.js
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/admin/importMap.js
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Генерируется командой payload generate:importmap; не редактировать вручную.
- **Dependencies / Blockers:** payload generate:importmap

### `src/app/(payload)/api/[...slug]/route.ts`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/api/[...slug]/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/api/[...slug]/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Сгенерированный REST handler; обновляется через payload generate.
- **Dependencies / Blockers:** payload generate

### `src/app/(payload)/api/graphql-playground/route.ts`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/api/graphql-playground/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/api/graphql-playground/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Сгенерированный GraphQL playground handler; обновляется через payload generate.
- **Dependencies / Blockers:** payload generate

### `src/app/(payload)/api/graphql/route.ts`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/api/graphql/route.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/api/graphql/route.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Сгенерированный GraphQL handler; обновляется через payload generate.
- **Dependencies / Blockers:** payload generate

### `src/app/(payload)/custom.scss`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/custom.scss
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/custom.scss
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Доп. стили Payload Admin; пока пусто.
- **Dependencies / Blockers:** admin theming

### `src/app/(payload)/layout.tsx`
- **Group:** routes/payload
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/app/(payload)/layout.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/app/(payload)/layout.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Root layout Payload Admin; сгенерированный файл.
- **Dependencies / Blockers:** payload generate

### `src/blocks/ArchiveBlock/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/ArchiveBlock/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/ArchiveBlock/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендерер зависит от маршрутов/коллекции posts и app‑компонентов.
- **Dependencies / Blockers:** CollectionArchive, RichText, posts collection

### `src/blocks/ArchiveBlock/config.ts`
- **Group:** blocks/schema
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/ArchiveBlock/config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/ArchiveBlock/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Domain‑специфичный archive блок (posts/categories); оставить app.
- **Dependencies / Blockers:** categories/posts collections

### `src/blocks/Banner/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Banner/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Banner/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендерер banner; оставить app (тема/классы).
- **Dependencies / Blockers:** RichText, UI tokens

### `src/blocks/Banner/config.ts`
- **Group:** blocks/schema
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-blocks/src/blocks/Banner/config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Banner/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный блок banner; кандидат на shared.
- **Dependencies / Blockers:** richtext-lexical

### `src/blocks/CallToAction/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/CallToAction/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/CallToAction/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендерер CTA, зависит от CMSLink и RichText.
- **Dependencies / Blockers:** link fields, RichText, CMSLink

### `src/blocks/CallToAction/config.ts`
- **Group:** blocks/schema
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-blocks/src/blocks/CallToAction/config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/CallToAction/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный CTA блок; зависит от cms-fields/linkGroup.
- **Dependencies / Blockers:** packages/cms-fields/linkGroup

### `src/blocks/Code/Component.client.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Code/Component.client.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Code/Component.client.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Client‑часть code block (копировать/хайлайт); оставляем app.
- **Dependencies / Blockers:** CopyButton, prism-react-renderer

### `src/blocks/Code/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Code/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Code/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Server‑часть code block; оставляем app.
- **Dependencies / Blockers:** client component boundary

### `src/blocks/Code/CopyButton.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Code/CopyButton.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Code/CopyButton.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑кнопка копирования, остаётся в app (тема/стили).
- **Dependencies / Blockers:** -

### `src/blocks/Code/config.ts`
- **Group:** blocks/schema
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-blocks/src/blocks/Code/config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Code/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный code блок; кандидат shared.
- **Dependencies / Blockers:** -

### `src/blocks/Content/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Content/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Content/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендерер content блока; зависит от RichText и CMSLink.
- **Dependencies / Blockers:** cms-fields/link, RichText, CMSLink

### `src/blocks/Content/config.ts`
- **Group:** blocks/schema
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-blocks/src/blocks/Content/config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Content/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный content блок; зависит от cms-fields/link.
- **Dependencies / Blockers:** packages/cms-fields/link

### `src/blocks/Form/Checkbox/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Checkbox/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Checkbox/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы; зависит от UI слоя и формы.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендерер form block; доменно и UI‑специфичен.
- **Dependencies / Blockers:** form plugin, form fields

### `src/blocks/Form/Country/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Country/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Country/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы (страны); доменно.
- **Dependencies / Blockers:** Country/options

### `src/blocks/Form/Country/options.ts`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Country/options.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Country/options.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Список стран; оставить локально.
- **Dependencies / Blockers:** -

### `src/blocks/Form/Email/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Email/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Email/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы; доменно.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/Error/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Error/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Error/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑компонент ошибки формы; локально.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/Message/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Message/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Message/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы (message); локально.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/Number/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Number/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Number/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы; локально.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/Select/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Select/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Select/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы; локально.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/State/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/State/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/State/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы (штаты); локально.
- **Dependencies / Blockers:** State/options

### `src/blocks/Form/State/options.ts`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/State/options.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/State/options.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Список штатов; локально.
- **Dependencies / Blockers:** -

### `src/blocks/Form/Text/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Text/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Text/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы; локально.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/Textarea/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Textarea/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Textarea/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы; локально.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/Width/index.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/Width/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/Width/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑поле формы (width); локально.
- **Dependencies / Blockers:** form block

### `src/blocks/Form/config.ts`
- **Group:** blocks/schema
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Form block зависит от forms collection (plugin); доменно.
- **Dependencies / Blockers:** plugin-form-builder

### `src/blocks/Form/fields.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/Form/fields.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/Form/fields.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Сопоставление полей form builder; локально.
- **Dependencies / Blockers:** form block

### `src/blocks/MediaBlock/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/MediaBlock/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/MediaBlock/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендерер media block; зависит от Media компонент.
- **Dependencies / Blockers:** Media component

### `src/blocks/MediaBlock/config.ts`
- **Group:** blocks/schema
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-blocks/src/blocks/MediaBlock/config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/MediaBlock/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный mediaBlock.
- **Dependencies / Blockers:** media collection

### `src/blocks/RelatedPosts/Component.tsx`
- **Group:** blocks/renderers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/RelatedPosts/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/RelatedPosts/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Рендерер related posts; доменно и UI‑специфично.
- **Dependencies / Blockers:** Card, RichText, Post type

### `src/blocks/RenderBlocks.tsx`
- **Group:** blocks/registry
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/blocks/RenderBlocks.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/blocks/RenderBlocks.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** App‑локальный registry; позже заменить на общий renderer + registry mapping.
- **Dependencies / Blockers:** blocks renderer strategy

### `src/collections/Categories.ts`
- **Group:** cms/collections
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/collections/Categories.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Categories.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Базовая taxonomy коллекция, зависит от access helpers и slugField; подходит для shared.
- **Dependencies / Blockers:** access helpers, slugField

### `src/collections/Media.ts`
- **Group:** cms/collections
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/collections/Media.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Media.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Общая media‑коллекция; зависит от access helpers и локального пути uploads (public/media).
- **Dependencies / Blockers:** access helpers, media storage strategy

### `src/collections/Pages/hooks/revalidatePage.ts`
- **Group:** cms/hooks
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/collections/Pages/hooks/revalidatePage.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Pages/hooks/revalidatePage.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Жёстко привязан к маршрутам и Next revalidate; оставляем app‑локально.
- **Dependencies / Blockers:** Next.js revalidate path

### `src/collections/Pages/index.ts`
- **Group:** cms/collections
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/collections/Pages/index.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Pages/index.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Зависит от блоков, hero, SEO и app‑утилит; оставить в app, часть схем можно вынести в cms-blocks/cms-fields.
- **Dependencies / Blockers:** blocks registry, hero config, seo plugin fields

### `src/collections/Posts/hooks/populateAuthors.ts`
- **Group:** cms/hooks
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/collections/Posts/hooks/populateAuthors.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Posts/hooks/populateAuthors.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Использует payload-types; зависит от модели Users и access‑политики, оставить в app.
- **Dependencies / Blockers:** payload-types, Users collection

### `src/collections/Posts/hooks/revalidatePost.ts`
- **Group:** cms/hooks
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/collections/Posts/hooks/revalidatePost.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Posts/hooks/revalidatePost.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Жёстко привязан к маршрутам и Next revalidate; оставляем app‑локально.
- **Dependencies / Blockers:** Next.js revalidate path

### `src/collections/Posts/index.ts`
- **Group:** cms/collections
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/collections/Posts/index.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Posts/index.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Зависит от blocks/SEO/utility и richtext blocks; оставить в app.
- **Dependencies / Blockers:** blocks registry, seo plugin fields, richtext config

### `src/collections/Users/index.ts`
- **Group:** cms/collections
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/collections/Users.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/collections/Users/index.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Базовая Users коллекция для admin; подходит для shared.
- **Dependencies / Blockers:** access helpers

### `src/components/AdminBar/index.scss`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/AdminBar/index.scss
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/AdminBar/index.scss
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Стили админки, завязаны на @payloadcms/ui.
- **Dependencies / Blockers:** admin import map

### `src/components/AdminBar/index.tsx`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/AdminBar/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/AdminBar/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** AdminBar компонент для frontend preview; подключать через import map.
- **Dependencies / Blockers:** admin import map, getClientSideURL

### `src/components/BeforeDashboard/SeedButton/index.scss`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/BeforeDashboard/SeedButton/index.scss
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/BeforeDashboard/SeedButton/index.scss
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Стили seed‑кнопки админки.
- **Dependencies / Blockers:** admin import map

### `src/components/BeforeDashboard/SeedButton/index.tsx`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/BeforeDashboard/SeedButton/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/BeforeDashboard/SeedButton/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Админ‑кнопка seed; требуется соблюдение SEED_KEY (runbook).
- **Dependencies / Blockers:** seed endpoint, runbook-payload-seeding.md

### `src/components/BeforeDashboard/index.scss`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/BeforeDashboard/index.scss
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/BeforeDashboard/index.scss
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Стили блока before-dashboard.
- **Dependencies / Blockers:** admin import map

### `src/components/BeforeDashboard/index.tsx`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/BeforeDashboard/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/BeforeDashboard/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Админ‑компонент before-dashboard; подключать через import map.
- **Dependencies / Blockers:** admin import map

### `src/components/BeforeLogin/index.tsx`
- **Group:** admin/components
- **Status:** done
- **Decision:** admin
- **Destination:** apps/<app>/src/admin-ui/BeforeLogin/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/BeforeLogin/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Админ‑вставка перед логином.
- **Dependencies / Blockers:** admin import map

### `src/components/Card/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Card/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Card/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Карточка поста, завязана на Post тип и Media.
- **Dependencies / Blockers:** Media component, payload-types

### `src/components/CollectionArchive/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/CollectionArchive/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/CollectionArchive/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Листинг постов; доменно.
- **Dependencies / Blockers:** Card component

### `src/components/Link/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Link/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Link/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** CMSLink зависит от payload-types и UI Button; app‑локально.
- **Dependencies / Blockers:** UI button, payload-types

### `src/components/LivePreviewListener/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/LivePreviewListener/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/LivePreviewListener/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Клиентский listener live preview; app‑локально.
- **Dependencies / Blockers:** getURL util

### `src/components/Logo/Logo.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Logo/Logo.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Logo/Logo.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Лого Payload (внешний URL); заменить на брендовый.
- **Dependencies / Blockers:** -

### `src/components/Media/ImageMedia/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Media/ImageMedia/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Media/ImageMedia/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** ImageMedia зависит от cssVariables и getMediaUrl; app‑локально.
- **Dependencies / Blockers:** cssVariables, getMediaUrl

### `src/components/Media/VideoMedia/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Media/VideoMedia/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Media/VideoMedia/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** VideoMedia зависит от getMediaUrl; app‑локально.
- **Dependencies / Blockers:** getMediaUrl

### `src/components/Media/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Media/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Media/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Media wrapper; app‑локально.
- **Dependencies / Blockers:** ImageMedia, VideoMedia

### `src/components/Media/types.ts`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Media/types.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Media/types.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Типы Media завязаны на payload-types; app‑локально.
- **Dependencies / Blockers:** payload-types

### `src/components/PageRange/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/PageRange/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/PageRange/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Пейдж‑рендж для списков; app‑локально.
- **Dependencies / Blockers:** -

### `src/components/Pagination/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/Pagination/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/Pagination/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Клиентский пагинатор, завязан на маршруты /posts/page/*.
- **Dependencies / Blockers:** UI pagination, next/navigation

### `src/components/PayloadRedirects/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/PayloadRedirects/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/PayloadRedirects/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** SSR redirect helper; зависит от getDocument/getRedirects.
- **Dependencies / Blockers:** utilities/getDocument, utilities/getRedirects

### `src/components/RichText/index.tsx`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/components/RichText/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/RichText/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** RichText renderer с embedded blocks; app‑локально (тема/registry).
- **Dependencies / Blockers:** blocks renderers, payload-types, converters

### `src/components/ui/button.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/button.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/button.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Базовая кнопка; адаптировать под token/variant канон и убрать прямую Tailwind‑зависимость.
- **Dependencies / Blockers:** ui-layer tokens strategy

### `src/components/ui/card.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/card.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/card.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Базовые Card компоненты; адаптировать под token‑стили.
- **Dependencies / Blockers:** ui-layer tokens strategy

### `src/components/ui/checkbox.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/checkbox.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/checkbox.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Базовый checkbox; требует client boundary.
- **Dependencies / Blockers:** ui-layer client boundary

### `src/components/ui/input.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/input.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/input.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Базовый input; адаптировать под token‑стили.
- **Dependencies / Blockers:** ui-layer tokens strategy

### `src/components/ui/label.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/label.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/label.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Label базовый; client boundary.
- **Dependencies / Blockers:** ui-layer client boundary

### `src/components/ui/pagination.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/pagination.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/pagination.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑компоненты пагинации; адаптировать под token‑стили.
- **Dependencies / Blockers:** ui-layer tokens strategy

### `src/components/ui/select.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/select.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/select.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Select компонент; client boundary + token‑стили.
- **Dependencies / Blockers:** ui-layer client boundary, tokens

### `src/components/ui/textarea.tsx`
- **Group:** ui/primitives
- **Status:** done
- **Decision:** shared
- **Destination:** packages/ui/src/textarea.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/components/ui/textarea.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Textarea базовый; адаптировать под token‑стили.
- **Dependencies / Blockers:** ui-layer tokens strategy

### `src/cssVariables.js`
- **Group:** ui/app-components
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/cssVariables.js
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/cssVariables.js
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Брейкпоинты для Media/Image; держать в app или перенести в shared tokens.
- **Dependencies / Blockers:** ui-layer tokens

### `src/endpoints/seed/contact-form.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/contact-form.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/contact-form.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑данные формы; app‑локально.
- **Dependencies / Blockers:** form builder plugin

### `src/endpoints/seed/contact-page.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/contact-page.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/contact-page.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑страница contact; app‑локально.
- **Dependencies / Blockers:** form block

### `src/endpoints/seed/home-static.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/home-static.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/home-static.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Минимальный home, используется до seed; app‑локально.
- **Dependencies / Blockers:** hero field

### `src/endpoints/seed/home.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/home.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/home.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed home; app‑локально.
- **Dependencies / Blockers:** blocks schema, hero field

### `src/endpoints/seed/image-1.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-1.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-1.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑описание media.
- **Dependencies / Blockers:** media collection

### `src/endpoints/seed/image-2.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-2.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-2.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑описание media.
- **Dependencies / Blockers:** media collection

### `src/endpoints/seed/image-3.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-3.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-3.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑описание media.
- **Dependencies / Blockers:** media collection

### `src/endpoints/seed/image-hero-1.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-hero-1.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-hero-1.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑описание media (hero).
- **Dependencies / Blockers:** media collection

### `src/endpoints/seed/image-hero1.webp`
- **Group:** seed/assets
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-hero1.webp
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-hero1.webp
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Локальный seed‑ассет (без сетевого fetch).
- **Dependencies / Blockers:** seed policy

### `src/endpoints/seed/image-post1.webp`
- **Group:** seed/assets
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-post1.webp
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-post1.webp
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Локальный seed‑ассет (без сетевого fetch).
- **Dependencies / Blockers:** seed policy

### `src/endpoints/seed/image-post2.webp`
- **Group:** seed/assets
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-post2.webp
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-post2.webp
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Локальный seed‑ассет (без сетевого fetch).
- **Dependencies / Blockers:** seed policy

### `src/endpoints/seed/image-post3.webp`
- **Group:** seed/assets
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/image-post3.webp
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/image-post3.webp
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Локальный seed‑ассет (без сетевого fetch).
- **Dependencies / Blockers:** seed policy

### `src/endpoints/seed/index.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/index.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/index.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed orchestrator; убрать сетевой fetch (использовать локальные webp).
- **Dependencies / Blockers:** seed policy, local assets

### `src/endpoints/seed/post-1.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/post-1.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/post-1.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑пост; app‑локально.
- **Dependencies / Blockers:** blocks schema, posts collection

### `src/endpoints/seed/post-2.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/post-2.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/post-2.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑пост; app‑локально.
- **Dependencies / Blockers:** blocks schema, posts collection

### `src/endpoints/seed/post-3.ts`
- **Group:** seed
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/endpoints/seed/post-3.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/endpoints/seed/post-3.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Seed‑пост; app‑локально.
- **Dependencies / Blockers:** blocks schema, posts collection

### `src/environment.d.ts`
- **Group:** infra/env
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/environment.d.ts (или src/env.ts в web-core)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/environment.d.ts
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** В web-core используем packages/env + Zod; этот файл может быть заменён.
- **Dependencies / Blockers:** packages/env

### `src/fields/defaultLexical.ts`
- **Group:** cms/fields
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-fields/src/defaultLexical.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/fields/defaultLexical.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Базовый конфиг Lexical editor с LinkFeature и валидацией URL; подходит для shared. Перенесено в `packages/cms-fields/src/defaultLexical.ts` (этап 4.2).
- **Dependencies / Blockers:** payload richtext-lexical

### `src/fields/link.ts`
- **Group:** cms/fields
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-fields/src/link.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/fields/link.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Field builder для ссылок; требует deepMerge и relationTo (pages/posts). Перенесено в `packages/cms-fields/src/link.ts` (этап 4.2).
- **Dependencies / Blockers:** packages/utils (deepMerge), collections slugs

### `src/fields/linkGroup.ts`
- **Group:** cms/fields
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-fields/src/linkGroup.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/fields/linkGroup.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Группировка ссылок на базе link(); shared. Перенесено в `packages/cms-fields/src/linkGroup.ts` (этап 4.2).
- **Dependencies / Blockers:** packages/cms-fields/link, packages/utils/deepMerge

### `src/heros/HighImpact/index.tsx`
- **Group:** layout/heros
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/heros/HighImpact/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/heros/HighImpact/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Hero renderer; завязан на HeaderTheme и Media.
- **Dependencies / Blockers:** HeaderTheme, Media, RichText

### `src/heros/LowImpact/index.tsx`
- **Group:** layout/heros
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/heros/LowImpact/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/heros/LowImpact/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Hero renderer; app‑локально.
- **Dependencies / Blockers:** RichText

### `src/heros/MediumImpact/index.tsx`
- **Group:** layout/heros
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/heros/MediumImpact/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/heros/MediumImpact/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Hero renderer; app‑локально.
- **Dependencies / Blockers:** Media, RichText, CMSLink

### `src/heros/PostHero/index.tsx`
- **Group:** layout/heros
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/heros/PostHero/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/heros/PostHero/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Hero для поста; завязан на formatAuthors/formatDateTime.
- **Dependencies / Blockers:** utilities formatAuthors/formatDateTime, Media

### `src/heros/RenderHero.tsx`
- **Group:** layout/heros
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/heros/RenderHero.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/heros/RenderHero.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Router hero‑рендерер; app‑локально.
- **Dependencies / Blockers:** Hero components

### `src/heros/config.ts`
- **Group:** layout/heros
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-fields/src/hero.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/heros/config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Schema‑поле hero; логично жить в cms-fields. Перенесено в `packages/cms-fields/src/hero.ts` (этап 4.2).
- **Dependencies / Blockers:** packages/cms-fields/linkGroup, media collection

### `src/hooks/populatePublishedAt.ts`
- **Group:** cms/hooks
- **Status:** done
- **Decision:** shared
- **Destination:** packages/cms-core/src/hooks/populatePublishedAt.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/hooks/populatePublishedAt.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный hook для publishedAt.
- **Dependencies / Blockers:** -

### `src/hooks/revalidateRedirects.ts`
- **Group:** cms/hooks
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/hooks/revalidateRedirects.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/hooks/revalidateRedirects.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Next revalidateTag('redirects'); app‑локально.
- **Dependencies / Blockers:** next/cache

### `src/payload-types.ts`
- **Group:** payload/generated
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/payload-types.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/payload-types.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Генерируемый файл; обновляется через payload generate:types.
- **Dependencies / Blockers:** payload generate:types

### `src/payload.config.ts`
- **Group:** payload/config
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/payload.config.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/payload.config.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Должно быть адаптировано под Postgres adapter + migrations dir + admin import map.
- **Dependencies / Blockers:** runbook-payload-migrations.md, packages/env, cms-* packages

### `src/plugins/index.ts`
- **Group:** payload/plugins
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/plugins/index.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/plugins/index.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Конфигурация Payload plugins; зависит от search/redirects/seo hooks.
- **Dependencies / Blockers:** plugin-* packages, search hooks, redirects hook

### `src/providers/HeaderTheme/index.tsx`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/HeaderTheme/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/HeaderTheme/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Контекст темы для хедера; app‑локально.
- **Dependencies / Blockers:** canUseDOM, Theme types

### `src/providers/Theme/InitTheme/index.tsx`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/Theme/InitTheme/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/Theme/InitTheme/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Inline theme bootstrap script; app‑локально.
- **Dependencies / Blockers:** Theme/shared

### `src/providers/Theme/ThemeSelector/index.tsx`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/Theme/ThemeSelector/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/Theme/ThemeSelector/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑селектор темы; зависит от UI Select.
- **Dependencies / Blockers:** UI select

### `src/providers/Theme/ThemeSelector/types.ts`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/Theme/ThemeSelector/types.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/Theme/ThemeSelector/types.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Типы и дефолты темы; app‑локально.
- **Dependencies / Blockers:** -

### `src/providers/Theme/index.tsx`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/Theme/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/Theme/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** ThemeProvider; app‑локально.
- **Dependencies / Blockers:** canUseDOM, theme shared

### `src/providers/Theme/shared.ts`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/Theme/shared.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/Theme/shared.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Shared helpers темы; app‑локально.
- **Dependencies / Blockers:** -

### `src/providers/Theme/types.ts`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/Theme/types.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/Theme/types.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Типы темы; app‑локально.
- **Dependencies / Blockers:** -

### `src/providers/index.tsx`
- **Group:** providers
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/providers/index.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/providers/index.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Комбинация провайдеров; app‑локально.
- **Dependencies / Blockers:** ThemeProvider, HeaderThemeProvider

### `src/search/Component.tsx`
- **Group:** search
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/search/Component.tsx
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/search/Component.tsx
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** UI‑компонент поиска, завязан на router и UI input/label.
- **Dependencies / Blockers:** UI input/label, useDebounce

### `src/search/beforeSync.ts`
- **Group:** search
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/search/beforeSync.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/search/beforeSync.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Завязан на categories collection и search plugin; app‑локально.
- **Dependencies / Blockers:** plugin-search, categories collection

### `src/search/fieldOverrides.ts`
- **Group:** search
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/search/fieldOverrides.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/search/fieldOverrides.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Overrides полей search коллекции; app‑локально.
- **Dependencies / Blockers:** plugin-search, media collection

### `src/utilities/canUseDOM.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/canUseDOM.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/canUseDOM.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный helper для проверки DOM. Перенесено в `packages/utils/src/canUseDOM.ts` (этап 4.1).
- **Dependencies / Blockers:** -

### `src/utilities/deepMerge.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/deepMerge.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/deepMerge.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Общий deepMerge; убрать @ts-nocheck и привести типы при переносе. Перенесено в `packages/utils/src/deepMerge.ts` (этап 4.1).
- **Dependencies / Blockers:** types cleanup

### `src/utilities/formatAuthors.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/formatAuthors.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/formatAuthors.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Завязан на Post types; app‑локально.
- **Dependencies / Blockers:** payload-types

### `src/utilities/formatDateTime.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/formatDateTime.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/formatDateTime.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный форматтер даты. Перенесено в `packages/utils/src/formatDateTime.ts` (этап 4.1).
- **Dependencies / Blockers:** -

### `src/utilities/generateMeta.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/generateMeta.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/generateMeta.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Зависит от payload-types и OG ассета; app‑локально.
- **Dependencies / Blockers:** mergeOpenGraph, getURL

### `src/utilities/generatePreviewPath.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/generatePreviewPath.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/generatePreviewPath.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Завязан на preview роут и PREVIEW_SECRET; app‑локально.
- **Dependencies / Blockers:** env PREVIEW_SECRET

### `src/utilities/getDocument.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/getDocument.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/getDocument.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Завязан на Config types и cache tags; app‑локально.
- **Dependencies / Blockers:** payload-config, next/cache

### `src/utilities/getGlobals.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/getGlobals.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/getGlobals.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Завязан на Config types и cache tags; app‑локально.
- **Dependencies / Blockers:** payload-config, next/cache

### `src/utilities/getMeUser.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/getMeUser.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/getMeUser.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Завязан на payload-types и /api/users/me; app‑локально.
- **Dependencies / Blockers:** getURL, auth

### `src/utilities/getMediaUrl.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/getMediaUrl.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/getMediaUrl.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальная нормализация media URL; зависит от getClientSideURL. Перенесено в `packages/utils/src/getMediaUrl.ts` (этап 4.1).
- **Dependencies / Blockers:** getURL

### `src/utilities/getRedirects.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/getRedirects.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/getRedirects.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Завязан на redirects collection и cache tags; app‑локально.
- **Dependencies / Blockers:** redirects collection

### `src/utilities/getURL.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/getURL.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/getURL.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальные getServerSideURL/getClientSideURL; привязка к env. Перенесено в `packages/utils/src/getURL.ts` (этап 4.1).
- **Dependencies / Blockers:** env contract

### `src/utilities/mergeOpenGraph.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/mergeOpenGraph.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/mergeOpenGraph.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Привязан к OG ассету и брендингу; app‑локально.
- **Dependencies / Blockers:** getServerSideURL, OG asset

### `src/utilities/toKebabCase.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/toKebabCase.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/toKebabCase.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальная утилита. Перенесено в `packages/utils/src/toKebabCase.ts` (этап 4.1).
- **Dependencies / Blockers:** -

### `src/utilities/ui.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/ui.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/ui.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** cn helper; заменить tailwind-merge на token‑friendly стратегию при необходимости. Перенесено в `packages/utils/src/ui.ts` (этап 4.1).
- **Dependencies / Blockers:** ui-layer strategy

### `src/utilities/useClickableCard.ts`
- **Group:** utils
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/src/utilities/useClickableCard.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/useClickableCard.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** React hook, завязан на next/navigation; app‑локально.
- **Dependencies / Blockers:** next/navigation

### `src/utilities/useDebounce.ts`
- **Group:** utils
- **Status:** done
- **Decision:** shared
- **Destination:** packages/utils/src/useDebounce.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/src/utilities/useDebounce.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Универсальный React‑hook; использовать в UI/форме. Перенесено в `packages/utils/src/useDebounce.ts` (этап 4.1).
- **Dependencies / Blockers:** react

### `tailwind.config.mjs`
- **Group:** infra/css
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/tailwind.config.mjs
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/tailwind.config.mjs
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Tailwind v3 config; учитывать несовместимость с Tailwind 4.
- **Dependencies / Blockers:** tailwind major strategy

### `test.env`
- **Group:** tests/config
- **Status:** done
- **Decision:** ignore
- **Destination:** n/a
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/test.env
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Тестовая переменная NODE_OPTIONS; используем корневые настройки тестов.
- **Dependencies / Blockers:** -

### `tests/e2e/frontend.e2e.spec.ts`
- **Group:** tests/e2e
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/tests/e2e/frontend.e2e.spec.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/tests/e2e/frontend.e2e.spec.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** E2E smoke для фронта; адаптировать baseURL.
- **Dependencies / Blockers:** playwright config

### `tests/int/api.int.spec.ts`
- **Group:** tests/int
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/tests/int/api.int.spec.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/tests/int/api.int.spec.ts
- **Checked in payload-dev:** no
- **Promoted to payload-core/prod:** no
- **Notes:** Интеграционный тест Payload; адаптировать под monorepo.
- **Dependencies / Blockers:** payload config

### `tsconfig.json`
- **Group:** infra/ts
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/tsconfig.json (extends root tsconfig)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/tsconfig.json
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Содержит paths и базовые опции; в web-core используем shared tsconfig.base.json.
- **Dependencies / Blockers:** tsconfig.base.json

### `vitest.config.mts`
- **Group:** tests/unit
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/vitest.config.mts (если оставляем unit/integration)
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/vitest.config.mts
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Конфиг vitest для integration tests; согласовать с monorepo testing strategy.
- **Dependencies / Blockers:** tests strategy

### `vitest.setup.ts`
- **Group:** tests/unit
- **Status:** done
- **Decision:** app
- **Destination:** apps/<app>/vitest.setup.ts
- **Date:** 2025-12-20
- **Owner:** codex
- **Source Path:** for_cute/vitest.setup.ts
- **Checked in payload-dev:** n/a
- **Promoted to payload-core/prod:** n/a
- **Notes:** Загружает dotenv/config; сохранить при сохранении vitest.
- **Dependencies / Blockers:** tests strategy

## Блокеры / вопросы (общие)
- (заполняется по мере работы)
