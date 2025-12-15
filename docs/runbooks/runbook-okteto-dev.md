# runbook-okteto-dev.md

Runbook по **Okteto dev‑режиму поверх ArgoCD‑деплоя** для монорепозитория `web-core`.

Цель: ArgoCD держит “стабильный” dev‑деплой, а Okteto даёт hot‑dev (sync кода + запуск `next dev`) **в том же namespace**, используя уже подключённые секреты/БД.

## 0) Принципиальная схема

1) ArgoCD разворачивает приложение в `web-<app>-dev` (через `deploy/argocd/apps/dev/<app>.yaml` + `deploy/env/dev/<app>.yaml`).
2) Разработчик запускает Okteto dev‑режим для этого же namespace и workload’а.
3) Okteto временно патчит workload (команда/контейнер/тома) и синхронизирует код.
4) По завершении dev‑сессии изменения откатываются (либо вручную, либо командами Okteto).

Справка (официальная): Okteto dev‑режим использует Syncthing для file sync и позволяет получить технические детали синка командой `okteto status --info` (см. `https://www.okteto.com/docs/reference/file-synchronization/`).

## 0.1) Базовые команды Okteto CLI (для повседневной работы)

- `okteto context` / `okteto context use ...` — выбрать Okteto instance (self-hosted).
- `okteto namespace` / `okteto namespace <ns>` — выбрать namespace (в терминологии Okteto это рабочее пространство; обычно маппится на k8s namespace).
- `okteto up <dev-container>` — включить dev‑режим для выбранного workload (патчит PodSpec, поднимает sync/forward).
- `okteto status --info` — диагностика file sync (Syncthing endpoints/статус).
- `okteto exec <dev-container> -- <cmd>` — выполнить команду внутри dev‑контейнера.
- `okteto logs <dev-container>` — логи dev‑контейнера.
- `okteto endpoints` — список публичных endpoints окружения (если используются).
- `okteto down <dev-container>` — выключить dev‑режим и восстановить исходную конфигурацию workload.

Дополнительно (не обязательно на старте, но важно знать что существует):
- `okteto build` — сборка через Okteto Build Service / BuildKit (в кластере).
- `okteto preview` / `okteto pipeline` — управление preview/dev environments (обычно через CI).

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

## 2.1) Как подключать НОВОЕ web‑приложение к Okteto (канон v0)

Важно: Okteto **не заменяет** GitOps‑деплой. Он работает “поверх” уже развернутого dev‑окружения.

Шаги:
1) Сначала развернуть dev‑deployment через ArgoCD:
   - есть namespace `web-<app>-dev`
   - есть Deployment из chart `web-app` (обычно `web-<app>-dev-web-app`)
   - dev домен работает (`/` открывается)
2) Убедиться, что dev‑Application в ArgoCD допускает drift:
   - `selfHeal: false` для `deploy/argocd/apps/dev/<app>.yaml`
3) Убедиться, что внутри pod уже доступны нужные env vars и секреты (Helm `env` + `envFrom.secretRef`).
4) Добавить/обновить Okteto manifest (см. раздел 6) так, чтобы `okteto up` мог:
   - найти нужный Deployment (через selector/имя),
   - запустить `next dev`,
   - синхронизировать код и пробросить порт.
5) Запустить dev‑сессию:
   - `okteto context use <our-self-hosted>`
   - `okteto namespace web-<app>-dev`
   - `okteto up <dev-container>`
6) После завершения:
   - `okteto down <dev-container>`
   - при необходимости “вернуть baseline как в Git” → `argocd app sync web-<app>-dev`

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

Важно для Kubernetes‑доменов:
- Ingress/Service в chart `web-app` по умолчанию направляет трафик на порт **3000**.
- Поэтому `next dev` внутри кластера тоже должен слушать **3000** (и желательно `0.0.0.0`), иначе dev‑домен будет “молчать”.
- Практически: в Okteto manifest для dev‑сессии задаём команду вида:
  - `next dev --hostname 0.0.0.0 --port 3000`

## 5) Env vars

ArgoCD/Helm должен уже подать в Pod:
- `env:` (non-secret, включая `SYNESTRA_ENV=dev`, `NEXT_PUBLIC_SERVER_URL`)
- `envFrom.secretRef` (секреты: `DATABASE_URI`, `PAYLOAD_SECRET`, и т.п.)

Контракт и валидация: `docs/architecture/env-contract.md`.

## 6) Что фиксируем в репозитории

Минимальный “репо‑артефакт” для Okteto (который можно добавить, когда подключаем первый app):

- Okteto manifest: `okteto.yml` или `.okteto/okteto.yml` (официальный стандарт; см. `https://www.okteto.com/docs/core/okteto-manifest/`).
  - Для монорепы возможны два подхода:
    1) **единый** `.okteto/okteto.yml` в корне репозитория (несколько `dev`‑сервисов под разные apps);
    2) **отдельный** `okteto.yml` рядом с app (например `apps/<app>/okteto.yml`) — удобно для копирования шаблонов, но нужно явно договориться, как Okteto CLI будет его находить/использовать.

На текущем этапе фиксируем подход (1):
- `.okteto/okteto.yml` в корне репозитория как единая точка входа для monorepo.
- `.stignore` в корне репозитория как базовый набор исключений для Syncthing.

Рекомендация по неймингу workload:
- chart `web-app` создаёт Deployment с именем `"<release>-web-app"` (см. `deploy/charts/web-app/templates/_helpers.tpl`).
- в ArgoCD Helm release name по умолчанию совпадает с именем `Application` (например `web-corporate-dev`).
- значит типовое имя Deployment: `web-corporate-dev-web-app`.

## 6.1) `.stignore` (рекомендуемый минимум)

Официально игнорирование файлов для Syncthing делается через `.stignore` в корне синхронизируемой директории (см. `https://www.okteto.com/docs/reference/file-synchronization/`).

Для монорепы `web-core` обычно имеет смысл игнорировать:
- `**/node_modules/`
- `**/.next/`
- `**/.turbo/`
- `**/dist/`
- `**/coverage/`
- `**/.git/`

Примечание: в текущей версии Okteto CLI у нас нет команды `okteto init`, поэтому `.stignore` держим как явный артефакт в репозитории (или шаблон) и дополняем по факту.

## 7) Чеклист перед подключением первого app

- [ ] Приложение развёрнуто ArgoCD в `web-<app>-dev`.
- [ ] В `deploy/env/dev/<app>.yaml` задан `SYNESTRA_ENV: "dev"`.
- [ ] Секреты подключены через `envFrom.secretRef` (Secret создан платформой).
- [ ] `selfHeal` для dev выключен (у нас уже в `deploy/argocd/apps/dev/*.yaml`).
- [ ] Есть план по “dev image” или по установке зависимостей в dev‑контейнере.
