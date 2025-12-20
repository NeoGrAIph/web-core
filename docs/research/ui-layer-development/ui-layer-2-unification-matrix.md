# UI (слой 2): матрица унификации блоков (layout Blocks ↔ Lexical BlocksFeature)

Дата актуальности: **2025-12-17**.  
Контекст: `apps/synestra-io` (Payload 3.68.3, Next 15.4.9).

Цель: прежде чем “массово” выносить блоки в `packages/cms-blocks`, зафиксировать:
- какие блоки используются где (layout blocks поле vs rich text embedded blocks),
- какие из них **имеет смысл унифицировать** (один `slug` и одна schema для нескольких мест),
- какие зависимости мешают выносу, и какой порядок выноса минимально рискованный.

Связанные документы:
 - `docs/research/ui-layer-development/ui-layer-2-registry.md` (общий канон слоя 2)
- `docs/research/payload/payload-blocks-best-practices.md` (официальные Blocks best practices + community нюансы)
- `docs/research/payload/payload-lexical-blocksfeature-best-practices.md` (Lexical BlocksFeature и конвертеры)

---

## 1) Инвентаризация (как сейчас в `synestra-io`)

### 1.1. Layout builder (Blocks Field) — `Pages.layout`

В `apps/synestra-io/src/collections/Pages/index.ts` используется поле:

`blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock]`

Список `slug`:
- `cta`
- `content`
- `mediaBlock`
- `archive`
- `formBlock`

### 1.2. Rich text embedded blocks — `Posts.content` (Lexical)

В `apps/synestra-io/src/collections/Posts/index.ts` используется:

`BlocksFeature({ blocks: [Banner, Code, MediaBlock] })`

Список `slug`:
- `banner`
- `code`
- `mediaBlock`

### 1.3. Рендеринг rich text (JSX converters)

В `apps/synestra-io/src/components/RichText/index.tsx` есть registry для embedded blocks:
- `banner`
- `mediaBlock`
- `code`
- `cta` *(рендерер присутствует)*

Практический вывод: **`cta` уже фактически “унифицирован” по рендеру**, но schema `cta` сейчас подключается только в layout blocks (Pages).

---

## 2) Матрица “унифицировать или разделять”

### 2.1. Кандидаты на унификацию (shared schema, один slug)

| Block (`slug`) | Layout Blocks | Lexical BlocksFeature | RichText JSX converter | Кандидат в `@synestra/cms-blocks` | Причина |
|---|---:|---:|---:|---:|---|
| `mediaBlock` | да | да | да | да (уже) | универсальный “media embed/section” |
| `code` | нет | да | да | да (уже) | технический блок, легко переиспользовать |
| `banner` | нет | да | да | да (уже) | self-contained schema, полезен везде |
| `cta` | да | нет | да | да (уже) | reusable schema после выноса field builders |
| `content` | да | нет | нет | да (уже) | базовый “колоночный” блок; ожидаем overrides под сайты |

Примечание: “да/нет” отражает текущее использование в `synestra-io`, а не запрет.

### 2.2. Layout-only блоки (скорее “страничные секции”)

| Block (`slug`) | Почему пока не унифицируем |
|---|---|
| `archive` | сильно доменный (подбор/селект документов), часто будет отличаться между сайтами |
| `formBlock` | зависит от `forms` коллекции и UX/интеграций формы; требует согласования “форма как продуктовая фича” |

### 2.3. Embedded-only блоки (rich text)

Пока таких “навсегда embedded-only” нет — но **это допустимая стратегия**, если:
- embedded‑блок нужен только как “вставка в текст” (inline-ish поведение),
- а layout‑вариант должен быть более “секционным” и с другим набором полей.

В таком случае лучше делать два разных `slug` (чётко разные API), чем пытаться одним блоком покрыть разные кейсы.

---

## 3) Что мешает выносу `cta/content` (dependencies)

### 3.1. Shared field builders

`CallToAction` и `Content` используют shared field builders:
- `linkGroup` / `link` (вынесены в `@synestra/cms-fields`)
- `deepMerge` как внутренняя реализация внутри `@synestra/cms-fields`

Практика `web-core`:
- `packages/cms-blocks` импортирует `link/linkGroup` только из `@synestra/cms-fields`;
- в app остаются wrapper‑файлы (`apps/*/src/fields/*.ts`, `apps/*/src/blocks/*/config.ts`), которые по умолчанию реэкспортируют shared‑реализацию и дают точку для overrides.

### 3.2. RichText внутри block schema

`cta`/`content` используют richText (Lexical). Это нормально для shared schema, но важно:
- держать editor config переиспользуемым (не завязанным на app‑пути);
- избегать импортов из `apps/*` внутри shared пакета.

---

## 4) Решения/политики, которые должны быть “заранее”

### 4.1. `blockReferences` — не по умолчанию

`blockReferences` полезен как оптимизация больших схем, но снижает гибкость (локальные overrides на уровне поля/коллекции невозможны).  
Для `web-core` (ориентир на кастомизацию сайтов) это означает:
- начинаем с `blocks: [...]`,
- рассматриваем `blockReferences` только при реальной проблеме перфоманса/размера схемы.

### 4.2. `blockName` — точечно

Включать `blockName` стоит, когда:
- страницы длинные и нужна навигация по блокам,
- используется `defaultValue` для blocks‑поля (community: defaultValue требует `blockName`),
- нужен кастомный row label UX.

### 4.3. Типизация registry

Цель: уменьшить `@ts-expect-error` и “слепые” spreads.

Рекомендация:
- типизировать `blockType` union’ом из `payload-types`;
- типизировать props блоков через `Extract<... { blockType: '...' }>` (см. `docs/research/ui-layer-development/ui-layer-2-registry.md`).

---

## 5) Рекомендуемый порядок выноса (минимальный риск)

1) `banner` → `@synestra/cms-blocks` (сделано).  
2) Shared “field builders” (`link`, `linkGroup`) + типизируемый `deepMerge` (сделано).  
3) `cta` → `@synestra/cms-blocks` (сделано).  
4) `content` → `@synestra/cms-blocks` (сделано; допускаем активные overrides под сайты).  
5) `archive/formBlock` — только после согласования доменных требований (в разных сайтах это почти наверняка будет разное).
