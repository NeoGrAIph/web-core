# `@synestra/ui`

Общий UI‑слой монорепозитория.

Важный контекст из Payload templates:
- `website` использует Tailwind 3.x,
- `ecommerce` использует Tailwind 4.x.

Пока мы не приняли единое решение по UI‑стеку:
- избегаем завязки core UI на конкретный major Tailwind;
- отдаём предпочтение нейтральным подходам (CSS variables/tokens, минимальные компоненты, изоляция стилей).

Когда появится дизайн‑система:
- здесь будут “атомы/молекулы” и дизайн‑токены;
- `apps/*` будут переиспользовать их без копипаста.

## Публичный API

Поддерживаем оба стиля импортов:

- из корня:
  - `import { Button } from '@synestra/ui'`
- subpath exports:
  - `import { Button } from '@synestra/ui/button'`
  - `import { Card } from '@synestra/ui/card'`

## Скрипты

- `pnpm --filter @synestra/ui build`
- `pnpm --filter @synestra/ui test`
- `pnpm --filter @synestra/ui dev:test`
