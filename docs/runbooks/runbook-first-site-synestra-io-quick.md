# runbook-first-site-synestra-io-quick.md

Runbook: старт разработки **первого сайта (`synestra-io`)** так, чтобы сразу работали:
- `dev` сайт (hot‑dev через Okteto),
- доставка в `prod` через CI + GitOps (promotion).

## 1) Подготовить платформу (один раз)

См. `docs/runbooks/runbook-platform-integration.md`.

Критичные пункты:
- DNS и ingress настроены для `dev.synestra.io` и `synestra.io` (указывают на Traefik LB);
- ArgoCD видит репозиторий `web-core`;
- в `synestra-platform` создан root Application для `web-core` (app‑of‑apps).

## 2) Подготовить секреты (dev + prod)

В `synestra-platform` (SOPS) создать секреты для namespace `web-synestra-io-dev` и `web-synestra-io-prod`:
- `gitlab-regcred` (если registry приватный)
- `web-synestra-io-<env>-env` (`PAYLOAD_SECRET`, `DATABASE_URI`, опционально `CRON_SECRET`, `PREVIEW_SECRET`)

База данных (канон: CNPG в namespace `databases`) настраивается отдельно:
- initdb secret: `secrets/databases/synestra-io-initdb-secret.yaml`
- CNPG clusters: `synestra-io-dev-cnpg` и `synestra-io-cnpg`
- ArgoCD apps (платформа): `infra-synestra-io-dev-db` и `infra-synestra-io-db`

Runbook: `docs/runbooks/runbook-database-cnpg.md`.

## 3) Включить GitOps apps (dev + prod)

В `web-core` должны быть:
- values:
  - `deploy/env/release-dev/synestra-io.yaml`
  - `deploy/env/release-prod/synestra-io.yaml`
  - `deploy/env/dev/synestra-io.yaml`
  - `deploy/env/prod/synestra-io.yaml`
- ArgoCD Applications:
  - `deploy/argocd/apps/dev/synestra-io.yaml`
  - `deploy/argocd/apps/prod/synestra-io.yaml`

После появления root Application `web-core` в ArgoCD, эти Applications должны появиться автоматически.

## 4) Настроить CI: build → update release → rollout

См. `docs/runbooks/runbook-ci-dev-to-prod.md`.

Минимально:
- CI собирает образ `synestra-io` из монорепы (рекомендуем `turbo prune` + `docker/Dockerfile.turbo`);
- пушит в registry;
- обновляет `deploy/env/release-dev/synestra-io.yaml` (dev release);
- после проверки делает promotion в `deploy/env/release-prod/synestra-io.yaml`.

## 5) Hot‑dev через Okteto

См. `docs/runbooks/runbook-okteto-dev.md`.

Рекомендация: запускать Okteto поверх `web-synestra-io-dev` (а не в общем namespace), чтобы сохранить изоляцию “namespace+БД”.

## 6) Референсный отчёт (что уже сделано)

Если нужен полный контекст по реальным изменениям для `synestra-io` (dev+prod):
- `docs/runbooks/runbook-first-site-synestra-io.md`

## 7) Начать разработку “как конструктор” (Payload blocks)

Цель следующего этапа — развивать `synestra-io` “как конструктор” и постепенно выносить блоки в `packages/cms-blocks`:
- `Pages` collection с `layout` (blocks)
- `Hero`, `RichText`, `CTA`, … как блоки
- рендер блоков на фронте

Референс:
- `templates/payload/website`
- `upstream/payload/templates/website` (reference only; не деплоить как есть)
- runbook: `docs/runbooks/runbook-add-app-from-payload-template.md` (про перенос шаблона в `apps/*` и выделение общего в `packages/*`).
