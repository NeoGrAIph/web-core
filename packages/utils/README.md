# packages/utils

## Назначение
Shared утилиты (не UI, не CMS), пригодные для повторного использования в нескольких apps и пакетах.

## Содержимое (актуально)
- `canUseDOM` — проверка наличия DOM.
- `deepMerge` / `isObject` — простой deep merge.
- `formatDateTime` — форматтер даты.
- `getMediaUrl` — нормализация media URL.
- `getURL` — `getServerSideURL` / `getClientSideURL`.
- `toKebabCase` — преобразование в kebab-case.
- `cn` — helper для объединения классов (clsx + tailwind-merge).
- `useDebounce` — React hook.

## Источники (upstream/payload/templates/website)
- `upstream/payload/templates/website/src/utilities/canUseDOM.ts`
- `upstream/payload/templates/website/src/utilities/deepMerge.ts`
- `upstream/payload/templates/website/src/utilities/formatDateTime.ts`
- `upstream/payload/templates/website/src/utilities/getMediaUrl.ts`
- `upstream/payload/templates/website/src/utilities/getURL.ts`
- `upstream/payload/templates/website/src/utilities/toKebabCase.ts`
- `upstream/payload/templates/website/src/utilities/ui.ts`
- `upstream/payload/templates/website/src/utilities/useDebounce.ts`

## Зависимости
- `clsx`
- `tailwind-merge`
- peer: `react` (нужен для `useDebounce`)

## Примечания
- `deepMerge` пока сохранён как есть (в исходнике есть `@ts-nocheck`). План: типизировать и убрать suppression.
- App‑специфичные утилиты остаются в `apps/<app>/src/utilities/*` (см. `processing-progress.md`).

## Статус
Перенос выполнен (этап 4.1).
