# Проект: обработка Payload Website template (upstream → web-core)

## Истинная цель проекта
Создать устойчивую и переиспользуемую компонентную платформу на Payload CMS 3 + Next.js, чтобы собирать новые сайты из shared‑компонентов/схем без форков, с точечными overrides (`@/ui/*`, `@/admin-ui/*`) и стабильным переносом изменений через `payload-dev` → `payload-core`.

## Метод достижения
Пошагово обработать файлы официального шаблона Payload Website и привести их к канону `web-core` (shared‑пакеты + фасады + admin‑слой), без изменений в `upstream/`.

## Инфраструктурный базис (предусловие)
- Chart источник остаётся `deploy/charts/web-app` (web-core).
- Values/ArgoCD — только в `synestra-platform` (`infra/web-core/*`, `argocd/apps/web-*`), AppProject `synestra-web`.
- Dev-режим для проверки решений: Next.js `next dev --port 3000`, Payload CMS 3 `NODE_ENV=development`, образ `payload:<VERSION>` из `synestra-platform/docker/payload/dev`.
- Prod-образы: `web-payload-core`, `web-synestra-io`; теги в `values.prod.yaml`.
- Проверка перед любым sync: `helm template` + `kubeconform` изменённых values.

## Инструменты (генераторы)
В монорепе уже есть генераторы (`pnpm gen` / `turbo gen`). Используем их после стабилизации UI‑контрактов для создания пакетов и компонентов по стандарту, чтобы не плодить копипаст и расхождения структуры.
См.:
- `turbo/generators/config.ts`
- `docs/architecture/monorepo/monorepo-package-contracts.md`


## Канон overrides (что считаем правильным)
**Базовый подход — wrapper‑файлы в app (без alias‑магии):**
- shared UI живёт в `packages/ui` (`@synestra/ui/*`);
- в каждом app есть фасад `src/ui/*`, который по умолчанию реэкспортит shared‑реализации;
- весь app‑код импортирует UI только из `@/ui/*`.

**Почему это работает:**
- Next.js официально поддерживает `baseUrl/paths` и алиас `@/* → ./src/*`;
- override — это обычный git‑дифф: замена файла `apps/<site>/src/ui/<component>.tsx`.

**Shadowing через alias — только опционально:**
- возможно через `webpack.resolve.alias` (prod) и `experimental.turbo.resolveAlias` (dev);
- требует поддержки двух режимов резолвинга (turbopack/webpack) и проверки `next build`.

**Admin UI overrides:**
- используются Custom Components + Import Map Payload;
- shared admin‑компоненты живут в shared‑пакетах, app подключает их через `@/admin-ui/*`;
- import map генерируется командой `payload generate:importmap`.

**Definition of Done для override boundary:**
- есть shared‑дефолт (`packages/*`);
- есть app‑wrapper по умолчанию (re‑export);
- описано, что можно/нельзя менять (docs/architecture или README);
- если boundary касается schema — понятно, нужна ли миграция.

## Входные данные
- Перечень файлов: `upstream-payload-website.tree.json`.
- Исходники: `upstream/payload/templates/website/**`.
- Детальный журнал решений: `processing-progress.md`.

## Выходные артефакты
- Shared‑пакеты: `packages/ui`, `packages/cms-blocks`, `packages/cms-fields`, `packages/utils` (по решению).
- App‑фасады: `apps/*/src/ui/*`, `apps/*/src/admin-ui/*`.
- Registry блоков и app‑локальные рендереры.

## Техдолги (держать в чек-листе)
- Убрать лишние lockfile в `apps/payload-core` и `apps/synestra-io` (оставить корневой `pnpm-lock.yaml`).
- Проверить shared‑пакеты, перенесённые в `old_packages`, и закрыть выявленные ошибки/расхождения.
- Перенести `pnpm.onlyBuiltDependencies` в корень или убрать из приложений.
- Зафиксировать обязательную проверку миграций Payload в dev‑образе (hook job) при любых изменениях schema.

## Порядок обработки (этапы)
1) **Разбор upstream и классификация** — пройти `upstream-payload-website.tree.json`, разнести по группам (blocks, ui, cms-schema, fields, layout, providers, search, endpoints, routes, assets, tests, infra); завести каждую группу в `processing-progress.md` со статусом и ответственным.
2) **Каркас shared и фасадов** — убедиться, что базовые пакеты/фасады есть или сгенерировать: `packages/ui`, `packages/cms-blocks`, `packages/cms-fields`, `packages/utils`; фасады `apps/*/src/ui/*`, `apps/*/src/admin-ui/*` (даёт точку для overrides).
3) **Экстракция из upstream** — переносить группами: UI/blocks → shared или фасад; layout/app-компоненты → фасад; utilities → shared/utils. Каждое решение фиксировать в `processing-progress.md` (куда перенесли, почему).
4) **Конвертация и сборка registry** — собрать registry блоков (schema + renderer), подвязать на Payload Blocks; настроить фасады `@/ui/*`, `@/admin-ui/*`; для admin обновить import map (`payload generate:importmap`).
5) **Схемы, миграции, seed** — при изменении schema добавить миграцию (`runbook-payload-migrations.md`), при необходимости seed (`runbook-payload-seeding.md`); техдолг: убедиться, что hook job в dev-образе выполняется и миграции проходят.
6) **Техдолги/санитария** — удалить лишние lockfile в `apps/payload-core` и `apps/synestra-io` (оставить корневой `pnpm-lock.yaml`); проверить/починить пакеты в `old_packages`; перенести `pnpm.onlyBuiltDependencies` в корень или убрать из приложений; записать найденное в чек-лист.
7) **Проверка в dev** — собрать dev-образ (`build_payload_dev`), обновить тег в `values.dev.yaml`; `helm template` + `kubeconform` на изменённые values; ArgoCD sync `web-payload-dev`; smoke-тест `payload.dev.synestra.tech` (UI, админка, миграции); отметить в `processing-progress.md` `checked_in_payload-dev=yes/no`.
8) **Промо и перенос в core/prod** — перенести стабильное решение в `apps/payload-core` (эталон); при необходимости добавить overrides в `apps/synestra-io`; поднять тег в `values.prod.yaml`, повторить проверки (render + kubeconform), ArgoCD sync prod; отметить `promoted_to_payload-core/prod=yes/no` в прогрессе.
9) **Контроль прогресса** — для каждой записи: статус, дата, ответственный, конечный путь; отдельные колонки: проверено в dev, промо в core/prod. DoD по группе: shared + фасад, описан override boundary, миграции/seed учтены, `next dev`/`next build` не ломаются, GitOps-проверки пройдены.

## Журнал обработки (заполняется по мере работы)

Формат записи:
`<path/group> | <category> | <decision> | <destination> | <status> | <notes>`

### Группы (начальный список)
- `src/blocks/**` | blocks | _pending_
- `src/components/ui/**` | ui-components | _pending_
- `src/components/**` | app-components | _pending_
- `src/collections/**` | cms-schema | _pending_
- `src/fields/**` | cms-fields | _pending_
- `src/Footer/**`, `src/Header/**`, `src/heros/**` | layout | _pending_
- `src/utilities/**` | utilities | _pending_
- `src/providers/**` | providers | _pending_
- `src/search/**` | search | _pending_
- `src/endpoints/**` | endpoints | _pending_
- `src/app/**` | routes/layout | _pending_
- `public/**` | assets | _pending_
- `tests/**` | tests | _pending_
- root configs (`next.config.js`, `tailwind.config.mjs`, `package.json`, etc.) | infra | _pending_

## Движок контроля прогресса
- Для каждой записи в `processing-progress.md`: статус (pending/in_progress/done/blocked), дата, ответственный, конечный путь в `web-core`.
- Отдельные колонки: `checked_in_payload-dev (yes/no)` и `promoted_to_payload-core/prod (yes/no)`.

## Критерии качества (Definition of Done по группе)
- **UI/blocks/admin**: есть shared реализация, app‑фасад, описан override boundary; import map для admin обновлён.
- **Schema/fields**: миграции Payload добавлены, seed при необходимости; env‑контракт не нарушен.
- **Routes/layout**: совместимо с Next.js 15 (app router), dev‑режим работает.
- **Infra/config**: проверено `next build` (для prod), `next dev` (для dev), линт/типизация не ломаются.
- **Проверка GitOps**: `helm template` + `kubeconform` на изменённых values; ArgoCD sync dev прошёл.

## Текущее состояние dev/prod (на декабрь 2025)
- Dev: `payload.dev.synestra.tech` — Next.js `next dev`, Payload CMS 3 `NODE_ENV=development`, образ `payload:v3.68.3-p18`.
- Prod: `payload.services.synestra.tech` — `web-payload-core` образ `bb3d2611ff3b-r1` (prod режим).

## Статусы
- `pending` — не начато
- `in_progress` — в работе
- `done` — завершено
- `blocked` — требует решения/зависимости
