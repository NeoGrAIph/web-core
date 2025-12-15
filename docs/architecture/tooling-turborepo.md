# Turborepo (turbo) в `web-core`

В `web-core` Turborepo используется как **координатор задач** поверх pnpm workspaces: он понимает граф зависимостей пакетов и умеет кэшировать результаты задач (локально и, при необходимости, удалённо).

## Где что лежит

- Конфигурация пайплайна: `turbo.json`
- Кэш Turborepo (локально): `.turbo/` (игнорируется в git)
- Скрипты верхнего уровня: `package.json` (например `pnpm build`, `pnpm lint`)

## Рекомендуемый способ запуска

- Запуск по всей монорепе (обычно для CI / общих проверок):
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
- Локальная разработка:
  - один app: `pnpm --filter @synestra/corporate-website dev`
  - несколько apps: `pnpm --filter @synestra/corporate-website --filter @synestra/ecommerce-store dev`

## Кэширование и окружение

- Локальный кэш хранится в `.turbo/`.
- Для репродуцируемости кэш привязан к изменениям env-файлов (см. `globalDependencies` в `turbo.json`).
- Remote cache включается через переменные окружения Turborepo (секреты не храним в `web-core` — только в `synestra-platform`).

## `turbo prune` для контейнерных сборок

Для сборки образов отдельных deployments из монорепозитория используется `turbo prune --docker`: команда создаёт “урезанный” рабочий каталог только с теми пакетами, которые реально нужны выбранному app.

Готовые скрипты в корне:
- `pnpm prune:corp` → `out/corporate-website/`
- `pnpm prune:shop` → `out/ecommerce-store/`
- `pnpm prune:exp` → `out/experiments/`

