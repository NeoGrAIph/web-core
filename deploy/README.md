# deploy/

Эта директория — **истина GitOps** для деплоя приложений из `web-core` через Argo CD.

Принципы:

- В `web-core` **нет plaintext‑секретов**. В манифестах/values можно ссылаться на Secret names/keys, но сами Secret’ы создаются и хранятся в `~/synestra-platform` (SOPS).
- На старте поддерживаем `dev → stage → prod`, но реально деплоим только `dev`.
- Каждый deployment изолирован: **отдельный namespace + отдельная БД**.

Структура (заготовка):

- `deploy/argocd/apps/` — ArgoCD Applications (app-of-apps слой со стороны `web-core`).
- `deploy/charts/` — базовые Helm charts (типовой web-app, опционально фрагменты CNPG).
- `deploy/env/` — values/overlays per-app/per-env (только “не‑секреты”).
  - `deploy/env/release/` — общий слой “какой image tag разворачиваем” (может быть общим для dev+prod).

## Runbooks

- `docs/runbooks/runbook-dev-deploy-corporate.md` — пошаговый план первого dev‑деплоя `corporate` (Payload `v3.68.3` + Next.js `v15.4.9`).
