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

Канон: только **subpath exports** (чтобы публичный API был явным и не “раздувался” barrel‑импортами):

- `import { Button } from '@synestra/ui/button'`
- `import { Card } from '@synestra/ui/card'`

## Стили и “tokens”

Core UI использует CSS variables (токены) и `data-*` variants, чтобы:
- не зависеть от Tailwind major,
- позволять app’ам переопределять только нужные параметры.

Важно про Next.js (App Router): обработчики событий (например `onClick`) работают только в Client Components. Поэтому `Button` можно рендерить в Server Components, но интерактивность добавляй на стороне client (или в отдельном client‑компоненте).

1) Подключи дефолтные стили один раз в app (например, в `app/layout.tsx`):

```ts
import '@synestra/ui/styles.css'
```

2) Переопределяй токены в глобальном CSS конкретного сайта (пример):

```css
:root {
  --syn-ui-color-primary: #0ea5e9;
  --syn-ui-radius-md: 16px;
}
```

Примечание: чтобы переопределения гарантированно “побеждали дефолт”, импортируй `@synestra/ui/styles.css` **раньше** файла глобальных стилей app (например `./globals.css`).

## Скрипты

- `pnpm --filter @synestra/ui build`
- `pnpm --filter @synestra/ui test`
- `pnpm --filter @synestra/ui dev:test`
