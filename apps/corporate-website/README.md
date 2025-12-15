# `apps/corporate-website`

Корпоративный сайт Synestra (Next.js + Payload).

Основание:
- Payload template `website` (референс): `upstream/payload/templates/website`
- Конспект/риски/контракт env vars: `docs/research/templates/payload-website.md`

## Назначение

- “Точка входа” для корпоративного сайта (frontend + админка Payload).
- Должен деплоиться отдельно как `web-corporate-dev` (и позже stage/prod).

## Важные требования из шаблона `website`

1) **Env vars**
- Обязательные для `stage/prod`: `SYNESTRA_ENV`, `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`.
- Опциональные (но типично нужны): `CRON_SECRET`, `PREVIEW_SECRET`.
Контракт описан в `.env.example` и в `docs/architecture/env-contract.md` (шаблонные детали — в `docs/research/templates/payload-website.md`).

2) **Storage**
- Uploads по умолчанию пишутся в `public/media` → в k8s нужен PVC или object storage.

3) **Миграции**
- При Postgres миграции должны выполняться детерминированно (предпочтительно Job с ArgoCD hook).
См. `docs/runbooks/runbook-dev-deploy-corporate.md`.

## Локальная разработка

- `pnpm --filter @synestra/corporate-website dev`
- Пример env vars: `apps/corporate-website/.env.example`

## Деплой (GitOps)

- Values: `deploy/env/dev/corporate.yaml`
- ArgoCD Application: `deploy/argocd/apps/dev/corporate.yaml`
