# Dev‑окружения: домены, namespaces и соглашения

## Канон доменов

База:
- prod: `sitename.synestra.io`
- dev: `sitename.dev.synestra.tech`

Исключение:
- для корневых доменов вида `synestra.io` dev может быть `dev.synestra.io`

Источники канона:
- `docs/architecture/canon-v0.md`
- `docs/runbooks/runbook-platform-integration.md`

## Канон namespaces

- namespace: `web-<app>-<env>`
- dev примеры: `web-payload-dev`, `web-synestra-io-dev`
- prod примеры: `web-payload-core`, `web-synestra-io-prod`

## Dev в кластере: ArgoCD + Okteto

Канон:
- dev‑приложения должны быть “мягкими” для Okteto: `selfHeal: false`
- namespace для dev создаётся через Okteto (ownership), ArgoCD не должен пересоздавать namespace

Runbook:
- `docs/runbooks/runbook-okteto-dev.md`

