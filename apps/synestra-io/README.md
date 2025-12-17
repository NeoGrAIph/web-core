# `apps/synestra-io`

Основной сайт Synestra: `synestra.io` (prod) и `dev.synestra.io` (dev).

Основание: Payload template `website` (референс): `templates/payload/website/`.

## Назначение

- “Точка входа” для `synestra.io` (frontend + админка Payload).

## Важные требования из шаблона `website`

1) **Env vars**
- Обязательные для `stage/prod`: `SYNESTRA_ENV`, `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`.
- Для **share preview** (внешние ссылки на черновики без логина): `PREVIEW_SECRET` (обязателен в `stage/prod`).
- Опциональные: `CRON_SECRET`.
Контракт описан в `.env.example` и в `docs/architecture/env-contract.md` (шаблонные детали — в `docs/research/templates/payload-website.md`).

2) **Storage**
- Uploads по умолчанию пишутся в `public/media` → в k8s нужен PVC или object storage.

3) **Миграции**
- При Postgres миграции должны выполняться детерминированно (предпочтительно Job с ArgoCD hook).
См. `docs/runbooks/runbook-dev-deploy-corporate.md`.

## Preview / Live Preview (Payload Admin)

В коллекциях `Pages` и `Posts` включены:

- **Live Preview** (для редакторов): требует логин в админке, включает Draft Mode через `/next/preview` и показывает страницу в режиме “черновик + autosave”.
- **Preview (share link)** (для внешних клиентов): генерирует ссылку вида `/next/share-preview#token=...` (TTL 7 дней). Токен лежит в `#fragment` и не попадает в querystring/логи; затем выполняется exchange (`POST /next/share-preview/exchange`) и включается Draft Mode cookie.

## Локальная разработка

- `pnpm --filter @synestra/synestra-io dev`
- Пример env vars: `apps/synestra-io/.env.example`
