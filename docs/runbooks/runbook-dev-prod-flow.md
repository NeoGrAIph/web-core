# runbook-dev-prod-flow.md

Runbook: как мы одновременно используем **dev (hot)** и **prod (GitOps‑строго)** на старте проекта.

## Цель

Хотим получить:

1) Разработка ведётся на **dev** (в т.ч. hot‑режим через Okteto).
2) При необходимости dev можно быстро “сбросить” в baseline, равный prod.
3) После фиксации изменений (git push) они автоматически попадают в **prod**.
4) После обновления prod, dev автоматически синхронизируется до этого же релиза и можно продолжать разработку.

## Доменная схема (рекомендация)

- **prod**: `<sitename>.synestra.io`
- **dev**: `<sitename>.dev.synestra.tech`

Это удобно для TLS, потому что dev можно покрывать wildcard сертификатом `*.dev.synestra.tech`.

Фактические значения задаются в:
- `deploy/env/dev/*.yaml` (dev hosts)
- `deploy/env/prod/*.yaml` (prod hosts)

## Как устроен GitOps‑контракт (важно)

Мы разделяем values на два слоя:

1) **Release‑слой**: `deploy/env/release/<app>.yaml`
   - содержит `image.repository` и `image.tag`
   - по умолчанию общий для dev и prod (один и тот же релиз)

2) **Env‑слой**: `deploy/env/<env>/<app>.yaml`
   - домены/ингресс
   - `SYNESTRA_ENV` (`dev|prod`)
   - ссылки на Secret’ы и bootstrap секреты БД

ArgoCD Application подключает оба valueFiles, например:
- `../../env/release/corporate.yaml`
- `../../env/dev/corporate.yaml`

## Политика ArgoCD (dev vs prod)

- **dev**: `selfHeal: false` (чтобы Okteto мог временно патчить workload и ArgoCD не откатывал это сразу)
- **prod**: `selfHeal: true` (GitOps‑строго)

Файлы:
- `deploy/argocd/apps/dev/*.yaml`
- `deploy/argocd/apps/prod/*.yaml`

## Поток работы (рекомендуемый)

### 1) Baseline dev = prod

Когда dev не в hot‑режиме, он равен prod по “релизу”:
- оба окружения используют один и тот же `deploy/env/release/<app>.yaml` (одинаковый image tag).

### 2) Hot‑разработка на dev через Okteto

Okteto запускается **поверх** ArgoCD‑деплоя в `web-<app>-dev`.

Пока активна dev‑сессия:
- изменения кода отражаются на dev домене;
- drift в кластере допустим (поэтому `selfHeal` выключен).

Runbook: `docs/runbooks/runbook-okteto-dev.md`.

### 3) “Зафиксировали” → автоматически в prod

После того как изменение готово:
- коммитим код в Git,
- CI собирает образ и обновляет `deploy/env/release/<app>.yaml` (image tag),
- ArgoCD автоматически применяет обновление **и в dev, и в prod** (так как оба используют release‑слой).

### 4) Dev синхронизировался → продолжаем

После rollout’а:
- dev снова равен prod (новый baseline),
- можно стартовать следующую Okteto dev‑сессию.

## Как “сбросить dev в baseline, равный prod”

Если dev был изменён hot‑режимом и нужно вернуться в baseline:
- завершить/остановить Okteto dev‑сессию,
- сделать Sync приложения в ArgoCD (для `web-<app>-dev`).

Это вернёт ресурсы к состоянию из Git (chart + values).

