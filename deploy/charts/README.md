# `deploy/charts/`

Здесь лежат базовые Helm chart’ы для деплоя приложений из `apps/*`.

## Что есть сейчас

- `deploy/charts/web-app` — типовой chart для Next.js + Payload приложения:
  - Deployment / Service / Ingress
  - PVC для media uploads (`public/media`)
  - CNPG Cluster (опционально)
  - Job для миграций (опционально; ArgoCD hook)

## Правила

- В chart’ах **нет** plaintext‑секретов.
- Chart’ы должны быть максимально переиспользуемыми между `corporate/shop/saas/landings`.
- Любые требования, выявленные в официальных шаблонах Payload (env vars, migrations, storage), должны отражаться в values и README.

