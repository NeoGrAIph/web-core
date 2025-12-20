# Проект: обработка Payload Website template (upstream → web-core)

## Истинная цель проекта
Создать устойчивую и переиспользуемую компонентную платформу на Payload CMS 3 + Next.js, чтобы собирать новые сайты из shared‑компонентов/схем без форков, с точечными overrides (`@/ui/*`, `@/admin-ui/*`) и стабильным переносом изменений через `payload-dev` → `payload-core`.

## Метод достижения
Пошагово обработать файлы официального шаблона Payload Website и привести их к канону `web-core` (shared‑пакеты + фасады + admin‑слой), без изменений в `upstream/`.

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
1) Классификация файлов по группам.
2) Подготовка shared‑контуров.
3) Извлечение блоков, UI‑компонентов, схем и утилит.
4) Проверка в `payload-dev`.
5) Перенос в `payload-core` как эталон.

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

## Статусы
- `pending` — не начато
- `in_progress` — в работе
- `done` — завершено
- `blocked` — требует решения/зависимости
