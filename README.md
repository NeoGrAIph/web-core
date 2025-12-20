# web-core

Монорепо для сайтов и сервисов на Payload CMS 3 + Next.js. Здесь живут приложения, shared‑пакеты UI/infra и GitOps‑артефакты для развёртывания.

## Что внутри
- `apps/payload-core` — сейчас **чистая копия** официального Payload Website template; планируется использовать как workbench/эталон после внедрения фасада и shared‑слоя.
- `apps/synestra-io` — тоже копия официального шаблона `website`; работа по созданию компонентов и override’ов ещё не начиналась.
- `packages/*` — shared‑пакеты (`ui`, `cms-*`, `env`, `utils`, конфиги).
- `deploy/` — GitOps/Helm‑артефакты для кластеров.
- `upstream/payload/templates/{website,ecommerce}` — непропатченные официальные шаблоны Payload CMS 3, используем как источник компонентов и best practices (оригиналы не правим).
- `docs/development` — канон разработки и рабочие инструкции.

## Структура и деплой (кратко)
- Монорепо для быстрой разработки, но деплой **независимый**: каждый сайт — отдельный deployment/namespace/БД.
- Окружения: стартуем с `dev` + `prod`, структура готова к `stage`.
- Секреты **никогда** не храним в `web-core`; только ссылки на Secret’ы из `synestra-platform`.
- Toolchain фиксируем в корне (`package.json`), задачи гоняем через Turborepo (`turbo.json`).
- Базовые версии: Payload `3.68.3`, Next.js `15.4.9` (обновляются осознанно).

## Ключевые принципы
- UI в приложениях импортируем только из фасада `@/ui/*`; shared‑реализации лежат в `@synestra/ui/*` и не импортируются напрямую (см. `docs/development/01-app-facade.md`).
- Изменения shared‑слоя обкатываем на `payload-dev` (`apps/payload-core`) перед переносом в доменные сайты (см. `docs/development/02-payload-dev-workbench.md` и `04-workflow-shared-changes.md`). ⚠️ Пока `apps/payload-core` ещё не доработан до эталона — это напрямую скопированный upstream‑шаблон `website`.
- Payload Admin кастомизации держим отдельно через `@/admin-ui/*`, подключаем через import map Payload; в `@/ui/*` админские компоненты не попадают.

## Как пользоваться upstream-шаблонами Payload CMS 3
1. Выбрать шаблон `website` или `ecommerce` в `upstream/payload/templates/*`.
2. Скопировать нужный файл из шаблона в рабочее место (обычно `apps/payload-core/...`) для детального анализа; сами файлы в `upstream/` остаются нетронутыми.
3. Выделить универсальные части в shared‑пакеты (`packages/ui`, `packages/cms-*`) и подключить их через фасад `apps/<site>/src/ui/*` согласно канону override’ов.
4. Проверить изменения на `payload-dev` (`pnpm --filter @synestra/payload-core dev`, затем `https://payload.dev.synestra.tech`), после стабилизации перенести в целевые приложения и добавить override‑файлы при необходимости.

## Окружения (Okteto)
- `https://payload.dev.synestra.tech` и `https://payload.services.synestra.tech` развёрнуты в Okteto.
- Операционные инструкции и инфраструктурные детали — в `../synestra-platform/docs/runbooks/okteto.md`.
- Конспект официальной документации Okteto — в `../synestra-platform/docs/wiki/okteto.md` (раздел 10).

## Быстрый старт
- Требования: Node ≥ 22, pnpm 10 (см. `package.json`).
- Установка зависимостей: `pnpm install`.
- Общий дев-сервер: `pnpm dev` (turbo запускает сервисы по таргетам).
- Workbench: `pnpm --filter @synestra/payload-core dev` для быстрой проверки shared‑компонентов.

## Документация
- `docs/development/README.md` — индекс dev‑доков.
- `docs/development/01-app-facade.md` — фасад `@/ui/*` и override’ы.
- `docs/development/02-payload-dev-workbench.md` — как пользоваться payload-core/payload-dev.
- `docs/development/04-workflow-shared-changes.md` — workflow для shared‑кода.
- `docs/development/05-troubleshooting.md` — типовые проверки.
