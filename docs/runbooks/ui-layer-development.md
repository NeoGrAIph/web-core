# Runbook: UI-layer development (Payload CMS 3 + Next.js)

## Purpose
Сформировать и зафиксировать последовательный процесс разработки UI‑слоёв (1–3) в `web-core` на основе исследований в `docs/research/ui-layer-development/`.

## Goals
- Обеспечить переносимость UI между приложениями без форков и без зависимости от Tailwind‑мажора.
- Стабилизировать работу с Payload Blocks через типизированный registry и единый подход к schema/renderer.
- Обеспечить предсказуемые точечные overrides через фасад, без alias‑магии.
- Обеспечить переиспользование admin‑компонентов: общий компонент, внедрённый в `payload-core`, должен быть доступен всем сайтам платформы.
- Вести разработку и проверку на `payload-dev`, а стабильный результат переносить в `payload-core`.

## Expected Result
- В `packages/ui` есть token‑база и базовые компоненты, подключаемые через `@synestra/ui/styles.css`.
- В приложениях UI импортируется только из `@/ui/*`, админ‑компоненты — только из `@/admin-ui/*`.
- Общие admin‑компоненты живут в shared‑пакетах и подключаются в приложениях через `@/admin-ui/*` (re-export по умолчанию).
- Есть app‑локальный registry `blockType → component`, типизированный через `payload-types`.
- Shared schema выносятся в `packages/cms-blocks`, app‑рендереры остаются локальными.
- Overrides оформляются через wrapper‑файлы в app, а не через скрытые алиасы.
- Все изменения обкатаны на `payload-dev` и перенесены в `payload-core` как эталон.

## Prerequisites
- Доступ к репозиторию `web-core`.
- Понимание канона фасада `@/ui/*` и overrides (`docs/development/01-app-facade.md`).
- Канон разработки: работаем на `payload-dev`, результат переносим в `payload-core` (`docs/development/02-payload-dev-workbench.md`).
- Ознакомление с исследованиями:
  - `docs/research/ui-layer-development/ui-layer-1-parameterization.md`
  - `docs/research/ui-layer-development/ui-layer-2-registry.md`
  - `docs/research/ui-layer-development/ui-layer-2-unification-matrix.md`
  - `docs/research/ui-layer-development/ui-layer-3-file-overrides.md`

## Steps

### 1) Слой 1: parameterization (tokens/variants/slots)
1. Зафиксировать целевой набор design tokens и их префикс.
2. Определить список базовых компонентов для `@synestra/ui/*`.
3. Определить стандартизированные `data-*` варианты (variant/size/tone).
4. Определить точки slots для расширяемых компонентов.
5. Зафиксировать правила Server/Client границы и `'use client'`.
6. Определить порядок импорта `@synestra/ui/styles.css` и app-стилей.
7. Подтвердить Tailwind-agnostic подход (не завязывать слой 1 на Tailwind major).
8. Зафиксировать правила сериализуемости props для client-компонентов.

Детализация (из `ui-layer-1-parameterization.md`):
- Токены задаём через CSS variables с префиксом `--syn-ui-*`; компоненты не хардкодят цвета/радиусы/spacing.
- Варианты реализуем через `data-*` (например `data-variant`, `data-size`, `data-tone`) и CSS-селекторы по этим атрибутам.
- “Escape hatch” через `className` допустим, но если он используется постоянно — расширяем контракт компонента (variants/tokens/slots).
- Глобальные стили импортируются один раз в root layout приложения; порядок: `@synestra/ui/styles.css` → app globals.
- Если `@synestra/ui` не собирается заранее, проверить `transpilePackages` в `next.config.js`.
- `'use client'` ставим точечно (entrypoint), слой 1 по умолчанию server-safe.

### 2) Слой 2: registry для Payload Blocks
1. Определить базовый registry `blockType -> React component`.
2. Зафиксировать схему разделения: schema в `packages/cms-blocks`, renderer в app.
3. Определить типизацию registry через `payload-types`.
4. Зафиксировать правила для unknown `blockType` (fallback).
5. Определить минимальный набор shared блоков для выноса.
6. Определить границы Server/Client для блоков: registry в Server Components, интерактивные блоки — client.

Детализация (из `ui-layer-2-registry.md`):
- Начинаем с Payload Blocks (официальный layout builder), UI compositions — вторично.
- `slug` блока — публичный API и равен `blockType` в данных.
- `blockName` и `labels` использовать для UX редактора; `interfaceName` улучшает читабельность типов.
- Неизвестный `blockType` на фронте не должен ломать страницу (fallback `null`/placeholder).
- Типизация:
  - `type BlockType = NonNullable<Page['layout']>[number]['blockType']`
  - props через `Extract<... { blockType: '...' }>`

### 3) Слой 2b: унификация блоков (matrix)
1. Актуализировать список блоков layout vs rich text.
2. Обозначить кандидатов на унификацию и причины.
3. Зафиксировать blockers (зависимости, schema, editor config).
4. Утвердить порядок выноса (минимальный риск).
5. Зафиксировать политику `blockReferences` (не по умолчанию).
6. Определить политику `blockName` и `defaultValue` для blocks-полей.

Детализация (из `ui-layer-2-unification-matrix.md`):
- Текущий список (пример synestra-io):
  - Layout (Pages.layout): `cta`, `content`, `mediaBlock`, `archive`, `formBlock`
  - Lexical (Posts.content): `banner`, `code`, `mediaBlock`
  - RichText renderer уже умеет `cta`
- Кандидаты на унификацию: `mediaBlock`, `code`, `banner`, `cta`, `content`.
- Layout-only: `archive`, `formBlock` (сильно доменные).
- Embedded-only возможны — тогда лучше разные `slug`, чем один, перегруженный.
- Dependencies для `cta/content`: shared field builders (`link`, `linkGroup`) и совместимость richText.
- Рекомендованный порядок выноса: `banner` → field builders → `cta` → `content` → (по согласованию) `archive/formBlock`.

### 4) Слой 3: file overrides (facade)
1. Зафиксировать канон wrapper-файлов в app (`apps/*/src/ui/*`).
2. Описать правила overrides для schema/fields (`apps/*/src/blocks/*/config.ts`, `apps/*/src/fields/*.ts`).
3. Утвердить разделение `@/ui/*` и `@/admin-ui/*`.
4. Описать условия, когда допустим shadowing через alias (если вообще нужен).
5. Зафиксировать Definition of Done для override boundary (shared + wrapper + документация + миграции).

Детализация (из `ui-layer-3-file-overrides.md`):
- Канон: app не импортирует `@synestra/ui/*` напрямую — только через `@/ui/*`.
- Overrides делаются заменой wrapper-файла в app (1 файл = 1 override).
- Shadowing через alias (webpack/turbopack) — только как опциональный режим с явной поддержкой dev/prod резолвинга.
- Payload Admin UI кастомизации — через `@/admin-ui/*` и import map (`payload generate:importmap`).

## Validation
- Слой 1: базовые компоненты рендерятся без Tailwind-зависимостей и не требуют массового `'use client'`.
- Слой 2: страницы рендерятся через registry; неизвестные блоки не ломают страницу.
- Слой 3: overrides работают через wrapper-файлы без alias-магии.

## Rollback / cleanup
- Откатить изменения через Git до предыдущего состояния.
- При необходимости вернуть app на прямые импорты shared-пакетов (временно, только для локальной диагностики).

## References
- `docs/research/ui-layer-development/ui-layer-1-parameterization.md`
- `docs/research/ui-layer-development/ui-layer-2-registry.md`
- `docs/research/ui-layer-development/ui-layer-2-unification-matrix.md`
- `docs/research/ui-layer-development/ui-layer-3-file-overrides.md`
