# runbook-okteto-dev.md

Runbook по **Okteto dev‑режиму поверх ArgoCD‑деплоя** для монорепозитория `web-core`.

Цель: ArgoCD держит “стабильный” dev‑деплой, а Okteto даёт hot‑dev (sync кода + запуск `next dev`) **в том же namespace**, используя уже подключённые секреты/БД.

## 0) Принципиальная схема

1) Создаём dev namespace как **Okteto namespace** (non‑personal), чтобы Okteto CLI мог работать в нём.
2) ArgoCD разворачивает baseline‑приложение в этот же namespace (через `deploy/argocd/apps/dev/<app>.yaml` + `deploy/env/dev/<app>.yaml`).
3) Разработчик запускает Okteto dev‑режим для этого же namespace и workload’а.
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

## 0.2) Наш Okteto (Synestra): endpoints и auth

- Control‑plane: `https://okteto.synestra.tech`
- Builder (BuildKit): `buildkit.okteto.synestra.tech`
- Registry: `registry.okteto.synestra.tech`
- Авторизация: через Keycloak/OIDC (логин зависит от настроек платформы; токены и секреты в репо не храним).

## 1) Namespaces

Для dev‑режима поверх ArgoCD рекомендуем:

- `web-corporate-dev`
- `web-shop-dev`
- `web-landings-dev`
- `web-saas-dev`

Не рекомендуем общий namespace типа `web-dev` для всех приложений: он ломает изоляцию “один namespace + одна БД на deployment” и усложняет GitOps.

### 1.1) Важный нюанс: Okteto Namespace ≠ любой Kubernetes namespace

В Okteto есть собственная модель namespaces. На практике это означает:
- Kubernetes namespace может существовать (создан кем угодно),
- но Okteto CLI может **не** видеть его как Okteto namespace (`okteto namespace use <ns>` → `Namespace not found on context`).

Зафиксированный канон (на текущий момент):
1) dev namespace для hot‑dev создаёт **Okteto** (как Okteto namespace, non‑personal);
2) ArgoCD деплоит baseline в этот же namespace (Kubernetes namespace уже существует).

Важно: для dev‑Applications в `web-core` мы **не используем** `CreateNamespace=true`, чтобы ArgoCD не мог “случайно” пересоздать namespace без Okteto‑ownership (после чего Okteto UI/CLI перестанет видеть его).

Диагностика:
- `okteto namespace list` — список namespaces, известных Okteto
- `kubectl get ns` — список namespaces в Kubernetes

### 1.1.1) “Анти‑грабли” (что проверять каждый раз)

1) Namespace создаётся через Okteto, а не через ArgoCD:
- `okteto namespace list | rg web-<app>-dev` должен видеть `web-<app>-dev`
- `kubectl get ns web-<app>-dev` должен тоже видеть namespace

2) В dev ArgoCD Applications не должно быть `CreateNamespace=true`:
- иначе ArgoCD может пересоздать namespace “как обычный k8s ns” → Okteto UI/CLI перестанет видеть его.

3) В Okteto не должно быть включено ограничение `forceIngressSubdomain=true`, если мы хотим реальные dev‑домены (например `dev.synestra.io`):
- иначе Okteto admission webhook отклонит Ingress по host’у.

4) У одного домена должен быть **ровно один** Ingress в кластере:
- перед проблемами с роутингом всегда проверь:
  - `kubectl get ingress -A -o jsonpath='{range .items[*]}{.metadata.namespace}{\"/\"}{.metadata.name}{\"\\t\"}{range .spec.rules[*]}{.host}{\" \"}{end}{\"\\n\"}{end}' | rg '<host>'`

### 1.2) Как создать dev namespace (канон)

Пример для `synestra.io`:

```bash
okteto context use https://okteto.synestra.tech
okteto namespace create web-synestra-io-dev
okteto namespace web-synestra-io-dev
```

Важно:
- если namespace уже был создан “не‑Okteto способом”, Okteto может отказать в `namespace create` (конфликт имен);
- в ранней стадии проекта (без ценных данных) проще пересоздать namespace корректно (Okteto‑ownership).

## 2) ArgoCD vs Okteto (важно)

Okteto dev‑режим обычно вносит изменения в `Deployment`/`PodSpec`. Если ArgoCD будет активно self-heal’ить, он начнёт откатывать эти изменения.

Поэтому для `dev` окружения у нас выставлено:
- `selfHeal: false` в `deploy/argocd/apps/dev/*.yaml`

Это осознанно: `dev` допускает временный drift ради удобства разработки. Для `stage/prod` self-heal остаётся желательным.

## 2.2) Важный нюанс: ограничение Ingress host’ов в Okteto namespaces

В нашей self-hosted установке Okteto есть admission webhook, который может ограничивать host’ы Ingress’ов внутри Okteto namespaces
(настройка `ingress.forceIngressSubdomain` в Helm values Okteto).

Если включено `forceIngressSubdomain=true`, то Ingress внутри Okteto namespace будет разрешён только для доменов вида:
`*.<namespace>.services.synestra.tech`, и попытка создать Ingress для `dev.synestra.io` будет отклонена webhook’ом.

Для нашей схемы (Okteto dev‑loop поверх ArgoCD + реальные dev домены сайтов) это ограничение должно быть **выключено** на платформе.

---

## 2.3) Ремедиация: “namespace есть в Kubernetes, но отсутствует в Okteto UI”

Симптом:
- `kubectl get ns web-<app>-dev` показывает namespace,
- но `okteto namespace use web-<app>-dev` → `Namespace not found on context`.

Причина:
- namespace был создан ArgoCD (`CreateNamespace=true`) или вручную, без Okteto‑ownership.

Каноничный фикс (в dev, когда нет критичных данных):
1) В `web-core` убрать `CreateNamespace=true` из `deploy/argocd/apps/dev/<app>.yaml`.
2) Синхронизировать `apps-web-core`, чтобы ArgoCD Application обновился.
3) Удалить dev namespace и дождаться полного удаления.
   - Важно: ArgoCD hook Job может повесить namespace в `Terminating` из‑за `argocd.argoproj.io/hook-finalizer`.
     Тогда:
     - найти зависший Job,
     - снять `metadata.finalizers`,
     - дождаться удаления namespace.
4) Создать namespace через Okteto:
   - `okteto namespace create web-<app>-dev`
5) Синхронизировать `infra-secrets` (чтобы вернуть секреты в новый namespace).
6) Синхронизировать `web-<app>-dev` (baseline деплой).


## 2.1) Как подключать НОВОЕ web‑приложение к Okteto (канон v0)

Важно: Okteto **не заменяет** GitOps‑деплой. Он работает “поверх” уже развернутого dev‑окружения.

Шаги:
1) Сначала подготовить dev namespace как Okteto namespace:
   - `okteto namespace list` содержит `web-<app>-dev`
2) Развернуть dev‑deployment через ArgoCD:
   - есть Deployment из chart `web-app` (обычно `web-<app>-dev-web-app`)
   - dev домен работает (`/` открывается)
3) Убедиться, что dev‑Application в ArgoCD допускает drift:
   - `selfHeal: false` для `deploy/argocd/apps/dev/<app>.yaml`
4) Убедиться, что внутри pod уже доступны нужные env vars и секреты (Helm `env` + `envFrom.secretRef`).
5) Добавить/обновить Okteto manifest (см. раздел 6) так, чтобы `okteto up` мог:
   - найти нужный Deployment (через selector/имя),
   - запустить `next dev`,
   - синхронизировать код и пробросить порт.
6) Запустить dev‑сессию:
   - `okteto context use <our-self-hosted>`
   - `okteto namespace web-<app>-dev`
   - `okteto up <dev-container>` (если sync “ломается” → `okteto up <dev-container> --reset`)
7) После завершения:
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
- `.stignore` (и/или `.okteto/.stignore`) как базовый набор исключений для Syncthing.

Практическая деталь (по опыту):
- если manifest лежит в `.okteto/okteto.yml`, Okteto будет ожидать `.stignore` в **той же директории**, т.е. `.okteto/.stignore` (иначе CLI предложит “infer defaults” интерактивно).

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
- `.pnpm-store/**` (если pnpm store попадает в sync‑root)

Важно для нашей схемы (по опыту): **PVC mount нельзя синкать**.
Например, для `synestra-io` media‑директория смонтирована как PVC в `apps/synestra-io/public/media`, и Syncthing будет падать с `device or resource busy`, если пытаться её удалять/перезаписывать. Поэтому эту папку нужно исключать в `.stignore`.

Примечание: в текущей версии Okteto CLI у нас нет команды `okteto init`, поэтому `.stignore` держим как явный артефакт в репозитории (или шаблон) и дополняем по факту.

## 7) Чеклист перед подключением первого app

- [ ] Приложение развёрнуто ArgoCD в `web-<app>-dev`.
- [ ] В `deploy/env/dev/<app>.yaml` задан `SYNESTRA_ENV: "dev"`.
- [ ] Секреты подключены через `envFrom.secretRef` (Secret создан платформой).
- [ ] `selfHeal` для dev выключен (у нас уже в `deploy/argocd/apps/dev/*.yaml`).
- [ ] Есть план по “dev image” или по установке зависимостей в dev‑контейнере.
