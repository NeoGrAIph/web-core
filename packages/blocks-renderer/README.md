# `@synestra/blocks-renderer`

Небольшой shared‑хелпер для рендеринга “page builder” блоков по registry `blockType → React component`.

Назначение:
- убрать копипаст `RenderBlocks` между приложениями;
- оставить тему/обёртки (spacing/containers) в app‑слое.

## Почему `blockType`

Payload Blocks Field сохраняет `slug` блока в данных как `blockType` — это и есть “ключ”, по которому фронтенд выбирает React‑компонент из registry.

Официальные ссылки:
- Payload → Blocks Field: `https://payloadcms.com/docs/fields/blocks`
- Next.js → Server/Client Components (для понимания где живёт registry и где нужна интерактивность): `https://nextjs.org/docs/app/getting-started/server-and-client-components`
- Next.js → директива `'use client'` (client boundary): `https://nextjs.org/docs/app/api-reference/directives/use-client`

## Использование

```tsx
import { renderBlocks } from '@synestra/blocks-renderer'
```

См. пример в `apps/*/src/blocks/RenderBlocks.tsx`.

## API

`renderBlocks(blocks, components, options?)`:

- `blocks`: массив объектов, где есть `blockType` и (желательно) `id`.
- `components`: registry `Record<blockType, React.ComponentType>`.
- `options`:
  - `componentProps`: дополнительные props, которые будут добавлены **ко всем** блокам (и перекроют одноимённые поля блока при конфликте).
  - `getKey`: генератор `key` для списка (по умолчанию берёт `block.id`, иначе `index`).
  - `wrap`: обёртка вокруг каждого блока (удобно для spacing/containers, которые должны оставаться в app‑слое).
  - `renderUnknown`: fallback для неизвестных/битых блоков (по умолчанию `null`).

## Типизация registry (рекомендуется)

Идея: типизировать ключи registry через сгенерированные Payload types, чтобы переименования `slug`/полей ловились на `typecheck`.

```ts
import type React from 'react'
import type { Page } from '@/payload-types'

type PageBlock = Page['layout'][number]
type PageBlockType = PageBlock['blockType']

const blockComponents = {
  cta: CtaBlock,
  content: ContentBlock,
  mediaBlock: MediaBlock,
  archive: ArchiveBlock,
  formBlock: FormBlock,
} satisfies Record<PageBlockType, React.ComponentType<any>>
```

Официально про генерацию типов:
- Payload → TypeScript: `https://payloadcms.com/docs/typescript/overview`

## Практические замечания

- Этот пакет специально остаётся “без темы”: стили/контейнеры/отступы задаются через `wrap` в конкретном app.
- Если конкретный block‑component должен быть интерактивным, он становится Client Component через `'use client'`. Сам `renderBlocks` может оставаться в server‑части дерева.
