# web-core

Репозиторий с исходным кодом веб‑приложений Synestra и артефактами для их GitOps‑деплоя.

## Назначение
- Хранит код приложений (включая Payload/Next.js).
- Содержит Helm‑чарт для типового деплоя одного приложения.
- Держит окруженческие values, которые используются Argo CD из `synestra-platform`.

## Текущее состояние
- Основное приложение: `apps/synestra-io` (Payload CMS 3 Ecommerce template, Postgres (CNPG) + S3).
- Helm‑чарт: `deploy/charts/web-app` — базовый чарт для деплоя одного Next.js + Payload приложения.
- Values для окружений (dev/prod/release): `deploy/env/*` — используются как источники values в Argo CD.
- Источники шаблонов: `upstream/payload/templates/*` — зеркала шаблонов Payload.
- Архив/история: `old/` — предыдущие версии приложений и эксперименты.

## Структура
- `apps/` — исходники приложений
  - `apps/synestra-io` — текущий сайт Synestra
  - `apps/synestra-io/public/` — статические ассеты (включая `nnmclub_to-new_year/` и `nnmstatic/`)
- `deploy/`
  - `deploy/charts/web-app` — Helm‑чарт
  - `deploy/env/` — values для dev/prod/release
  - `deploy/argocd/` — примеры/история приложений Argo CD (не основной источник)
  - `deploy/jobs/` — одноразовые утилитарные Job’ы
- `upstream/` — зеркала внешних репозиториев/шаблонов
- `old/` — исторические версии
- `docs/` — внутренняя документация
- `.okteto/` — dev‑манифесты для hot‑режима поверх dev‑окружения

## Как это связано с GitOps
GitOps‑источник правды — репозиторий `synestra-platform`. Он подтягивает:
- Helm‑чарт из `deploy/charts/web-app`;
- values из `deploy/env/*` этого репозитория через `values`‑ref в Argo CD.

Этот репозиторий предназначен для кода приложения и артефактов, необходимых для сборки образов.

## Release‑слои и образы
- `deploy/env/release-dev/<app>.yaml` — dev‑release (image tag).
- `deploy/env/release-prod/<app>.yaml` — prod‑release (image tag).
- Образы собираются в `synestra-platform` (CI), теги обновляются в release‑слоях.

## Dev‑режим (HMR)
- Dev использует `next dev` через Okteto; HMR включён.
- Файлы из `public/` не участвуют в HMR — изменения видны после жёсткого обновления страницы и/или сброса кеша браузера.

## План по dev‑процессу (установлен)
Для dev‑окружений принят и внедрён план Okteto‑разработки поверх ArgoCD‑деплоя:
- dev‑namespace создаётся через Okteto;
- baseline‑деплой делает ArgoCD;
- `okteto up` запускает `next dev` с синхронизацией кода в том же namespace.

Подробности — в `docs/runbooks/runbook-okteto-dev.md`.
