# `deploy/argocd`

Argo CD “слой” со стороны `web-core`.

Идея:
- `synestra-platform` подключает `web-core` одной root‑Application (app‑of‑apps),
- а внутри `web-core` лежат `Application` манифесты на каждый deployment и окружение.

Директории:
- `deploy/argocd/apps/<env>/` — ArgoCD `Application` ресурсы по окружениям.

Важно:
- `repoURL` в `Application` файлах должен указывать на **репозиторий `web-core`**.
  В скелете используется placeholder `REPLACE_ME_WEB_CORE_REPO_URL` — заменить при интеграции с `synestra-platform`.

