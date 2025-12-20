# Troubleshooting разработки

## Быстрые проверки UI‑канона

- Поиск прямых импортов shared UI в app:
  - `rg \"from '@synestra/ui\" apps/<site>/src -S`

## `payload.dev.synestra.tech` не открывается

Проверить:
- Ingress host в `web-payload-dev`
- секреты `web-payload-dev-env` / `web-payload-dev-s3-env`
- состояние приложения в ArgoCD: `web-payload-dev`

## Медиа в dev не совпадает с prod

Канон: mirror job делает копирование бакетов (отдельные mirror‑креды).
См. runbook: `docs/runbooks/runbook-media-refresh-dev-from-prod.md`

