# runbook-ci-dev-to-prod.md

Runbook: CI‑контракт для автоматического переноса изменений **dev → prod** без `stage` (на старте проекта).

Контекст:
- деплой GitOps через ArgoCD;
- `web-core` хранит chart/values (без секретов);
- образы собираются в CI и публикуются в registry;
- CI обновляет `deploy/env/release/<app>.yaml` (image tag), после чего ArgoCD автоматически выкатывает **и dev, и prod** (оба используют release‑слой).

## 1) Что считается “релизом”

Релиз = `image.tag` в `deploy/env/release/<app>.yaml`.

Пример: `deploy/env/release/corporate.yaml`.

## 2) Какие окружения получат релиз

- `dev` Application подключает:
  - `deploy/env/release/<app>.yaml`
  - `deploy/env/dev/<app>.yaml`
- `prod` Application подключает:
  - `deploy/env/release/<app>.yaml`
  - `deploy/env/prod/<app>.yaml`

То есть **один tag** → два rollout’а (dev + prod).

## 3) Рекомендуемая стратегия веток

Минимальная (самая простая) стратегия на старте:
- `main` = “в прод”

Тогда любое изменение, попавшее в `main`, автоматически становится кандидатом для нового `image.tag`.

## 4) Сборка образа из монорепы

Рекомендуем собирать образы через `turbo prune`:

1) Сформировать pruned workspace (пример для corporate):
   - `pnpm prune:corp` → `out/corporate-website/`
2) Собрать образ из pruned output:
   - `docker build -f docker/Dockerfile.turbo --build-arg APP_NAME=@synestra/corporate-website out/corporate-website`

Dockerfile: `docker/Dockerfile.turbo`.

## 5) Как CI должен обновлять GitOps

После успешной сборки и push в registry CI делает commit в `web-core`:
- меняет `deploy/env/release/<app>.yaml`:
  - `image.tag: <immutable-tag>` (обычно SHA коммита)

Важно: это изменение **не содержит секретов**.

## 6) Как избежать рекурсивного CI (commit → CI → commit)

Типовые варианты:

- добавлять в коммит с обновлением `deploy/env/release/*` маркер `[skip ci]`;
- или в правилах CI: “если изменились только `deploy/env/release/*`, не запускать build, только lint/validate”.

## 7) Минимальный набор проверок перед публикацией в prod

На старте достаточно:
- `pnpm lint`
- `pnpm test`
- `pnpm build` (или `pnpm --filter <app> build`)

Позже можно добавить:
- e2e тесты,
- smoke‑check URL dev окружения,
- ручной gate для prod (если понадобится).

