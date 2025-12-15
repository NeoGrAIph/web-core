# Helm chart: `web-app`

Базовый Helm chart для деплоя **одного** Next.js + Payload приложения.

Ключевые принципы (GitOps):
- chart не содержит plaintext‑секретов;
- один release ↔ один namespace ↔ один deployment;
- БД разворачивается отдельно на namespace (CNPG Cluster), по умолчанию включена в chart (можно отключить).

Что покрывает:
- `Deployment` / `Service` / `Ingress`
- `PVC` для uploads (`public/media`) — важно для шаблонов Payload
- `postgresql.cnpg.io/Cluster` (опционально; включён по умолчанию)
- `Job` для миграций с ArgoCD hook (опционально; включён по умолчанию)

TLS по умолчанию:
- chart по умолчанию включает `ingressClassName: traefik` и Traefik‑аннотации `router.entrypoints=websecure` + `router.tls=true` (см. `deploy/charts/web-app/values.yaml`);
- в кластере Synestra Traefik использует `TLSStore default` с wildcard‑сертификатами (на стороне `synestra-platform`), поэтому для большинства хостов `ingress.tls` можно не задавать;
- важно: `Ingress.spec.tls[].secretName` не может ссылаться на Secret из другого namespace → поэтому мы и опираемся на `TLSStore default`, а не на per‑namespace TLS secrets.

Где смотреть шаблоны:
- `deploy/charts/web-app/templates/README.md`

Где задаются секреты:
- `envFrom.secretRef` — имя Secret (создаётся в `synestra-platform` через SOPS).

Где описан контракт env vars:
- `docs/architecture/env-contract.md`

Связанные документы:
- `docs/runbooks/runbook-dev-deploy-corporate.md` — как делаем первый dev‑деплой.
- `docs/research/templates/payload-website.md` — почему нужен PVC для media и как устроены env vars.
