# packages/env

## Назначение
Shared helper для безопасной валидации env vars через Zod и определения `SYNESTRA_ENV`.

## API
- `getSynestraEnv(runtimeEnv)` → `dev | stage | prod` (fallback: `dev`).
- `createValidatedEnv({ schema, runtimeEnv, appName })` → валидированные значения или ошибка без вывода секретов.

## Источники
- `old_packages/env/**`.

## Зависимости
- `zod`.

## Примечания
- Ошибки валидации не печатают значения секретов.
- `SYNESTRA_ENV` опционален (fallback `dev`).

## Статус
Перенос выполнен (инфраструктура закрыта).
