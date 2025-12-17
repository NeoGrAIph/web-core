# Payload CMS 3: конвергенция Layout Blocks ↔ Lexical embedded blocks (registry + converters) — канон `web-core`

Статус: актуально на **2025-12-17** (Payload **3.68.3**, Next.js **15.4.9**).

Цель: убрать “дрейф” между:
- **layout blocks** (Payload `Blocks` field, напр. `pages.layout`) и
- **embedded blocks** (Payload Lexical `BlocksFeature` внутри rich text),

так, чтобы:
- `slug` блока был единым публичным API (и для page builder, и для embedded blocks);
- renderer‑логика была согласована, но не превращалась в жёсткий форк/копипаст;
- app‑уровень мог кастомизировать тему/классы без перелопачивания schema.

Связанные документы:
- Каталог page builder (layout): `docs/architecture/payload-page-builder-catalog.md`
- Исследование Lexical BlocksFeature/Converters: `docs/research/payload/payload-lexical-blocksfeature-best-practices.md`
- UX‑канон Page Builder (blockName/RowLabel/anchors): `docs/research/payload/payload-page-builder-admin-ux-best-practices.md`

---

## 1) Что считается “одним и тем же блоком”

### 1.1. Общая идентичность: `Block.slug`

И в layout builder (Blocks field), и в Lexical embedded blocks (BlocksFeature) идентичность блока задаётся `Block.slug`.

Практический вывод:
- `slug` — **публичный контракт данных**: переименование требует миграции/обновления seed.

Источники:
- Blocks field (layout): https://payloadcms.com/docs/fields/blocks
- Lexical Custom Features (`BlocksFeature`): https://payloadcms.com/docs/rich-text/custom-features

### 1.2. “Одинаковый смысл” ≠ “одинаковая форма”

Решение “унифицировать или разделить” принимаем по смыслу и структуре:
- **унифицируем**, если блок одинаков по данным и UX в обоих местах (например `mediaBlock`, `code`, `banner`);
- **разделяем**, если embedded‑вариант должен быть “узким/вставкой”, а layout‑вариант — “секцией” (тогда это разные API и разные `slug`).

---

## 2) Канон структуры в `web-core`: где живёт что

### 2.1. Layout (page builder)

См. `docs/architecture/payload-page-builder-catalog.md` (каталог + registry).

Опорные файлы (пример: `@synestra/synestra-io`, аналогично в template):
- каталог schema: `apps/<app>/src/blocks/pageBuilder.ts` (`PAGE_LAYOUT_BLOCKS`)
- registry рендера: `apps/<app>/src/blocks/registry.ts` (`PAGE_BLOCK_COMPONENTS`)
- связка/валидация: `apps/<app>/src/blocks/RenderBlocks.tsx` + `@synestra/blocks-renderer`

### 2.2. Embedded (Lexical BlocksFeature)

Канон `web-core`: embedded blocks имеют **отдельный каталог** и **отдельные converters**, но опираются на те же `slug` и (по возможности) на те же React‑компоненты.

Опорные файлы (пример: `@synestra/synestra-io`, аналогично в template):
- каталог schema для rich text editor: `apps/<app>/src/blocks/richTextCatalog.ts` (`RICH_TEXT_BLOCKS`)
- converters для рендера rich text: `apps/<app>/src/blocks/richTextRenderers.tsx` (`RICH_TEXT_JSX_CONVERTERS`)
- использование в Posts/других richText полях: `BlocksFeature({ blocks: RICH_TEXT_BLOCKS })`
- использование на фронте: `@payloadcms/richtext-lexical/react` (`RichText` + `JSXConvertersFunction`)

Источники:
- Lexical Overview: https://payloadcms.com/docs/lexical/overview
- Lexical Converters (JSX): https://payloadcms.com/docs/rich-text/converters#converting-jsx

---

## 3) Единый registry: что именно унифицируем

### 3.1. Унифицируем на уровне `slug` и набора “возможностей”

Для каждого блока фиксируем:
- доступен ли он в layout (`pages.layout`);
- доступен ли он как embedded block (`BlocksFeature`);
- как он рендерится на фронте в каждом режиме (layout vs rich text).

Почему так:
- конвертеры Lexical (JSX) выбираются по ключу `blocks.<slug>`; layout‑renderer выбирается по `blockType` (= `slug`).

### 3.2. Не унифицируем тему/верстку в shared‑пакетах

Shared‑пакеты (`packages/*`) могут содержать:
- механику и “инструменты согласованности” (валидации каталогов),

но не должны фиксировать тему/классы/верстку, потому что это app‑уровневые overrides.

---

## 4) Converters: стандарт реализации

### 4.1. JSX converters — базовый путь

Для рендера rich text на сайте используем JSX converters:
- `RichText` из `@payloadcms/richtext-lexical/react`
- `JSXConvertersFunction` + `defaultConverters`
- `blocks: { <slug>: ({ node }) => ReactNode }`

Источник: https://payloadcms.com/docs/rich-text/converters#converting-jsx

### 4.2. Внутренние ссылки (Link converter)

Если в контенте используются внутренние ссылки на docs (Pages/Posts), используем `LinkJSXConverter` и явно задаём `internalDocToHref`.

Основание: официальный паттерн converters и необходимость правильно формировать ссылки при `relationTo`.

Источник: https://payloadcms.com/docs/rich-text/converters#converting-jsx

### 4.3. HTML converters — только при необходимости

HTML converters (`convertLexicalToHTMLAsync`) используем только когда нужен HTML как строка (интеграции, письма и т.п.).

Источник: https://payloadcms.com/docs/rich-text/converters#converting-html

---

## 5) DoD (Definition of Done) для “конвергентного” блока

Считаем блок “готовым для layout + embedded”, если:
- `slug` стабилен и согласован в schema/данных;
- блок добавлен в `PAGE_LAYOUT_BLOCKS` (если нужен в layout);
- блок добавлен в `RICH_TEXT_BLOCKS` (если нужен в rich text);
- на фронте есть renderer:
  - `PAGE_BLOCK_COMPONENTS[slug]` для layout,
  - `RICH_TEXT_JSX_CONVERTERS.blocks[slug]` для embedded.
- при изменении schema/slug обновлены миграции + seed по канону.

---

## 6) Референсы (официальные templates, `upstream/`)

Мы сверяемся с `upstream/payload/templates/{website,ecommerce}` (reference only).

Провенанс upstream в `web-core`:
- repo: https://github.com/payloadcms/payload
- pinned snapshot commit: https://github.com/payloadcms/payload/tree/77f96a4ff224e37285d3d554686e9fe3af25d00b

Примеры файлов (GitHub, pinned commit):
- Website Posts (BlocksFeature): https://github.com/payloadcms/payload/blob/77f96a4ff224e37285d3d554686e9fe3af25d00b/templates/website/src/collections/Posts/index.ts
- Website RichText converters (embedded blocks): https://github.com/payloadcms/payload/blob/77f96a4ff224e37285d3d554686e9fe3af25d00b/templates/website/src/components/RichText/index.tsx
- Ecommerce RichText converters (embedded blocks): https://github.com/payloadcms/payload/blob/77f96a4ff224e37285d3d554686e9fe3af25d00b/templates/ecommerce/src/components/RichText/index.tsx

