# AGENTS (web-core)

Этот файл дополняет корневой `../AGENTS.md` и применяется ко всем поддиректориям `web-core`.

## Цели
- Построить переиспользуемый UI‑слой, независимый от Tailwind‑мажора и без форков shared‑кода.
- Обеспечить сборку страниц из Payload Blocks через типизированный registry и единый подход к schema/renderer.
- Гарантировать предсказуемые overrides через фасад (`@/ui/*`) и отдельный слой админки (`@/admin-ui/*`).
- Делать изменения через `payload-dev` и переносить стабильный результат в `payload-core` как эталон.

## Правила работы
- Шаблоны Payload CMS 3 храним нетронутыми в `upstream/payload/templates/{website,ecommerce}`; копируем файлы наружу для анализа/экстракции, оригиналы не правим.
- Копию upstream‑шаблона для анализа держим в `for_cute/**` и **можем редактировать** её как рабочую копию (вырезать/переносить содержимое, перемещать файлы целиком, если подходят).
- Источник правды для экстракции — `for_cute/**`; `upstream/**` используем только для сверки.
- Модули формируем **из существующих файлов**, стараясь сохранять **наименование типовых файлов и их взаимное расположение** (если это возможно).
- Перед началом работ **последовательно анализируем каждый файл** и фиксируем выводы в `docs/research/templates/payload-website/processing-progress.md`.
- Каждый новый модуль обязан иметь `README.md` с подробной документацией (назначение, API, зависимости, связи с исходными файлами).
- Для каждого файла фиксируем путь‑источник (из `for_cute/**`) и, если структуру пришлось менять, причину.
- В `docs/research/templates/payload-website/processing-project.md` ведём **живой список планируемых модулей** и обновляем его по мере анализа.
- UI импортируем через фасад `@/ui/*`; прямые импорты `@synestra/ui/*` в app‑коде запрещены (см. `docs/development/01-app-facade.md`).
- Слой админки строго отделён от фронтового UI: кастомные admin‑компоненты подключаем через `@/admin-ui/*` + import map Payload; в фасад `@/ui/*` ничего админского не кладём.
- Shared‑изменения обкатываем на `payload-dev` (`apps/payload-core`) перед переносом в доменные приложения (`docs/development/02-payload-dev-workbench.md`, `04-workflow-shared-changes.md`).
- Публикуем локальные overrides только на уровне приложений (`apps/<site>/src/ui/*`), не в shared‑пакетах.
- Канон разработки: работаем и проверяем изменения в `payload-dev`, стабильный результат переносим в `payload-core`.
- Перед выполнением любой процедуры ознакомьтесь с релевантными runbook и следуйте им; если обнаружены неточности/пробелы — уведомите об этом и предложите проверенную, корректную и достаточную правку.

## Runbooks (web-core)
- `docs/runbooks/runbook-database-cnpg.md` — добавление Postgres через CloudNativePG для нового приложения (dev/prod, секреты и ArgoCD apps).
- `docs/runbooks/runbook-db-refresh-dev-from-prod.md` — refresh dev‑БД из prod (CNPG backup/recovery или pg_dump).
- `docs/runbooks/runbook-dev-prod-flow.md` — модель dev/prod, promotion и GitOps‑контракт (release‑слой и env‑слой).
- `docs/runbooks/runbook-env-contract.md` — контракт env vars и правила валидации (без plaintext‑секретов).
- `docs/runbooks/runbook-media-migrate-to-object-storage.md` — перенос media из PVC в object storage (S3/MinIO).
- `docs/runbooks/runbook-media-refresh-dev-from-prod.md` — синхронизация dev media из prod (PVC/объектное хранилище).
- `docs/runbooks/runbook-okteto-refresh-buttons.md` — обновление “refresh buttons” для dev окружений.
- `docs/runbooks/runbook-payload-bootstrap-from-zero.md` — bootstrap Payload приложения с нуля (инфра + deploy).
- `docs/runbooks/runbook-payload-seeding.md` — seed/defaultValue и правила изменения schema (операционный канон).
- `docs/runbooks/runbook-payload-migrations.md` — канон миграций Payload (Postgres, GitOps job).
- `docs/runbooks/runbook-platform-integration.md` — интеграция web‑core с платформой (ArgoCD, secrets, namespaces).
- `docs/runbooks/runbook-upstream-templates.md` — обработка файлов официальных шаблонов Payload (копирование, анализ, extraction).
- `docs/runbooks/runbook-upstream-website-processing-project.md` — проектная обработка Payload Website template (пошаговый план + трекер).
- `docs/runbooks/ui-layer-development.md` — поэтапная разработка UI‑слоёв 1–3 (tokens, blocks registry, overrides).

## Проект (Payload Website upstream → web-core)
- Цель проекта: создать устойчивую и переиспользуемую компонентную платформу на Payload CMS 3 + Next.js, чтобы собирать новые сайты из shared‑компонентов/схем без форков, с точечными overrides (`@/ui/*`, `@/admin-ui/*`) и стабильным переносом изменений через `payload-dev` → `payload-core`.
- Метод достижения: последовательная обработка официального шаблона `website` (upstream) с выделением shared‑компонентов/схем и фиксацией решений.
- Инструкция: следовать `docs/runbooks/runbook-upstream-website-processing-project.md` и фиксировать прогресс в `processing-project.md` + `processing-progress.md`.

### Проектные артефакты
- `docs/research/templates/payload-website/upstream-payload-website.tree.json` — полный перечень файлов upstream‑шаблона website.
- `docs/research/templates/payload-website/processing-project.md` — трекер этапов и групп обработки.
- `docs/research/templates/payload-website/processing-progress.md` — детальные записи по каждому файлу/папке.

## Okteto
- Dev/prod стенды Payload развёрнуты в Okteto: `https://payload.dev.synestra.tech` и `https://payload.services.synestra.tech`.
- Операционные шаги, доступы и инфраструктура описаны в `../synestra-platform/docs/runbooks/okteto.md` (читать оттуда).
- Полный конспект Okteto — `../synestra-platform/docs/wiki/okteto.md` (раздел 10). В `web-core/docs` отдельных заметок нет.
