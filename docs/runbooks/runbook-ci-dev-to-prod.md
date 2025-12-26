# runbook-ci-dev-to-prod.md

Runbook: CI‑контракт для переноса изменений **dev → prod** через promotion (без `stage` на старте).

Контекст:
- деплой GitOps через ArgoCD;
- `web-core` хранит chart/values (без секретов);
- образы собираются в CI и публикуются в registry;
- CI сначала обновляет `deploy/env/release-dev/<app>.yaml` (dev release), затем после проверки делает promotion в `deploy/env/release-prod/<app>.yaml` (prod release).

## 0) Сквозной процесс (end-to-end)

Ниже — **сквозная цепочка** от изменения кода до prod, с ссылками на уточняющие документы:

1) **Изменения в приложении** (например, `apps/<app>/`).
   - Если меняется схема БД: миграции обязательны → `docs/runbooks/runbook-payload-migrations.md`.
   - Если нужен seed: → `docs/runbooks/runbook-payload-seeding.md`.
2) **Секреты/ENV контракт**:
   - Новые переменные → `docs/runbooks/runbook-env-contract.md`.
3) **Сборка образов в CI** (репозиторий `synestra-platform`):
   - Канон интеграции платформы → `docs/runbooks/runbook-platform-integration.md`.
4) **GitOps релиз в dev**:
   - Обновляется `deploy/env/release-dev/<app>.yaml`.
5) **Проверка dev**:
   - Smoke‑checks, админка, ключевые страницы → `docs/runbooks/runbook-okteto-dev.md`.
   - Если нужно обновить dev‑БД из prod → `docs/runbooks/runbook-db-refresh-dev-from-prod.md`.
   - Если нужно обновить dev‑media из prod → `docs/runbooks/runbook-media-refresh-dev-from-prod.md`.
6) **Promotion в prod**:
   - Обновляется `deploy/env/release-prod/<app>.yaml`.
7) **Миграции в prod**:
   - Запускаются через hook Job (см. `docs/runbooks/runbook-payload-migrations.md`).

Каноничное описание общей логики: `docs/runbooks/runbook-dev-prod-flow.md`.

## 1) Что считается “релизом”

Релиз = `image.tag` в release‑слое:
- dev: `deploy/env/release-dev/<app>.yaml`
- prod: `deploy/env/release-prod/<app>.yaml`

Пример: `deploy/env/release-dev/corporate.yaml`.

## 2) Какие окружения получат релиз

- `dev` Application подключает `deploy/env/release-dev/<app>.yaml` + `deploy/env/dev/<app>.yaml`.
- `prod` Application подключает `deploy/env/release-prod/<app>.yaml` + `deploy/env/prod/<app>.yaml`.

То есть tag сначала попадает в **dev**, и только после проверки — в **prod**.

## 3) Рекомендуемая стратегия веток

Минимальная (самая простая) стратегия на старте:
- `main` = “в прод”

Тогда любое изменение, попавшее в `main`, автоматически становится кандидатом для нового `image.tag`.

## 4) Сборка образа (канон для `web-core`)

Сборка образов для web‑приложений выполняется **в репозитории `synestra-platform`**:
- Dockerfiles лежат в `synestra-platform/docker/web-*`.
- CI берёт ref `web-core` (например, `WEB_CORE_REF=main` или конкретный commit) и собирает immutable tag.

GitOps‑контракт promotion описан в `docs/runbooks/runbook-dev-prod-flow.md`.

## 5) Как CI должен обновлять GitOps

После успешной сборки и push в registry CI делает **два шага**:

### 5.1. Dev release

CI делает commit в `web-core`:
- меняет `deploy/env/release-dev/<app>.yaml:image.tag` на новый immutable tag.

### 5.2. Promotion в prod

После того как dev проверен (автоматически или вручную), CI делает второй commit:
- меняет `deploy/env/release-prod/<app>.yaml:image.tag` на **тот же** immutable tag.

Важно: это изменение **не содержит секретов**.

## 5.3) Validate dev (что считается “проверено”)

Минимум на старте:
- дождаться sync/health dev‑Application в ArgoCD;
- HTTP smoke checks по dev‑домену (например: `/`, `/admin`, плюс health endpoint если заведём).

Опционально (GitOps-канонично):
- сделать PostSync hook Job, который выполняет проверки после rollout, чтобы sync считался “успешным” только при прохождении проверок.

Примечание про Payload/Postgres:
- если в релизе менялась схема/коллекции, в PR должны быть migration files (`apps/<app>/src/migrations/**`) и они должны быть воспроизводимо применимы через `payload migrate` до старта приложения.

## 6) Как избежать рекурсивного CI (commit → CI → commit)

Типовые варианты:

- добавлять в коммит(ы) с обновлением `deploy/env/release-{dev,prod}/*` маркер `[skip ci]`;
- или в правилах CI: “если изменились только `deploy/env/release-{dev,prod}/*`, не запускать build, только lint/validate”.

## 7) Минимальный набор проверок перед публикацией в prod

На старте достаточно:
- `pnpm lint`
- `pnpm test`
- `pnpm build` (или `pnpm --filter <app> build`)

Позже можно добавить:
- e2e тесты,
- smoke‑check URL dev окружения,
- ручной gate для promotion (если понадобится).

Канон: `docs/runbooks/runbook-dev-prod-flow.md`.
