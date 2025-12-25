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
- **dev**: `dev.<sitename>`

Фактические значения для `synestra-io` сейчас используют `dev.synestra.io`.
Если вернёмся к схеме `*.dev.synestra.tech`, можно будет покрывать dev wildcard‑сертификатом.

Фактические значения лежат в `web-core/deploy/env/{dev,prod}/<app>.yaml` (ингресс‑хосты, ресурсы, env) и в `web-core/deploy/env/release-{dev,prod}/<app>.yaml` (image tag).

## Как устроен GitOps‑контракт (важно)

Слои сведены в `web-core`:
- `deploy/env/release-dev/<app>.yaml` — dev release: image tag.
- `deploy/env/release-prod/<app>.yaml` — prod release: image tag.
- `deploy/env/dev/<app>.yaml` — dev: dev‑команда (`next dev --port 3000`), NODE_ENV=development, dev хосты, ресурсы, env.
- `deploy/env/prod/<app>.yaml` — prod: prod‑команда (`next start`), NODE_ENV=production, prod хосты/ресурсы, env.

### Secrets: один или несколько Secret’ов на приложение

Канон: plaintext секреты не храним в `web-core`. В values указываем только ссылки на Secret names.

Для удобства и изоляции можно подключать **несколько** Secret’ов через Helm values:
- основной secret: `envFrom.secretRef`
- дополнительные: `envFrom.extraSecretRefs[]`

Пример (когда S3 креды живут отдельно от основного env secret):
- `web-<app>-<env>-env` — `DATABASE_URI`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, …
- `web-<app>-<env>-s3-env` — `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

Это снижает риск “перезатирания” ключей и упрощает ротацию доступов к object storage.

ArgoCD Application (в `synestra-platform/argocd/apps/web-*.yaml`) подключает chart `web-core/deploy/charts/web-app` + values из `web-core/deploy/env/...`.

## Политика ArgoCD (dev vs prod)

- **dev**: `selfHeal: false` (чтобы Okteto патчи не откатывались мгновенно), auto‑sync + prune.
- **prod**: GitOps‑строго, auto‑sync + prune, selfHeal по умолчанию.

Файлы приложений: `synestra-platform/argocd/apps/web-*-dev.yaml`, `web-*-prod.yaml`.

## Поток работы (рекомендуемый)

### 1) Baseline dev = prod

Когда dev не в hot‑режиме, он равен prod по релизу, если:
- `deploy/env/release-dev/<app>.yaml:image.tag` совпадает с `release-prod/<app>.yaml:image.tag`.

### 2) Hot‑разработка на dev через Okteto

Okteto запускается **поверх** ArgoCD‑деплоя в `web-<app>-dev`.

Пока активна dev‑сессия:
- изменения кода отражаются на dev домене;
- drift в кластере допустим (поэтому `selfHeal` выключен).

Runbook: `docs/runbooks/runbook-okteto-dev.md` (дополняется сведениями из `synestra-platform/docs/wiki/okteto.md`).

### 3) “Зафиксировали” → dev release → promotion в prod

После того как изменение готово:
- коммитим код в Git,
- CI платформы собирает образ (jobs `build_payload_dev` или `build_web_*`) и обновляет тег в `deploy/env/release-dev/<app>.yaml`,
- ArgoCD автоматически выкатывает обновление **в dev**,
- после проверки dev тот же тег переносится в `values.prod.yaml` (promotion),
- ArgoCD автоматически выкатывает обновление **в prod**.

## Памятка про dev‑режим

- Dev окружения (`*-dev`) работают на Next.js 15 в `next dev --port 3000`.
- Payload CMS 3 в dev‑mode (`NODE_ENV=development`): изменения схем/блоков применяются сразу после sync dev‑образа.
- Dev‑образы собираются в `synestra-platform` (job `build_payload_dev`), теги задаются в `deploy/env/release-dev/<app>.yaml`.

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
