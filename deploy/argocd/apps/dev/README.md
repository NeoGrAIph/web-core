# `deploy/argocd/apps/dev/`

Здесь лежат ArgoCD `Application` ресурсы для окружения `dev` (по одному на deployment):

- synestra-io (основной сайт: `dev.synestra.io`)
- corporate
- shop
- saas
- landings (группа лендингов)

Важно:

- Эти `Application` должны ссылаться на Helm/Kustomize артефакты из `web-core/deploy/...`.
- Root-Application (который подключает `web-core`) должен жить в `synestra-platform` как часть app-of-apps платформы.

Техническая деталь:
- `repoURL` в `Application` указывает на git-репозиторий `web-core` (источник chart + values).
