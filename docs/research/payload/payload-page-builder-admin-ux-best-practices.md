# Payload CMS 3 — Page Builder (Blocks) Admin UX: best practices (official + upstream)

Дата актуальности: **2025-12-17**.  
Контекст репозитория: **Payload 3.68.3**, **Next.js 15.4.9**, monorepo `apps/*` + `packages/*`.

Цель: зафиксировать канон UX для редактора, когда страницы собираются через Payload `Blocks` field (“layout builder”):
- редактор видит удобные подписи строк, а не “Row 1 / Row 2”;
- блоки легко различимы и их можно навигировать;
- кастомизация делается через **тонкие override‑точки** (слой 3), а не форками.

Важно: при анализе паттернов не используем кастомизированную админку прод‑сайта; ориентируемся на **официальные templates** в `upstream/`.

Связанные документы:
- `docs/research/payload/payload-admin-custom-components-best-practices.md` (Import Map + Custom Components)
- `docs/research/payload/payload-blocks-best-practices.md` (schema‑часть Blocks)
- `docs/research/ui-layer-2-registry.md` (renderer registry `blockType → component`)
- `docs/research/ui-layer-3-file-overrides.md` (override boundaries)

---

## 1) Источники (официальные)

- Blocks field: `https://payloadcms.com/docs/fields/blocks`
- Array field (RowLabel): `https://payloadcms.com/docs/fields/array`
- Custom Components (Component Path + Import Map): `https://payloadcms.com/docs/custom-components/overview`
- Admin React Hooks (`useRowLabel` и др.): `https://payloadcms.com/docs/admin/react-hooks`

## 2) Референсы (официальные templates, `upstream/`)

Website template:
- `upstream/payload/templates/website/src/collections/Pages/index.ts` — `layout` как blocks field (`admin.initCollapsed: true`)
- `upstream/payload/templates/website/src/Header/config.ts` + `src/Header/RowLabel.tsx` — Array RowLabel через Component Path
- `upstream/payload/templates/website/src/Footer/config.ts` + `src/Footer/RowLabel.tsx`

Ecommerce template:
- `upstream/payload/templates/ecommerce/src/collections/Pages/index.ts` — `layout` как blocks field
- `upstream/payload/templates/ecommerce/src/blocks/RenderBlocks.tsx` — использование `blockName` (например, для якорей/ID)

---

## 3) Канон `web-core` (UX)

### 3.1. `Blocks` field: включаем “структуру”

Рекомендации:
- блоки держим внутри `tabs` (как минимум вкладки `Hero` / `Content` / `SEO`) — это снижает “визуальный шум”;
- для `layout` blocks‑поля включаем `admin.initCollapsed: true` (редактор раскрывает только то, что правит);
- `blocks: [...]` задаём явно (не `blockReferences` по умолчанию), чтобы сохранить возможность локальных overrides.

### 3.2. `blockName` как главный “лейбл блока”

`blockName` — встроенный механизм Payload для различимости блоков.

Практика:
- оставляем `blockName` включённым по умолчанию для page builder;
- если фронтенд использует `blockName` для `id`/якорей, обязательно иметь fallback (например, `\`${blockType}-${index}\``), чтобы пустое имя не ломало навигацию;
- избегаем “хрупких” `blockName!`: имя может быть пустым или повторяться — это нормальный сценарий для редактора.

Практика `web-core` (референс реализации):
- `apps/synestra-io/src/blocks/RenderBlocks.tsx` вычисляет `id` для обёртки блока как:
  - `toKebabCase(blockName)` если `blockName` непустой;
  - иначе `\`${blockType}-${index + 1}\``;
  - при дубликатах добавляется суффикс `-2`, `-3`, …
- аналогично в `templates/payload/website/src/blocks/RenderBlocks.tsx`.

### 3.3. RowLabel для вложенных `array` внутри блоков

Большинство “болей” редактора — не сами blocks, а **вложенные списки** (links, columns, navItems, slides, cards…).

Стандарт:
- для каждого “важного” array‑поля добавляем `admin.components.RowLabel`;
- RowLabel реализуем как Client Component и строим label из данных строки.

---

## 4) Реализация в монорепе: app-local entrypoints

Почему:
- Payload Custom Components подключаются через Import Map и “строковые Component Paths”;
- shared‑пакеты не должны жёстко зависеть от путей конкретного app.

Решение:
- в каждом app/template создаём единый entrypoint:

`src/payload/admin/rowLabels.tsx`

И используем стабильные Component Paths:
- `@/payload/admin/rowLabels#LinkGroupRowLabel`
- `@/payload/admin/rowLabels#ContentColumnRowLabel`

Это соответствует паттерну official templates (`upstream/.../config.ts` → `components.RowLabel: '@/.../RowLabel#RowLabel'`).

Важно:
- если app использует shared schema из `@synestra/cms-blocks` / `@synestra/cms-fields`, он **обязан** иметь этот entrypoint (иначе `payload generate:importmap`/`generate:types` упадёт, потому что Component Path не зарезолвится).

---

## 5) Definition of Done (для “хорошего UX” блока)

Считаем блок “готовым для редактора”, если:
- `layout` blocks‑поле аккуратно организовано (tabs, initCollapsed);
- блоки различимы (`blockName` включён или есть иной понятный лейбл);
- все вложенные array‑списки имеют RowLabel (и он понятен из данных);
- при изменении schema зафиксировано: “нужна ли миграция”.
