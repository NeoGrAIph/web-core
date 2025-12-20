# Runbook: проект обработки Payload Website template (upstream → web-core)

## Purpose
Достигнуть целевой архитектуры `web-core`: переиспользуемая компонентная платформа (shared‑пакеты + фасады + admin‑слой) без форков, с прогоном через `payload-dev` → `payload-core`, используя последовательную обработку файлов официального Payload Website template.

## Goals
- Построить устойчивую компонентную платформу: shared‑компоненты/схемы, фасады `@/ui/*` и `@/admin-ui/*`, точечные overrides без форков.
- Проанализировать каждый файл/группу файлов из upstream‑шаблона и принять решение: shared‑пакет, app‑код, admin‑слой, или игнор.
- Обеспечить работу через `payload-dev` и перенос стабильного результата в `payload-core`.

## Prerequisites
- Канон фасада и overrides: `docs/development/01-app-facade.md`.
- Канон dev‑процесса: `docs/development/02-payload-dev-workbench.md`.
- Runbook обработки upstream‑файлов: `docs/runbooks/runbook-upstream-templates.md`.
- Runbook по UI‑слоям: `docs/runbooks/ui-layer-development.md`.
- Полный список файлов upstream‑шаблона: `docs/research/templates/payload-website/upstream-payload-website.tree.json`.
- Проект‑трекер: `docs/research/templates/payload-website/processing-project.md`.
- Детальный прогресс: `docs/research/templates/payload-website/processing-progress.md`.

## Inputs
- `upstream/payload/templates/website/**` (оригиналы не правим).
- `docs/research/templates/payload-website/upstream-payload-website.tree.json` (источник истины по файлам).

## Output artifacts
- Заполненный трекер: `docs/research/templates/payload-website/processing-project.md`.
- Детальный журнал решений: `docs/research/templates/payload-website/processing-progress.md`.
- Shared‑пакеты: `packages/ui`, `packages/cms-blocks`, `packages/cms-fields`, `packages/utils` (по решению).
- App‑обёртки: `apps/<site>/src/ui/*`, `apps/<site>/src/admin-ui/*`, `apps/<site>/src/blocks/*/config.ts`, `apps/<site>/src/fields/*`.

## Steps

### 0) Инициализация проекта
1. Проверить наличие актуального tree‑файла.
2. Открыть/создать записи в `processing-project.md` (категории, статусы, владельцы).
3. Завести таблицу в `processing-progress.md` (построчные решения по файлам/папкам).
4. Зафиксировать порядок обработки групп файлов (см. шаг 2).

### 1) Исследовательский проход (классификация)
1. Разбить upstream‑файлы на группы:
   - App routes и layout (`src/app/**`).
   - Blocks (`src/blocks/**`).
   - Components (`src/components/**`, включая `components/ui`).
   - Collections/Globals/Fields/Hooks/Plugins (`src/collections`, `src/fields`, `src/hooks`, `src/plugins`, `src/Footer`, `src/Header`, `src/heros`).
   - Utilities/Providers/Search/Endpoints (`src/utilities`, `src/providers`, `src/search`, `src/endpoints`).
   - Admin‑компоненты (`src/components/Before*`, `AdminBar`, `app/(payload)`).
   - Конфиги/инфра (root‑уровень: `next.config.js`, `tailwind.config.mjs`, `package.json`, и т.д.).
   - Assets/tests (`public/**`, `tests/**`).
2. Для каждой группы решить: **shared‑пакет**, **app‑локально**, **admin‑слой**, **игнор**.
3. Записать решения и причины в `processing-project.md` и `processing-progress.md`.
4. Сверять решения с генераторами (`turbo/generators/config.ts`) и оценивать их корректность:
   - если шаблоны не совпадают с каноном — фиксировать пробелы и предлагать корректные правки;
   - если обнаружены архитектурные проблемы генераторов — описать их и предложить исправления;
   - цель: минимальные изменения upstream‑шаблона при максимальном соответствии истинной цели.

### 2) Подготовка инфраструктуры shared‑слоя
1. Убедиться, что фасады `@/ui/*` и `@/admin-ui/*` закреплены в apps.
2. Сформировать базовые shared‑контуры:
   - `packages/ui` (компоненты + `styles.css`),
   - `packages/cms-blocks`,
   - `packages/cms-fields`,
   - `packages/utils` (если утилиты универсальны).
3. Зафиксировать правила: admin‑слой отдельно; app‑код не импортирует shared напрямую.

### 3) Последовательная обработка групп файлов
Обрабатывать группы по очереди, фиксируя результат в трекере.

#### 3.1 Blocks
1. Взять блоки из `src/blocks/**`.
2. Вынести schema в `packages/cms-blocks` по канону слоя 2.
3. Оставить renderer/registry в app.
4. Создать wrapper‑файлы в `apps/*/src/blocks/*/config.ts`.

#### 3.2 UI components
1. Вынести базовые UI‑компоненты из `src/components/ui/**` в `packages/ui`.
2. Обновить app‑импорты на `@/ui/*`.
3. Проверить tokens/variants/slots по канону слоя 1.

#### 3.3 App components / modules
1. Компоненты page‑уровня (`src/components/**` вне `ui`) оставить в app, если они доменные.
2. Если компонент повторяется и универсален — вынести в shared‑пакет и подключить через фасад.

#### 3.4 Collections / Globals / Fields / Hooks
1. Вынести reusable поля в `packages/cms-fields`.
2. Вынести reusable blocks‑schema в `packages/cms-blocks`.
3. Оставить доменные collection configs в app.

#### 3.5 Utilities / Providers / Search / Endpoints
1. Универсальные утилиты вынести в `packages/utils`.
2. Providers/Theme оставить app‑локально, если завязаны на дизайн/бренд.
3. Endpoints/seed — оставить app‑локально (возможны overrides).

#### 3.6 Admin UI
1. Общие admin‑компоненты вынести в shared‑пакет.
2. Подключать в app через `@/admin-ui/*` и import map.

#### 3.7 Конфиги и инфраструктура
1. Конфиги (Next, Tailwind, ESLint, TS) анализируются на предмет shared‑настроек.
2. Общие настройки — в `packages/*` или root‑конфигах monorepo (по решению).

### 4) Проверка в `payload-dev`
1. Локально: `pnpm --filter @synestra/payload-core dev`.
2. В кластере: smoke‑проверка `/` и `/admin` на `https://payload.dev.synestra.tech`.
3. Фиксировать результаты в трекере.

### 5) Перенос в `payload-core`
1. После стабилизации переносим/фиксируем результат в `apps/payload-core`.
2. Только затем — перенос в доменные приложения.

### 6) Закрытие этапа
1. Закрыть обработанные группы в трекере.
2. Зафиксировать найденные пробелы/правки в runbook’ах.

## Validation
- `upstream/payload/templates/website/**` не изменён.
- В app‑коде все UI‑импорты идут через `@/ui/*`.
- Admin‑компоненты подключаются через `@/admin-ui/*`.
- В `processing-project.md` отражены решения и статус всех групп/файлов.
- `payload-dev` не имеет регрессий по `/` и `/admin`.

## Rollback / cleanup
- Откатить изменения через Git.
- Убедиться, что трекер обновлён корректно.

## References
- `docs/runbooks/runbook-upstream-templates.md`
- `docs/runbooks/ui-layer-development.md`
- `docs/research/templates/payload-website/upstream-payload-website.tree.json`
