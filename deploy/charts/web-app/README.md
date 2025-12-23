# Helm chart: `web-app`

Базовый Helm chart для деплоя **одного** Next.js + Payload приложения.

Ключевые принципы (GitOps):
- chart не содержит plaintext‑секретов;
- один release ↔ один namespace ↔ один deployment;
- БД — Postgres под управлением CloudNativePG (CNPG):
  - **канон по умолчанию**: platform-managed DB в namespace `databases` (тогда `postgres.enabled=false`);
  - допустимая альтернатива (POC): per-namespace DB, когда chart создаёт CNPG Cluster в namespace приложения (`postgres.enabled=true`).

Что покрывает:
- `Deployment` / `Service` / `Ingress`
- `PVC` для uploads (`public/media`) — важно для шаблонов Payload
- `postgresql.cnpg.io/Cluster` (опционально; включён по умолчанию)
- `Job` для миграций с ArgoCD hook (опционально; включён по умолчанию)

TLS по умолчанию:
- chart по умолчанию включает `ingressClassName: traefik` и Traefik‑аннотации `router.entrypoints=websecure` + `router.tls=true` (см. `deploy/charts/web-app/values.yaml`);
- в кластере Synestra Traefik использует `TLSStore default` с wildcard‑сертификатами (на стороне `synestra-platform`), поэтому для большинства хостов `ingress.tls` можно не задавать;
- важно: `Ingress.spec.tls[].secretName` не может ссылаться на Secret из другого namespace → поэтому мы и опираемся на `TLSStore default`, а не на per‑namespace TLS secrets.

HTTP → HTTPS:
- если нужно принудительно редиректить HTTP на HTTPS, включите `ingress.redirectToHttps=true`;
- chart создаст дополнительный HTTP Ingress + Traefik Middleware `redirectScheme` (https).

Где смотреть шаблоны:
- `deploy/charts/web-app/templates/_README.md`

Где задаются секреты:
- `envFrom.secretRef` — имя Secret (создаётся в `synestra-platform` через SOPS).

## Payload Admin UI и import map (важно для деплоя)

Payload Admin кастомизируется через **component paths + import map**. Это влияет на сборку образа:

- если приложение использует custom components для админки, в pipeline сборки образа необходимо выполнять:
  - `payload generate:importmap`
  - (обычно) `payload generate:types`
- сами компоненты админки рекомендуется держать отдельно от frontend‑UI (см. `docs/architecture/component-system.md`).

Где описан контракт env vars:
- `docs/architecture/env-contract.md`

Где описан канон по БД (CNPG):
- `docs/architecture/database-cnpg.md`

Связанные документы:
- `docs/runbooks/runbook-dev-deploy-corporate.md` — как делаем первый dev‑деплой.
- `docs/research/templates/payload-website.md` — почему нужен PVC для media и как устроены env vars.
