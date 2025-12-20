# Payload Page Builder: каталог блоков и правила структуры (канон `web-core`)

Статус: актуально на **2025-12-17** (Payload **3.68.3**, Next.js **15.4.9**).

Цель: масштабировать page builder так, чтобы добавление новых блоков не превращалось в копипаст и “зоопарк”:
- **одна точка истины** для набора блоков (каталог) на странице;
- понятные границы: **schema** vs **renderer** vs **overrides**;
- возможность независимых деплоев apps при максимально shared‑коде.

Связанные документы:
- UX/идентичность блоков (`slug/blockName/anchors/RowLabel`): `docs/research/payload/payload-page-builder-admin-ux-best-practices.md`
- Seed/defaultValue + изменения schema: `docs/runbooks/runbook-payload-seeding.md`
- Миграции (Postgres): `docs/runbooks/runbook-payload-migrations.md`
- Конвергенция Layout ↔ Lexical embedded blocks: `docs/architecture/payload-lexical-layout-convergence.md`
- Override boundaries (“swizzle без форков”): `docs/research/ui-layer-development/ui-layer-3-file-overrides.md`
- Проект обработки upstream‑шаблона: `docs/runbooks/runbook-upstream-website-processing-project.md`

---

## 1) Термины

- **Block config (schema)** — объект `Block` в Payload (`slug`, `fields`, `labels`, `admin.*`).
- **Catalog (каталог блоков)** — список block configs, который подключён к конкретному `Blocks` field (например `pages.layout`).
- **Registry (реестр рендера)** — mapping `blockType → React component` на фронтенде.
- **Override boundary** — файл‑обёртка в app, который по умолчанию реэкспортирует shared реализацию, а при кастомизации меняется точечно.

Основание:
- Payload `Blocks` field хранит тип блока в данных как `blockType`, а значит фронтенд обязан выбирать рендер по `blockType`: https://payloadcms.com/docs/fields/blocks

---

## 2) Канон структуры: где что живёт

### 2.1. Schema (Payload block configs)

Правило `web-core`: **schema переезжает в `packages/*` только когда блок стабилен и нужен ≥2 apps**.

Где:
- shared (стабильные блоки): `packages/cms-blocks/src/blocks/<slug>/config.ts`
- app‑локальные блоки (нестабильны или доменные): `apps/<app>/src/blocks/<BlockName>/config.ts`
- wrapper (по умолчанию, для shared‑блоков): `apps/<app>/src/blocks/<BlockName>/config.ts` → `export { ... } from '@synestra/cms-blocks'`

Важно:
- **либо** блок доменный и файл содержит локальную реализацию,
- **либо** блок shared и файл является wrapper‑реэкспортом.
  Один и тот же файл не должен быть и локальной реализацией, и wrapper.

Основание:
- Payload прямо рекомендует держать block configs отдельными модулями — это “trivializes their reusability”: https://payloadcms.com/docs/fields/blocks

### 2.2. Catalog (список блоков для конкретного поля)

Правило `web-core`: в app есть **явный каталог** для `pages.layout` (и любых других blocks‑полей при появлении).

Где:
- `apps/<app>/src/blocks/pageBuilder.ts` — экспорт `PAGE_LAYOUT_BLOCKS` (массив block configs)
- `upstream/payload/templates/website/src/blocks/pageBuilder.ts` — аналог для официального шаблона (reference only)

Почему так:
- набор блоков — продуктовая договорённость, он должен быть виден “в одном месте”;
- это лучше масштабируется, чем inline‑список в `collections/Pages`.

### 2.3. Registry (frontend render)

Правило `web-core`: registry живёт в app, потому что тема/верстка/обёртки — продуктовые.

Где:
- `apps/<app>/src/blocks/registry.ts` — экспорт `PAGE_BLOCK_COMPONENTS` (mapping `blockType → component`)
- `apps/<app>/src/blocks/RenderBlocks.tsx` использует shared helper `renderBlocks` и общий anchor helper.
- связка catalog↔registry валидируется через `defineBlockCatalog` из `@synestra/blocks-renderer`.

Основание:
- Next.js (Server/Client Components): registry чаще server‑side, а интерактивные блоки — точечно client (`'use client'`):  
  https://nextjs.org/docs/app/getting-started/server-and-client-components  
  https://nextjs.org/docs/app/api-reference/directives/use-client

### 2.4. Embedded blocks в rich text (Lexical `BlocksFeature`)

Layout builder — не единственное место, где живут блоки: в Payload 3 блоки могут быть и внутри rich text (Lexical `BlocksFeature`).

Канон `web-core`:
- embedded blocks имеют **отдельный каталог** (например `RICH_TEXT_BLOCKS`) и **отдельные converters** для рендера (например `RICH_TEXT_JSX_CONVERTERS`);
- при этом `slug` остаётся единым API и по возможности embedded‑каталог является подмножеством page builder каталога.

Основание:
- Lexical `BlocksFeature`: https://payloadcms.com/docs/rich-text/custom-features
- Lexical converters (JSX): https://payloadcms.com/docs/rich-text/converters#converting-jsx

### 2.5. Overrides (точечные кастомизации)

Правило `web-core`: по умолчанию **wrapper‑точки** в app, а не “магический shadowing”.

Основание (почему wrapper‑подход предпочтительнее):
- объяснение и риски alias/shadowing (webpack/turbopack): `docs/research/ui-layer-development/ui-layer-3-file-overrides.md`

---

## 3) Группировка и “каталог в UI”

### 3.1. `labels` и `admin.group` в block config

Канон:
- каждый блок обязан иметь `labels.singular/plural` (UX “Add block”);
- при росте числа блоков используем `admin.group`, чтобы не было “плоского списка”.

Основание:
- Payload Blocks docs: admin options для blocks включают `group` (группировка в UI): https://payloadcms.com/docs/fields/blocks

---

## 4) Block References (`blockReferences`): когда (не) использовать

`blockReferences` ускоряет админку и уменьшает “вес схемы”, но ухудшает расширяемость.

Канон `web-core`:
- по умолчанию для `pages.layout` используем **явный каталог** (`blocks: [...]`) и app‑wrapper overrides;
- к `blockReferences` возвращаемся только если блоков станет много и это реально давит на Admin UI.

Основание (официальные ограничения `blockReferences`):
- referenced blocks **нельзя** расширять на уровне поля, и есть нюансы access control: https://payloadcms.com/docs/fields/blocks

---

## 5) DoD: как добавить новый блок (минимум)

### 5.1. В коде

1) Создать block config (`slug/interfaceName/labels/...`) в app или `packages/cms-blocks`.
2) Создать React component для рендера блока.
3) Подключить блок в каталог `PAGE_LAYOUT_BLOCKS`.
4) Подключить компонент в registry `PAGE_BLOCK_COMPONENTS`.
5) Если блок содержит вложенные `array` — добавить RowLabel (см. этап 1).

### 5.2. В данных/операциях

6) Если менялась schema (поля/типы/relations/slug) — обновить миграции/seed по канону:
- `docs/runbooks/runbook-payload-migrations.md`
- `docs/runbooks/runbook-payload-seeding.md`

### 5.3. Проверки

7) Прогоны:
- `pnpm --filter <app> generate:types`
- `pnpm --filter <app> generate:importmap`
- `pnpm typecheck`
- `pnpm build`

---

## 6) Источники (первичные)

- Payload: Blocks field (включая `blockType`, `blockName`, `admin.group`, `blockReferences`): https://payloadcms.com/docs/fields/blocks
- Payload guide (page builder через Blocks): https://payloadcms.com/posts/guides/how-to-build-flexible-layouts-with-payload-blocks
- Next.js: Server/Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js: `'use client'`: https://nextjs.org/docs/app/api-reference/directives/use-client
- Next.js: `transpilePackages` (если блоки/рендерер живут в workspace packages): https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
