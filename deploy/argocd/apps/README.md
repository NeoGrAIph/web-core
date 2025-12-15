# `deploy/argocd/apps`

ArgoCD `Application` манифесты, разложенные по окружениям:
- `dev/`
- `stage/`
- `prod/`

Каждый `Application` соответствует одному deployment (corporate/shop/saas/landings).
Для основного домена `synestra.io` есть отдельные deployments `web-dev-synestra-io` и `web-synestra-io`.
