# UI (слой 2): registry/slots для блоков и модулей (Payload Blocks-first)

Цель слоя 2: дать возможность собирать страницы/модули как “конструктор”, где:
- данные задаются в CMS (Payload Blocks / Layout Builder),
- **рендеринг выбирается по `blockType`** через registry `blockType → React component`,
- app может “тонко” кастомизировать поведение/верстку, не форкая схему и не копируя shared‑код.

Слой 2 дополняет слой 1 (tokens/variants) и подготавливает слой 3 (точечные file overrides в app).

Матрица принятия решений “унифицировать или разделять” (layout Blocks ↔ Lexical BlocksFeature):  
`docs/research/ui-layer-development/ui-layer-2-unification-matrix.md`.

---

## 0) С какой стороны начинать: Blocks vs UI compositions

### Вариант A: начать с Payload Blocks (рекомендовано)

> Важно: это рекомендация для `web-core` как продуктовой платформы (лендинги/контент‑страницы). Payload не “навязывает” Blocks всем проектам, но Blocks — официальный механизм для data‑driven layout builder.

Плюсы:
- **официальный механизм Payload** для page builder: `Blocks` field с явным контрактом `slug → blockType`;
- страница становится data-driven: новые страницы можно собирать из админки без разработки;
- registry естественно живёт в app (тема/верстка/маршруты), а schema может переезжать в `packages/cms-blocks` по мере стандартизации.

Минусы:
- требует дисциплины: стабильные `slug`, миграции при изменениях, и договорённость где хранится schema vs UI.

### Вариант B: начать с UI compositions (composed modules)

Плюсы:
- быстрое переиспользование UI без CMS;
- полезно для SaaS-экранов/внутренних интерфейсов.

Минусы:
- не решает главную задачу “новые сайты/лендинги из CMS”;
- легко уйти в “дизайн‑систему без контента” и застрять в решениях Tailwind 3 vs 4.

**Вывод:** начинаем с Payload Blocks. UI compositions продолжаем развивать, но уже как “рендер‑слой” поверх блоков и tokens.

---

## 1) Внешние источники (официальные / первичные)

### Next.js (App Router): Server/Client Components

Для слоя 2 важны две вещи:
- registry обычно живёт в Server Components (рендер страниц), но отдельные блоки могут быть Client Components;
- `'use client'` — это граница (entrypoint) client tree, поэтому интерактивность добавляем точечно.

Docs:
- `https://nextjs.org/docs/app/getting-started/server-and-client-components`
- `https://nextjs.org/docs/app/api-reference/directives/use-client`

### Payload: Blocks Field

Docs: Blocks Field  
`https://payloadcms.com/docs/fields/blocks`

Ключевые тезисы для `web-core`:
- `slug` блока **сохраняется как `blockType`** в данных (это и есть ключ registry на фронте).
- Payload рекомендует держать block configs отдельными модулями (не inline в коллекциях), чтобы облегчить reuse (“trivializes their reusability”).
- в docs есть раздел про `Block References` (оптимизация больших схем) и ограничения этого подхода:
  - referenced blocks нельзя расширять/переопределять на уровне поля, и есть нюансы с access control (оно выполняется в контексте referenced config, без данных коллекции).

Сопутствующие поля/возможности (важно для UX редактора и стабильности):
- `blockName` сохраняется в данных и может использоваться для подписи строки блока в админке (можно отключить через `admin.disableBlockName`).
- `labels` у Blocks Field — официальный способ кастомизировать подписи строк в админке без кастомных компонентов.
- `interfaceName` у block config — официальный способ влиять на читаемость/предсказуемость генерируемых TS типов.

### Payload: Flexible Layouts (guide)

Guide: How to Build Flexible Layouts with Payload Blocks  
`https://payloadcms.com/posts/guides/how-to-build-flexible-layouts-with-payload-blocks`

Практическая ценность:
- показывает типовой workflow “CMS blocks → фронтенд renderer”.

### Payload + Next.js: Rendering CMS data (advanced guide)

Guide: Learn Advanced Next.js with Payload — Rendering CMS data in React  
`https://payloadcms.com/posts/guides/learn-advanced-nextjs-with-payload/rendering-cms-data-in-react`

Практическая ценность:
- описывает паттерны интеграции Payload данных в React/Next;
- помогает закрепить “renderer/registry” как отдельный слой приложения.

---

## 1.1) Рекомендации сообщества (полезные ориентиры)

Это не “истина” Payload, но полезно для UX редактора и edge cases:

- `defaultValue` для blocks‑поля: иногда встречаются edge cases, когда редакторский UX/валидация ожидают наличие `blockName` в элементах defaultValue (зависит от версии/конфига).  
  Важно: в официальных docs `blockName` — опционален, а для row labels сначала стоит использовать `labels` у Blocks Field.  
  Community discussion: `https://payloadcms.com/community-help/54`
- Подписи строк (row labels) для blocks/array: часто решают через `blockName` и/или кастомный `RowLabel` компонент в админке.  
  `https://payloadcms.com/community-help/2296`
- `payloadblocks` (идея “каталога блоков” для page builder):  
  `https://payloadblocks.dev/`  
  `https://github.com/layoutblocks/payloadblocks`

---

## 2) Канон `web-core` (слой 2)

### 2.1. Registry в app (UI выбирается по `blockType`)

В каждом app:
- существует mapping `blockType → React component`;
- общий helper для рендера блоков выносится в shared‑пакет, чтобы не копировать логику (`@synestra/blocks-renderer`).

Уточнение (Next.js App Router / RSC):
- блок‑компоненты по умолчанию должны быть server‑safe; если конкретный блок требует браузерного рантайма (хуки/state/порталы), он становится Client Component через `'use client'`. Тогда он остаётся “точкой” client boundary, а не заставляет весь renderer стать client.
  См. `https://nextjs.org/docs/app/api-reference/directives/use-client`.

### 2.2. Schema vs renderer

- Schema (Payload `Block` configs) постепенно выносится в `packages/cms-blocks` (когда блок стабилизировался и нужен ≥2 apps).
- Renderer/тема остаются в app, потому что:
  - стили, layout, контент‑правила и “обёртки” — продуктовые.

### 2.3. Стабильность API

- `slug` блока — публичный API (менять только с миграциями и обновлением registry).
- неизвестный `blockType` на фронте не должен “ронять” страницу: fallback = `null` или безопасный placeholder.

Практика:
- если используем `defaultValue` для `blocks` поля, учитываем требования Payload к `blockName` для каждого блока (см. community notes).

### 2.4. Типизация registry (чтобы не плодить `@ts-expect-error`)

Цель: сделать “контракт блоков” проверяемым TypeScript’ом, используя сгенерированные Payload types (`payload generate:types`).

Рекомендованный подход в app:
- ключи registry типизируем как union из `payload-types`:
  - пример: `type PageBlockType = NonNullable<Page['layout']>[number]['blockType']`
- props конкретного блока берём через `Extract` по `blockType`:
  - `type CtaBlockData = Extract<Page['layout'][number], { blockType: 'cta' }>`

Практический эффект:
- меньше “слепых” spread’ов `...block` в компоненты;
- проще рефакторить `slug`/поля блоков — ошибки проявляются при typecheck.

Примечание (официально в Payload):
- `interfaceName` в block config помогает сделать типы более читаемыми/предсказуемыми (вместо автогенерируемых имён).
  См. `https://payloadcms.com/docs/fields/blocks`.

---

## 3) Артефакты репозитория для слоя 2

- `packages/blocks-renderer` — общий helper `renderBlocks(...)`.
- `apps/*/src/blocks/RenderBlocks.tsx` — app‑локальный registry и (опционально) app‑локальная обёртка (spacing/containers).
- Документы:
  - `docs/architecture/component-system.md` (норма registry),
  - `docs/research/payload/payload-blocks-best-practices.md` (официальные best practices Payload по Blocks).
  - `docs/research/payload/payload-lexical-blocksfeature-best-practices.md` (Lexical BlocksFeature и рендеринг rich text блоков).
