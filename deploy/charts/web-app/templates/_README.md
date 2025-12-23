# Шаблоны Helm chart `web-app`

Эта папка содержит **исходные Helm templates**, из которых собираются Kubernetes‑манифесты для деплоя одного приложения (Next.js + Payload).

> Важно: chart намеренно **не** содержит plaintext‑секретов. Секреты создаются в `synestra-platform`, а здесь мы используем только ссылки на Secret names/keys через `envFrom.secretRef` и значения в `deploy/env/**`.

## Список шаблонов

- `_helpers.tpl` — общие функции для имён/лейблов.
- `deployment.yaml` — `Deployment` приложения (образ, env, `envFrom`, PVC‑mount для media).
- `service.yaml` — `Service` (ClusterIP по умолчанию).
- `ingress.yaml` — `Ingress` (hosts/paths/tls).
- `ingress-redirect.yaml` — HTTP Ingress для редиректа на HTTPS (Traefik middleware).
- `middleware-redirect-https.yaml` — Traefik Middleware `redirectScheme` (https).
- `pvc-media.yaml` — `PersistentVolumeClaim` для `public/media` (актуально для Payload templates).
- `cnpg-cluster.yaml` — `postgresql.cnpg.io/Cluster` (CloudNativePG), опционально (включается `values.postgres.enabled`).
- `migrations-job.yaml` — `Job` для миграций Payload как ArgoCD hook (опционально, `values.migrations.enabled`).

Примечание: если app использует Payload Admin custom components, import map должен быть сгенерирован на этапе сборки образа (см. `deploy/charts/web-app/README.md`).

## Где настраивать

- Базовые defaults: `deploy/charts/web-app/values.yaml`.
- Значения окружений/деплоев: `deploy/env/<env>/<app>.yaml` (например `deploy/env/dev/corporate.yaml`).
- ArgoCD Application’ы, которые указывают values: `deploy/argocd/apps/<env>/*.yaml`.

## Связанные документы

- `deploy/charts/web-app/README.md` — назначение chart и ключевые принципы.
- `docs/runbooks/runbook-dev-deploy-corporate.md` — пошаговый dev‑деплой corporate.
