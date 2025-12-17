# runbook-dev-prod-flow.md

Runbook: как мы одновременно используем **dev (hot)** и **prod (GitOps‑строго)** на старте проекта через promotion (release-dev → release-prod).

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

Мы разделяем values на два типа слоёв:

1) **Release‑слой** (какой image tag разворачиваем)
   - dev: `deploy/env/release-dev/<app>.yaml`
   - prod: `deploy/env/release-prod/<app>.yaml`

2) **Env‑слой**: `deploy/env/<env>/<app>.yaml`
   - домены/ингресс
   - `SYNESTRA_ENV` (`dev|prod`)
   - ссылки на Secret’ы (в т.ч. `DATABASE_URI`) и настройки подключения к БД (см. `docs/architecture/database-cnpg.md`)

### Secrets: один или несколько Secret’ов на приложение

Канон: plaintext секреты не храним в `web-core`. В values указываем только ссылки на Secret names.

Для удобства и изоляции можно подключать **несколько** Secret’ов через Helm values:
- основной secret: `envFrom.secretRef`
- дополнительные: `envFrom.extraSecretRefs[]`

Пример (когда S3 креды живут отдельно от основного env secret):
- `web-<app>-<env>-env` — `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `CRON_SECRET`, …
- `web-<app>-<env>-db-env` — `DATABASE_URI`
- `web-<app>-<env>-s3-env` — `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

Это снижает риск “перезатирания” ключей и упрощает ротацию доступов к object storage.

ArgoCD Application подключает оба valueFiles, например:
- `../../env/release-dev/corporate.yaml` (dev) / `../../env/release-prod/corporate.yaml` (prod)
- `../../env/dev/corporate.yaml`

## Политика ArgoCD (dev vs prod)

- **dev**: `selfHeal: false` (чтобы Okteto мог временно патчить workload и ArgoCD не откатывал это сразу)
- **prod**: `selfHeal: true` (GitOps‑строго)

Файлы:
- `deploy/argocd/apps/dev/*.yaml`
- `deploy/argocd/apps/prod/*.yaml`

## Поток работы (рекомендуемый)

### 1) Baseline dev = prod

Когда dev не в hot‑режиме, он равен prod по “релизу”, если:
- `deploy/env/release-dev/<app>.yaml:image.tag` равен `deploy/env/release-prod/<app>.yaml:image.tag`.

### 2) Hot‑разработка на dev через Okteto

Okteto запускается **поверх** ArgoCD‑деплоя в `web-<app>-dev`.

Пока активна dev‑сессия:
- изменения кода отражаются на dev домене;
- drift в кластере допустим (поэтому `selfHeal` выключен).

Runbook: `docs/runbooks/runbook-okteto-dev.md`.

### 3) “Зафиксировали” → dev release → promotion в prod

После того как изменение готово:
- коммитим код в Git,
- CI собирает образ и обновляет `deploy/env/release-dev/<app>.yaml` (image tag),
- ArgoCD автоматически выкатывает обновление **в dev**,
- после проверки dev CI обновляет `deploy/env/release-prod/<app>.yaml` (promotion),
- ArgoCD автоматически выкатывает обновление **в prod**.

### 4) Dev синхронизировался → продолжаем

После promotion:
- prod получает проверенный релиз,
- dev обычно становится равен prod (если promotion делает tag = dev tag),
- можно стартовать следующую Okteto dev‑сессию.

## Как “сбросить dev в baseline, равный prod”

Если dev был изменён hot‑режимом (Okteto) и нужно вернуться в baseline:
- завершить/остановить Okteto dev‑сессию,
- сделать Sync приложения в ArgoCD (для `web-<app>-dev`).

Это вернёт ресурсы к состоянию из Git (chart + values).

Если dev ушёл вперёд по image tag и нужно вернуть его на prod release:
- привести `deploy/env/release-dev/<app>.yaml:image.tag` к значению из `deploy/env/release-prod/<app>.yaml`,
- дождаться sync `web-<app>-dev` в ArgoCD.

Канон: `docs/architecture/release-promotion.md`.
