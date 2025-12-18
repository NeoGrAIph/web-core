# runbook-dev.md

Короткий runbook по локальной разработке `web-core` (multi-app).

## Базовые команды

- Запустить всё (все `apps/*`, если подключены в turbo/pnpm scripts):
  - `pnpm dev`
 - Запустить один app:
  - `pnpm --filter <package-name> dev`
  - примеры:
    - `pnpm --filter @synestra/corporate-website dev`
    - `pnpm --filter @synestra/ecommerce-store dev`
    - `pnpm --filter @synestra/experiments dev`
    - `pnpm --filter @synestra/payload-core dev` (эталонный upstream workbench)
- Запустить несколько apps:
  - `pnpm --filter <app-1> --filter <app-2> dev`
- Тесты UI пакета (`packages/ui`):
  - `pnpm --filter @synestra/ui test`
  - `pnpm --filter @synestra/ui dev:test`
- Прогнать линт/билд/тесты по монорепе:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm test`

## Env vars (локально)

- Пример переменных: `apps/<app>/.env.example`
- Рекомендуемый файл для локалки: `apps/<app>/.env.local` (игнорируется git)
- Контракт `dev → stage → prod` и правила валидации: `docs/architecture/env-contract.md`

## Turborepo (кратко)

- Пайплайн задач задаётся в `turbo.json`, а команды верхнего уровня — в root `package.json`.
- Для контейнерных сборок в CI используем `turbo prune --docker` (см. `pnpm prune:corp|prune:shop|prune:exp`).

## Порты (локально)

Договорённость “один app → один порт” нужна только локально, в Kubernetes контрактом будут домены/Ingress.

Рекомендуемая схема:
- `3000`: `@synestra/corporate-website`
- `3001`: `@synestra/ecommerce-store`
- `3002`: `@synestra/experiments`

## Быстрые проверки

- Если меняешь `packages/ui`:
  - держи запущенным хотя бы один app, который использует UI,
  - параллельно держи `dev:test`/`test` для UI пакета (Vitest), чтобы ловить регрессии.
  - каноничный dev‑контур в кластере для этих изменений: `payload-dev` (`https://payload.dev.synestra.tech`)

## VS Code

Открывай workspace-файл:
- `.vscode/web-core.code-workspace`
