# Проект: обработка Payload Website template (upstream → web-core)

## Истинная цель проекта
Создать устойчивую и переиспользуемую компонентную платформу на Payload CMS 3 + Next.js, чтобы собирать новые сайты из shared‑компонентов/схем без форков, с точечными overrides (`@/ui/*`, `@/admin-ui/*`) и стабильным переносом изменений через `payload-dev` → `payload-core`.

## Метод достижения
Пошагово обработать файлы официального шаблона Payload Website и привести их к канону `web-core` (shared‑пакеты + фасады + admin‑слой), без изменений в `upstream/`.

## Инфраструктурный контур (фиксируем факт)
- Chart источник: `deploy/charts/web-app` (в `web-core`).
- Values и ArgoCD Applications: **только** в `synestra-platform` (`infra/web-core/<app>/values{,.dev,.prod}.yaml`, `argocd/apps/web-*.yaml`, AppProject `synestra-web`).
- Dev‑режим: `payload.dev.synestra.tech` запускает Next.js 15 в `next dev --port 3000`, Payload CMS 3 в `NODE_ENV=development`, dev‑образ `registry.gitlab.com/synestra/synestra-platform/payload:<docker/payload/VERSION>` (CI job `build_payload_dev`).
- Prod: образы `web-payload-core`, `web-synestra-io` из `synestra-platform/docker/web-*/`, теги в `values.prod.yaml`.
- Перед синком — обязательные проверки: `helm template` + `kubeconform` для изменённых values.

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

## Порядок обработки (этапы)
1) **Классификация upstream**: разнести файлы по группам (см. ниже), занести в `processing-progress.md` статус/решение.
2) **Каркас shared**: удостовериться, что нужные фасады/пакеты есть или создать через генераторы (ui, admin-ui, cms-blocks, cms-fields, utils).
3) **Экстракция**: переносить группы файлов из upstream → shared/packages или app‑facade, фиксируя решение в прогрессе.
4) **Сборка схем и блоков**: registry блоков (schema + renderer), admin import map, фасады `@/ui/*` и `@/admin-ui/*`.
5) **Миграции/seed**: при изменении schema — добавить миграцию/seed (см. `docs/runbooks/runbook-payload-migrations.md`, `runbook-payload-seeding.md`).
6) **Проверка в dev**: собрать dev‑образ (`build_payload_dev`), обновить `values.dev.yaml`, `helm template` + `kubeconform`, ArgoCD sync `web-payload-dev`, smoke‑тест домена.
7) **Промо в core/prod**: перенести устойчивое решение в `apps/payload-core`, поднять тег в `values.prod.yaml`, пройти те же проверки и sync prod‑приложений.

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
