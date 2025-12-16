# `docs/runbooks`

Операционные инструкции (“как сделать X”).

Сейчас:
- `docs/runbooks/runbook-dev.md` — локальная разработка (multi-app)
- `docs/runbooks/runbook-dev-deploy-corporate.md` — план первого dev‑деплоя corporate в k8s/ArgoCD
- `docs/runbooks/runbook-okteto-dev.md` — Okteto dev‑режим поверх ArgoCD‑деплоя (под монорепу)
- `docs/runbooks/runbook-dev-prod-flow.md` — схема dev+prod на старте (hot dev → git → auto prod → reset dev)
- `docs/runbooks/runbook-platform-integration.md` — что нужно в `synestra-platform`, чтобы подключить `web-core`
- `docs/runbooks/runbook-ci-dev-to-prod.md` — CI контракт: build image → update release values → ArgoCD rollout
- `docs/runbooks/runbook-database-cnpg.md` — как добавлять/сопровождать БД Postgres через CNPG (CloudNativePG) для новых web‑приложений
- `docs/runbooks/runbook-db-refresh-dev-from-prod.md` — как синхронизировать dev‑БД с prod‑БД (refresh/clone)
- `docs/runbooks/runbook-payload-bootstrap-from-zero.md` — как поднять Payload+Postgres “с нуля”, чтобы БД детерминированно инициализировалась через миграции
- `docs/runbooks/runbook-first-site-corporate.md` — чеклист старта первого сайта (dev hot + авто prod)
- `docs/runbooks/runbook-first-site-synestra-io.md` — bootstrap `synestra.io` + `dev.synestra.io` (что сделано и почему)
- `docs/runbooks/runbook-synestra-io-release-promotion.md` — привести `synestra.io`/`dev.synestra.io` к канону promotion (release-dev → release-prod)
- `docs/runbooks/runbook-add-app-from-payload-template.md` — как добавить новый app из официального Payload template
