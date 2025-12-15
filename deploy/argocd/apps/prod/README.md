# `deploy/argocd/apps/prod`

ArgoCD `Application` манифесты для окружения **prod** (по одному на deployment).

Включает основной сайт `synestra.io`: `web-synestra-io`.

Примечание: для prod включаем `selfHeal: true` (GitOps‑строго), в отличие от dev, где `selfHeal` может быть выключен ради Okteto dev‑режима.
