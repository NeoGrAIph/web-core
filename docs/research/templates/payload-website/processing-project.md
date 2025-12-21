# Проект: обработка Payload Website template (upstream → web-core)

## Истинная цель проекта
Создать устойчивую и переиспользуемую компонентную платформу на Payload CMS 3 + Next.js, чтобы собирать новые сайты из shared‑компонентов/схем без форков, с точечными overrides (`@/ui/*`, `@/admin-ui/*`) и стабильным переносом изменений через `payload-dev` → `payload-core`.

## Метод достижения
Пошагово обработать файлы официального шаблона Payload Website и привести их к канону `web-core` (shared‑пакеты + фасады + admin‑слой), без изменений в `upstream/`.
Дополнительно: при формировании модулей **сохраняем имена типовых файлов и их взаимное расположение** (если это возможно), а модуль строим из **уже имеющихся файлов** (без пересоздания “с нуля”).

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
- Копия upstream‑шаблона для анализа: `for_cute/**` (рабочая копия, допускаются правки, вырезания и переносы).
- `upstream/payload/templates/website/**` используем только для сверки (не изменяем).

## Выходные артефакты
- Shared‑пакеты: `packages/ui`, `packages/cms-blocks`, `packages/cms-fields`, `packages/utils` (по решению).
- App‑фасады: `apps/*/src/ui/*`, `apps/*/src/admin-ui/*`.
- Registry блоков и app‑локальные рендереры.

## Перечень планируемых модулей (живой список)
Фиксируем здесь целевые модули, чтобы сразу видеть “куда ложится код”. Обновляем по мере анализа файлов.

- **CMS schema / access / hooks:** `packages/cms-core` (access‑helpers, shared hooks, общие коллекции).
- **CMS blocks (schema):** `packages/cms-blocks` (block configs).
- **Blocks renderers (app):** `apps/*/src/blocks/*/Component*.tsx` + `apps/*/src/blocks/RenderBlocks.tsx`.
- **CMS fields:** `packages/cms-fields` (link/linkGroup/defaultLexical и др.).
- **UI primitives / shared:** `packages/ui` (без Tailwind‑зависимости; tokens/variants/slots).
- **Utilities:** `packages/utils` (formatters, helpers, data utils).
- **Blocks renderer (shared helper):** `packages/blocks-renderer` (если подтверждён).
- **Next config (shared):** `packages/next-config` (единый next.config, transpilePackages, withPayload).
- **ESLint config (shared):** `packages/eslint-config` (единые правила).
- **TypeScript config (shared):** `packages/typescript-config` (base/nextjs).
- **Plugins (shared):** `packages/plugins/*` (внутренние Payload plugins, если нужны).
- **CMS ecommerce (shared, опционально):** `packages/cms-ecommerce` (ecommerce‑схема, изолировать от website).
- **Admin UI:** `packages/*` (shared admin‑компоненты) + фасад `apps/*/src/admin-ui/*`.
- **App UI facade:** `apps/*/src/ui/*` (wrapper‑реэкспорт или override).
- **Layout modules (app):** `Header`, `Footer`, `heros`, `page builder registry` (app‑локально).
- **Form block UI (app):** `apps/*/src/blocks/Form/**` (fields + UI controls).
- **Routes & endpoints (app):** `src/app/**`, `src/endpoints/**`.
- **Search / redirects / SEO (app):** `src/search/**`, `redirects.js`, `next-sitemap.config.cjs`.
- **Seed & migrations (app):** `src/endpoints/seed/**`, `src/migrations/**`.

## Техдолги (держать в чек-листе)
- [x] Убрать лишние lockfile в `apps/payload-core` и `apps/synestra-io` (оставить корневой `pnpm-lock.yaml`).
- [x] Проверить shared‑пакеты из `old_packages` и закрыть расхождения (migrate plugins + cms-ecommerce).
- [x] Перенести `pnpm.onlyBuiltDependencies` в корень или убрать из приложений.
- [ ] Зафиксировать обязательную проверку миграций Payload в dev‑образе (hook job) при любых изменениях schema.

## Порядок обработки (этапы)

1. Инфраструктурный базис (предусловие)                                                                                                                                                                                                                    
    - Chart источник остаётся deploy/charts/web-app (web-core).                                                                                                                                                                                            
    - Values/ArgoCD — только в synestra-platform (infra/web-core/*, argocd/apps/web-*), AppProject synestra-web.                                                                                                                                           
    - Dev-режим для проверки решений: Next.js next dev --port 3000, Payload CMS 3 NODE_ENV=development, образ payload:<VERSION> из synestra-platform/docker/payload/dev.                                                                                   
    - Prod-образы: web-payload-core, web-synestra-io; теги в values.prod.yaml.                                                                                                                                                                             
    - Проверка перед любым sync: helm template + kubeconform изменённых values.                                                                                                                                                                            
2. Разбор upstream и классификация (завершено)                                                                                                                                                                                                                        
    - Пройден весь `for_cute/**` и сопоставлен с upstream tree; разбивка по группам выполнена.                                                                 
    - Последовательный анализ файлов проведён, записи внесены в `processing-progress.md`.                                                                                                                         
    - У каждой записи заполнены: статус, дата, ответственный, целевой модуль и путь‑источник.                                                                                                                        
3. Каркас shared и фасадов (завершено)                                                                                                                                                                                                                                 
    - Созданы базовые пакеты/директории: packages/ui, packages/cms-core, packages/cms-blocks, packages/cms-fields, packages/utils, packages/blocks-renderer.                                                                   
    - Созданы фасады apps/*/src/ui/* и apps/*/src/admin-ui/* (с README‑шаблонами).                                                                                                                              
    - Обосновывает: минимизирует хаос при переносе, даёт точку для overrides.                                                                                                                                                                              
4. Экстракция из upstream: порядок формирования модулей (на основе этапа 3 и анализа)                                                                                                                                                                                                                                  
    Перед началом этапа 4 обязательно ознакомиться с документами ниже (обязательные и рекомендованные).

    **Рекомендованные для выполнения этапа 4**
    - `AGENTS.md` — рабочие правила, фасады `@/ui/*`, admin‑слой `@/admin-ui/*`, `for_cute/**` как рабочая копия.
    - `docs/development/01-app-facade.md` — канон фасада и override boundary (UI‑слой).
    - `docs/development/02-payload-dev-workbench.md` — работа через `payload-dev` и эталон `payload-core`.
    - `docs/development/04-workflow-shared-changes.md` — перенос shared‑изменений.
    - `docs/runbooks/runbook-upstream-templates.md` — правила работы с upstream.
    - `docs/runbooks/ui-layer-development.md` — поэтапная разработка UI‑слоёв и registry.
    - `docs/runbooks/runbook-payload-migrations.md` — миграции Postgres (обязательны при schema‑изменениях).
    - `docs/runbooks/runbook-payload-seeding.md` — seed/defaultValue (без сетевых fetch).
    - `docs/runbooks/runbook-env-contract.md` — env‑контракт (без plaintext‑секретов).
    - `docs/architecture/component-system.md` — структура UI‑компонентов и server/client границы.
    - `docs/architecture/payload-page-builder-catalog.md` — каталог блоков и registry.
    - `docs/architecture/payload-lexical-layout-convergence.md` — согласование layout ↔ lexical blocks.
    - `docs/architecture/payload-editor-workflow.md` — drafts/preview/live preview/schedule publish.
    - `docs/architecture/monorepo/monorepo-packages-standards.md` — стандарты packages/*.

    **Дополнительные полезные материалы**
    - `docs/development/README.md` — индекс dev‑доков (быстрая навигация).
    - `docs/architecture/architecture.md` — границы web‑core ↔ platform, GitOps‑контракт.
    - `docs/architecture/canon.md` — общий канон v0 (ограничения/ожидания).
    - `docs/architecture/release-promotion.md` — dev→prod promotion.
    - `docs/architecture/monorepo/monorepo-package-contracts.md` — контракт структуры пакетов/компонентов.
    - `docs/architecture/monorepo/monorepo-packages-audit.md` — текущее состояние packages/*.
    - `docs/architecture/tooling-turborepo.md` — Turbo pipeline и prune.
    - `docs/runbooks/runbook-dev-prod-flow.md` — модель dev/prod и проверка перед promotion.
    - `docs/runbooks/runbook-upstream-website-processing-project.md` — проектный план обработки upstream.

    Порядок выбран так, чтобы сначала закрыть **ядро schema/fields**, затем **shared‑блоки**, затем **UI‑примитивы**, и только после этого **app‑рендеры и роуты**. Это минимизирует переработки и даёт устойчивый контракт.
    4.1. **packages/utils**  
      - Причина: утилиты нужны в cms-fields и UI (deepMerge, cn, getURL, useDebounce).  
      - Источники: for_cute/src/utilities/*.  
    4.2. **packages/cms-fields**  
      - Причина: поля используются в cms-blocks, Header/Footer globals и Pages/Posts.  
      - Источники: for_cute/src/fields/*, for_cute/src/heros/config.ts.  
    4.3. **packages/cms-core**  
      - Причина: базовые коллекции/глобалы/access/hooks — фундамент для payload.config.  
      - Источники: for_cute/src/access/*, for_cute/src/collections/{Users,Media,Categories}, for_cute/src/Header/config.ts, for_cute/src/Footer/config.ts, for_cute/src/hooks/populatePublishedAt.ts.  
    4.4. **packages/cms-blocks**  
      - Причина: блок‑schema нужны для Pages/Posts и seed; рендеры остаются в app.  
      - Источники: for_cute/src/blocks/*/config.ts (Banner, CallToAction, Content, Code, MediaBlock).  
    4.5. **packages/ui**  
      - Причина: общий слой UI (button, input, select, pagination) нужен для app‑компонентов, search и form UI.  
      - Источники: for_cute/src/components/ui/*.  
    4.5b. **packages/next-config, packages/eslint-config, packages/typescript-config**  
      - Причина: убрать копипаст конфигов и обеспечить единый toolchain для apps/packages (см. old_packages).  
      - Источники: old_packages/*/README.md (референсы по структуре/назначению).  
    4.6. **apps/*/src/admin-ui**  
      - Причина: admin‑компоненты требуются для import map и Payload Admin; UI слой уже готов.  
      - Источники: for_cute/src/components/BeforeLogin, BeforeDashboard, AdminBar, Header/Footer RowLabel.  
    4.7. **apps/*/src/blocks (renderers + registry)**  
      - Причина: зависит от cms-blocks и UI; формирует frontend‑рендер.  
      - Источники: for_cute/src/blocks/** + for_cute/src/blocks/RenderBlocks.tsx.  
    4.8. **apps/*/src/components + providers + heros + Header/Footer**  
      - Причина: завязаны на UI, blocks, cms‑globals и utils.  
      - Источники: for_cute/src/components/**, src/providers/**, src/heros/**, src/Header/**, src/Footer/**.  
    4.9. **apps/*/src/search + endpoints/seed**  
      - Причина: search зависит от UI/input; seed зависит от schema/blocks и локальных ассетов.  
      - Источники: for_cute/src/search/**, for_cute/src/endpoints/**.  
    4.10. **apps/*/src/app (routes)**  
      - Причина: маршруты используют все предыдущие слои (blocks, providers, seed, search).  
      - Источники: for_cute/src/app/**.  
    4.11. **payload.config.ts + plugins + generated files**  
      - Причина: финальная сборка зависит от всех модулей.  
      - Источники: for_cute/src/payload.config.ts, for_cute/src/plugins/index.ts, payload generate:types/importmap.  
    - При формировании модулей сохранять имена файлов и их относительное расположение (если возможно) относительно исходной структуры.                                                                                                                     
    - Если структуру/имена пришлось изменить — фиксировать причину в processing-progress.md.                                                                                                                                                              
    - Каждый модуль снабжать `README.md` (уже создано на этапе 3, актуализируем по ходу).                                                                                                                                   
    - Каждое решение фиксировать в processing-progress.md (куда перенесли, почему).                                                                                                                                                                        
5. Конвертация и сборка registry                                                                                                                                                                                                                           
    - Собрать registry блоков (schema + renderer), подвязать на Payload Blocks.                                                                                                                                                                            
    - Настроить фасады @/ui/*, @/admin-ui/*; для admin — обновить import map (payload generate:importmap).                                                                                                                                                 
    - Обосновывает: гарантирует единый контракт для фронта и админки.                                                                                                                                                                                      
6. Схемы, миграции, seed                                                                                                                                                                                                                                   
    - При изменении schema: добавить миграцию (runbook runbook-payload-migrations.md), при необходимости seed (runbook-payload-seeding.md).
    - Техдолг: проверка, что hook job в dev образе выполняется и миграции проходят.
7. Техдолги/санитария
    - Удалить лишние lockfile в apps/payload-core и apps/synestra-io; оставить корневой pnpm-lock.yaml.
    - Проверить/починить пакеты, перемещённые в old_packages.
    - Перенести pnpm.onlyBuiltDependencies в корень или убрать из приложений.
    - Записать находки в чек-лист, чтобы не забыть перед финальной промоцией.
8. Проверка в dev
    - Собрать dev-образ (build_payload_dev), обновить тег в values.dev.yaml.
    - helm template + kubeconform на изменённые values.
    - ArgoCD sync web-payload-dev; smoke-тест payload.dev.synestra.tech (UI, админка, миграции).
    - Отметить в processing-progress.md: checked_in_payload-dev=yes/no.
9. Промо и перенос в core/prod
    - Перенести стабильное решение в apps/payload-core (эталон); при необходимости добавить overrides в apps/synestra-io.
    - Поднять тег в values.prod.yaml, повторить проверки (render + kubeconform), ArgoCD sync prod.
    - Отметить promoted_to_payload-core/prod=yes/no в прогрессе.
10. Контроль прогресса (актуализация)
    - Для каждой записи заполнены: статус, дата, ответственный, конечный путь, source_path.
    - Колонки checked_in_payload-dev / promoted_to_payload-core/prod готовы для заполнения после переноса.
    - Критерии DoD по группе остаются неизменными.

## Журнал обработки (заполняется по мере работы)

Формат записи:
`<path/group> | <category> | <decision> | <destination> | <status> | <date> | <owner> | <source_path> | <checked_in_payload-dev> | <promoted_to_payload-core/prod> | <notes>`

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
- **Smoke‑проверки**: `/`, `/admin`, `/admin/login` работают на dev.

## Текущее состояние (на 2025-12-20)
- **Анализ for_cute/** завершён по основным группам файлов; записи внесены в `processing-progress.md`.
- **Решения по модульности сформированы**:
  - shared (кандидаты): `packages/ui`, `packages/cms-core`, `packages/cms-blocks`, `packages/cms-fields`, `packages/utils`;
  - app‑локально: блок‑рендереры, routes, providers, search, seed, plugins, payload config;
  - admin‑слой: `apps/*/src/admin-ui/*` (BeforeLogin/BeforeDashboard/AdminBar/RowLabel).
- **Перенос/рефакторинг модулей ещё не выполнен** (идёт этап подготовки решений и фиксации).

## Полученные артефакты (фактические изменения)
- **AGENTS.md**: обновлены правила работы (for_cute как рабочая копия, живой список модулей, обязательная фиксация прогресса).
- **processing-project.md**: добавлен живой список планируемых модулей; уточнены правила и шаги.
- **processing-progress.md**: заполнены решения по:
  - root configs, public assets, access helpers;
  - collections, fields, blocks, components, utilities, providers, app routes;
  - search, endpoints/seed, plugins, payload config/types, hooks, tests, header/footer, heros.

## Следующие шаги (по плану)
1) Перейти к этапу **формирования модулей** из существующих файлов (без переименований, где возможно).
2) Создать `README.md` для каждого модуля.
3) Провести валидацию в `payload-dev` после переноса.

## Текущее состояние dev/prod (на декабрь 2025)
- Dev: `payload.dev.synestra.tech` — Next.js `next dev`, Payload CMS 3 `NODE_ENV=development`, образ `payload:v3.68.3-p18`.
- Prod: `payload.services.synestra.tech` — `web-payload-core` образ `bb3d2611ff3b-r1` (prod режим).

## Статусы
- `pending` — не начато
- `in_progress` — в работе
- `done` — завершено
- `blocked` — требует решения/зависимости
