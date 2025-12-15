# runbook-first-site-corporate.md

Runbook: старт разработки **первого сайта (corporate)** так, чтобы сразу работали:
- `dev` сайт (hot‑dev через Okteto),
- автоматическая доставка в `prod` через CI + GitOps.

## 1) Подготовить платформу (один раз)

См. `docs/runbooks/runbook-platform-integration.md`.

Критичные пункты:
- DNS wildcard’и `*.dev.synestra.tech` и `*.synestra.io` указывают на Traefik LB.
- ArgoCD видит репозиторий `web-core`.
- В `synestra-platform` создан root Application для `web-core` (app‑of‑apps).

## 2) Подготовить секреты (dev + prod)

В `synestra-platform` (SOPS) создать секреты для namespace `web-corporate-dev` и `web-corporate-prod`:
- `gitlab-regcred` (если registry приватный)
- `web-corporate-<env>-env` (PAYLOAD_SECRET, DATABASE_URI, …)
- `web-corporate-<env>-db-init` (bootstrap для CNPG, если используем)

## 3) Включить GitOps apps (dev + prod)

В `web-core` уже есть:
- values:
  - `deploy/env/release-dev/corporate.yaml`
  - `deploy/env/release-prod/corporate.yaml`
  - `deploy/env/dev/corporate.yaml`
  - `deploy/env/prod/corporate.yaml`
- ArgoCD Applications:
  - `deploy/argocd/apps/dev/corporate.yaml`
  - `deploy/argocd/apps/prod/corporate.yaml`

После появления root Application `web-core` в ArgoCD, эти Applications должны появиться автоматически.

## 4) Настроить CI: build → update release → rollout

См. `docs/runbooks/runbook-ci-dev-to-prod.md`.

Минимально нужно:
- научить CI собирать образ corporate из монорепы (рекомендуем `turbo prune` + `docker/Dockerfile.turbo`);
- пушить образ в registry;
- обновлять `deploy/env/release-dev/corporate.yaml` (dev release),
- после проверки делать promotion в `deploy/env/release-prod/corporate.yaml`.

## 5) Hot‑dev через Okteto

См. `docs/runbooks/runbook-okteto-dev.md`.

Рекомендация: запускать Okteto поверх `web-corporate-dev` (а не в общем `web-dev`), чтобы сохранить изоляцию “namespace+DB”.

## 6) Начать разработку “как конструктор” (Payload blocks)

Цель следующего этапа — перенести базовую структуру из Payload template `website` в `apps/corporate-website` и вынести блоки в `packages/cms-blocks`:
- `Pages` collection с `layout` (blocks)
- `Hero`, `RichText`, `CTA`, … как блоки
- рендер блоков на фронте

Референс:
- `upstream/payload/templates/website` (не деплоить как есть)
- runbook: `docs/runbooks/runbook-add-app-from-payload-template.md` (про перенос шаблона в `apps/*` и выделение общего в `packages/*`).
