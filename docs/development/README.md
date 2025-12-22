# Разработка

Эта папка — **единая точка входа** для разработки в `web-core`: локальная разработка, dev‑контуры в кластере и канон переиспользования компонентов.

Главная цель: чтобы новые сайты собирались из готовых модулей, а **точечная кастомизация** делалась заменой конкретных файлов (без форков всего shared‑кода).

## Ключевой канон: `App-level facade (@/ui/*) поверх shared (@synestra/ui/*)`

Корректное название в терминах индустрии — **facade/indirection layer с локальными overrides**:
- **Facade (GoF)**: фасад даёт единый, стабильный интерфейс для доступа к подсистеме. В нашем случае это стабильные импорт‑пути `@/ui/*`. См. определение Facade: `https://people.csail.mit.edu/addy/pattern/pat4e.htm`.
- **Module path aliases** (Next.js): технический механизм, который позволяет `@/ui/*` резолвить в `apps/<site>/src/ui/*`. См. Next.js: `https://nextjs.org/docs/14/app/building-your-application/configuring/absolute-imports-and-module-aliases`.
- Для **Payload Admin** похожий “override по файлу” механизм есть официально и так и называется: **Swap in your own React components / Custom Components** (Component Paths + Import Map). См. Payload: `https://payloadcms.com/docs/custom-components/overview`.

Дальше в документах мы используем термины: **“app-level фасад”**, **“override”**, **“shared UI”**.

1) **Shared слой** (`@synestra/ui/*`)
- Живёт в `packages/ui` и экспортирует публичный API через subpath exports (например `@synestra/ui/button`).
- Содержит унифицированные компоненты, совместимые между сайтами.

2) **App-level фасад** (`@/ui/*`)
- Живёт в каждом приложении: `apps/<site>/src/ui/*`.
- Весь frontend‑код приложения **импортирует UI только из `@/ui/*`**.
- По умолчанию файлы фасада — это реэкспорты shared‑реализаций.
- Если конкретному сайту нужна разница — **файл фасада становится override’ом** и экспортирует локальную реализацию (не меняя импорт‑пути по всему коду приложения).

3) **Admin UI отдельно от frontend**
- Для Payload Admin кастомизаций держим отдельный фасад `@/admin-ui/*` (например `apps/<site>/src/admin-ui/*`).
- Подключение идёт через Payload custom components (component paths + import map), а не через frontend‑импорты.

### Как должно получиться “в итоге” (целевая картина)

- `packages/ui` растёт и становится глобальным источником базовых компонентов.
- Любой сайт:
  - использует `@/ui/*` как единую точку импорта UI,
  - при необходимости “подменяет файл” в `apps/<site>/src/ui/*`,
  - не тянет `@synestra/ui/*` напрямую из app‑кода.

Пример структуры (упрощённо):

```
packages/ui/
  src/
    button.tsx
    card.tsx

apps/payload-core/
  src/
    ui/
      button.tsx          # export { Button } from '@synestra/ui/button'
      card.tsx            # export { Card } from '@synestra/ui/card'

apps/synestra-io/
  src/
    ui/
      button.tsx          # override: экспортирует локальную реализацию для synestra.io
      card.tsx            # по умолчанию реэкспортит shared
```

## Где мы ведём разработку

Канон: **разработку shared‑слоя и фасадов ведём на `payload-dev`**.

- dev: `web-payload-dev` → `https://payload.dev.synestra.tech`
- prod эталон: `web-payload-core` → `https://payload.services.synestra.tech`

Почему так:
- `payload-core` — “чистый” upstream‑шаблон без доменных оверрайдов, поэтому на нём проще отлавливать регрессии shared‑слоя;
- `payload-dev` — быстрый контур, где проверяем изменения прежде чем переносить их в доменные сайты.

## Канон типизации блоков

`PAGE_BLOCK_COMPONENTS` **обязан** быть типобезопасным относительно `Page['layout']`.
Правило: маппинг строится по `blockType`, а компоненты принимают соответствующий блок‑тип.

Минимальный шаблон:

```ts
type PageBlock = Page['layout'][number]
type PageBlockType = PageBlock['blockType']
type PageBlockByType<TBlockType extends PageBlockType> = Extract<PageBlock, { blockType: TBlockType }>
type PageBlockComponentMap = {
  [TBlockType in PageBlockType]: React.ComponentType<PageBlockByType<TBlockType>>
}

export const PAGE_BLOCK_COMPONENTS = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
} satisfies PageBlockComponentMap
```

Это устраняет `any`, гарантирует соответствие схемы и ловит рассинхрон при изменениях в Payload schema.

## FormBlock: populated форма

`FormBlock` типизируется через `payload-types` и ожидает **populated** `form`.
Если приходит только `id`, компонент возвращает `null`, чтобы избежать runtime‑ошибок.
Убедитесь, что запросы/queries пополняют `form` в блоке, когда нужен рендер.

## Индекс этой папки

- `docs/development/01-app-facade.md` — детальный канон фасада `@/ui/*` и overrides.
- `docs/development/02-payload-dev-workbench.md` — роль `payload-core`/`payload-dev` и как им пользоваться.
- `docs/development/03-dev-environments.md` — как мы называем dev/prod окружения (домены/namespaces) и почему.
- `docs/development/04-workflow-shared-changes.md` — workflow разработки shared‑компонентов через `payload-dev`.
- `docs/development/05-troubleshooting.md` — типовые проверки и быстрый дебаг.
