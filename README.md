# web-core

Репозиторий с исходным кодом веб‑приложений Synestra и базовыми артефактами для их деплоя.

## Назначение
- Хранит код приложений (включая Payload/Next.js).
- Содержит Helm‑чарт для типового деплоя одного приложения.
- Держит окруженческие values, которые используются GitOps‑репозиторием `synestra-platform`.

## Текущее состояние
- Основное приложение: `apps/synestra-io` (Payload CMS 3 Ecommerce template, адаптирован под Postgres и S3).
- Helm‑чарт: `deploy/charts/web-app` — базовый чарт для деплоя одного Next.js + Payload приложения.
- Values для окружений (dev/prod/release): `deploy/env/*` — используются как источники values в Argo CD.
- Источники шаблонов: `upstream/payload/templates/*` — зеркала шаблонов Payload.
- Архив/история: `old/` — предыдущие версии приложений и эксперименты.

## Структура
- `apps/` — исходники приложений
  - `apps/synestra-io` — текущий сайт Synestra
- `deploy/`
  - `deploy/charts/web-app` — Helm‑чарт
  - `deploy/env/` — values для dev/prod/release
  - `deploy/argocd/` — примеры/история приложений Argo CD (не основной источник)
  - `deploy/jobs/` — одноразовые утилитарные Job’ы
- `upstream/` — зеркала внешних репозиториев/шаблонов
- `old/` — исторические версии
- `docs/` — внутренняя документация

## Как это связано с GitOps
GitOps‑источник правды — репозиторий `synestra-platform`. Он подтягивает:
- Helm‑чарт из `deploy/charts/web-app`;
- values из `infra/web-core/...` (в `synestra-platform`).

Этот репозиторий предназначен для кода приложения и артефактов, необходимых для сборки образов.
