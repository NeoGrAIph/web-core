# Runbook: обработка файлов официальных шаблонов Payload

## Purpose
Определить безопасный и повторяемый процесс работы с файлами официальных шаблонов Payload CMS 3, чтобы извлекать компоненты и не изменять оригиналы.

## Goals
- Сохранять `upstream/payload/templates/*` в исходном виде.
- Выделять общие компоненты и схемы в shared‑пакеты.
- Подключать extracted‑компоненты через фасад `@/ui/*` и `@/admin-ui/*`.

## Prerequisites
- Доступ к репозиторию `web-core`.
- Понимание фасада `@/ui/*` и overrides (`docs/development/01-app-facade.md`).
- Канон dev‑процесса: работаем на `payload-dev`, стабильный результат переносим в `payload-core` (`docs/development/02-payload-dev-workbench.md`).
- Официальные шаблоны находятся в `upstream/payload/templates/{website,ecommerce}`.

## Steps
1) **Выбрать источник**
   - Определить, какой шаблон нужен: `website` или `ecommerce`.
   - Найти конкретный файл для анализа в `upstream/payload/templates/*`.

2) **Скопировать файл для анализа**
   - Скопировать файл в рабочую зону (обычно `apps/payload-core/...`).
   - Оригинал в `upstream/` не изменять.

3) **Разобрать на уровни**
   - UI‑компоненты → кандидаты в `packages/ui`.
   - CMS schema/fields → кандидаты в `packages/cms-*`.
   - Admin UI элементы → кандидаты в `packages/*` и подключение через `@/admin-ui/*`.

4) **Подключить через фасад**
   - В app создавать wrapper‑файлы `apps/<site>/src/ui/*` (re-export по умолчанию).
   - Для админки — `apps/<site>/src/admin-ui/*`.

5) **Проверить в `payload-dev`**
   - Локально: `pnpm --filter @synestra/payload-core dev`.
   - В кластере: `https://payload.dev.synestra.tech` (smoke `/` и `/admin`).

6) **Перенести в `payload-core`**
   - После стабилизации закрепить изменения в `apps/payload-core`.
   - Только затем переносить в доменные приложения (`apps/synestra-io` и др.).

## Validation
- В `upstream/payload/templates/*` нет изменений.
- App‑код импортирует UI только из `@/ui/*`.
- Админские компоненты подключены через `@/admin-ui/*`.
- `payload-dev` не имеет регрессий по `/` и `/admin`.

## Rollback / cleanup
- Откатить изменения в app/shared‑пакетах через Git.
- Убедиться, что оригиналы в `upstream/` остались без изменений.

## References
- `docs/development/01-app-facade.md`
- `docs/development/02-payload-dev-workbench.md`
- `docs/development/04-workflow-shared-changes.md`
