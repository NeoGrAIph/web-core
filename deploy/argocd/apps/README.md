# `deploy/argocd/apps`

ArgoCD `Application` манифесты, разложенные по окружениям:
- `dev/`
- `stage/`
- `prod/`

Каждый `Application` соответствует одному deployment (corporate/shop/saas/landings).
Для основного домена `synestra.io` есть отдельные deployments `web-synestra-io-dev` и `web-synestra-io-prod`.
