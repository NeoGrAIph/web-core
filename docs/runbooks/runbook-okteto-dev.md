# runbook-okteto-dev.md

Runbook по **Okteto dev‑режиму поверх ArgoCD‑деплоя** для монорепозитория `web-core`.

Цель: ArgoCD держит “стабильный” dev‑деплой, а Okteto даёт hot‑dev (sync кода + запуск `next dev`) **в том же namespace**, используя уже подключённые секреты/БД.

## 0) Принципиальная схема

1) ArgoCD разворачивает приложение в `web-<app>-dev` (через `deploy/argocd/apps/dev/<app>.yaml` + `deploy/env/dev/<app>.yaml`).
2) Разработчик запускает Okteto dev‑режим для этого же namespace и workload’а.
3) Okteto временно патчит workload (команда/контейнер/тома) и синхронизирует код.
4) По завершении dev‑сессии изменения откатываются (либо вручную, либо командами Okteto).

## 1) Namespaces

Для dev‑режима поверх ArgoCD рекомендуем:

- `web-corporate-dev`
- `web-shop-dev`
- `web-landings-dev`
- `web-saas-dev`

Не рекомендуем общий namespace типа `web-dev` для всех приложений: он ломает изоляцию “один namespace + одна БД на deployment” и усложняет GitOps.

## 2) ArgoCD vs Okteto (важно)

Okteto dev‑режим обычно вносит изменения в `Deployment`/`PodSpec`. Если ArgoCD будет активно self-heal’ить, он начнёт откатывать эти изменения.

Поэтому для `dev` окружения у нас выставлено:
- `selfHeal: false` в `deploy/argocd/apps/dev/*.yaml`

Это осознанно: `dev` допускает временный drift ради удобства разработки. Для `stage/prod` self-heal остаётся желательным.

## 3) Требования к образу (чтобы dev заработал)

Чтобы запускать `next dev` внутри кластера, dev‑контейнер должен уметь:
- запускать Node.js `>= 22`;
- запускать `pnpm`;
- устанавливать зависимости workspace (включая нативные модули, например `sharp`).

Практически это означает одно из двух:
- либо отдельный “dev image” (рекомендуется),
- либо установка зависимостей внутри dev‑контейнера во время сессии (быстрее начать, но хуже воспроизводимость).

Важно: это относится только к Okteto dev‑сессии и не меняет принцип “сборка образов в CI”.

## 4) Рекомендованный способ для монорепы

Открываем dev‑сессию из корня монорепы:
- синхронизируем `apps/*` и `packages/*` целиком (чтобы работали workspace зависимости);
- запускаем один app через `pnpm --filter`.

Пример команды, которая должна быть финальным запуском в dev‑контейнере:

```bash
pnpm --filter @synestra/corporate-website dev
```

## 5) Env vars

ArgoCD/Helm должен уже подать в Pod:
- `env:` (non-secret, включая `SYNESTRA_ENV=dev`, `NEXT_PUBLIC_SERVER_URL`)
- `envFrom.secretRef` (секреты: `DATABASE_URI`, `PAYLOAD_SECRET`, и т.п.)

Контракт и валидация: `docs/architecture/env-contract.md`.

## 6) Что фиксируем в репозитории

Минимальный “репо‑артефакт” для Okteto (который можно добавить, когда подключаем первый app):

- `apps/<app>/okteto.yml` — описание dev‑сессии (какой workload, какие порты, какие папки синкать, какая команда запуска).

Рекомендация по неймингу workload:
- chart `web-app` создаёт Deployment с именем `"<release>-web-app"` (см. `deploy/charts/web-app/templates/_helpers.tpl`).
- в ArgoCD Helm release name по умолчанию совпадает с именем `Application` (например `web-corporate-dev`).
- значит типовое имя Deployment: `web-corporate-dev-web-app`.

## 7) Чеклист перед подключением первого app

- [ ] Приложение развёрнуто ArgoCD в `web-<app>-dev`.
- [ ] В `deploy/env/dev/<app>.yaml` задан `SYNESTRA_ENV: "dev"`.
- [ ] Секреты подключены через `envFrom.secretRef` (Secret создан платформой).
- [ ] `selfHeal` для dev выключен (у нас уже в `deploy/argocd/apps/dev/*.yaml`).
- [ ] Есть план по “dev image” или по установке зависимостей в dev‑контейнере.

