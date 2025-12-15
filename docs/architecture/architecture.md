# Архитектура `web-core` и взаимодействие с `synestra-platform`

Дата актуальности: **2025-12-15**.

Этот документ фиксирует предлагаемую (целевую) структуру монорепозитория `~/repo/web-core` и описывает, как он должен взаимодействовать с инфраструктурным GitOps‑репозиторием `~/synestra-platform`.

## 1) Цели и ограничения

### Цели

- Обеспечить **быструю разработку** группы сайтов компании в одной монорепе.
- Обеспечить **безопасный деплой**: сайты живут в одном Git‑репо, но разворачиваются **независимо** (несколько deployments).
- Сразу заложить поддержку окружений `dev → stage → prod`, но **на старте деплоить `dev` + `prod`** (без `stage`).
- Обеспечить изоляцию: **один namespace + одна БД на deployment**.
- Обеспечить GitOps‑контракт: Argo CD разворачивает приложения декларативно.

### Жёсткие ограничения (уже приняты)

- Версии: **Payload `v3.68.3`**, **Next.js `v15.4.9`**.
- Секреты: **не храним plaintext‑секреты в `web-core`**. Секреты живут централизованно в `synestra-platform` (SOPS/age).
- Hot‑разработка в Kubernetes: используем **Okteto** (Self‑Hosted уже развернут в `synestra-platform`; см. `docs/runbooks/runbook-platform-integration.md` и `docs/runbooks/runbook-okteto-dev.md`).

## 2) Границы ответственности репозиториев

### `~/synestra-platform` (платформа)

Отвечает за:

- Kubernetes‑инфраструктуру: Argo CD, ingress, cert-manager, операторы (CNPG и т.п.), observability и т.д.
- Централизованные секреты (SOPS/age) и их применение в кластер (ArgoCD + SOPS plugin).
- Общие кластерные политики/классы/CRD и т.п.

Факты по текущей реализации:

- ArgoCD root app-of-apps: `~/synestra-platform/argocd/apps/synestra-platform.yaml`
- Secrets application: `~/synestra-platform/argocd/apps/infra-secrets.yaml` (SOPS plugin)
- CNPG operator: `~/synestra-platform/argocd/apps/infra-cloudnativepg.yaml`
- Сейчас уже есть “legacy” деплой Payload в namespace `webcore`: `~/synestra-platform/argocd/apps/infra-payload.yaml` + `~/synestra-platform/infra/webcore/payload/values*.yaml` (в т.ч. dev-only `values.dev-hot.yaml` с `hostPath`).

### `~/repo/web-core` (продукт/сайты)

Отвечает за:

- Исходники сайтов (Next.js + Payload) и shared‑пакеты.
- GitOps‑шаблоны деплоя (Helm/Kustomize): **values/overlays, ingress hosts, ресурсы, HPA, feature flags** и т.д.
- Декларации приложений для ArgoCD (внутри `web-core`) — так, чтобы `synestra-platform` мог подключить их “одной точкой”.

## 3) Термины (чтобы не путаться)

- **App** — deployable приложение в монорепе (обычно Next.js app с интегрированным Payload).
- **Deployment** — конкретная инсталляция app в окружении (`dev|stage|prod`) со своими доменами, секретами и БД (в терминах ArgoCD это обычно один `Application`).
- **Environment** — `dev`, `stage`, `prod`.

## 4) Текущее состояние `web-core` (как есть сейчас)

Сейчас в репозитории уже есть заготовки:

- `apps/corporate-website/` — заготовка корпоративного сайта
- `apps/ecommerce-store/` — заготовка магазина
- `apps/experiments/` — песочница/эксперименты
- `packages/cms-core/`, `packages/cms-blocks/`, `packages/cms-ecommerce/` — заготовки для разделения CMS‑логики
- `packages/plugins/payload-plugin-multisite/` — заготовка под plugin (мультисайтовость)
- `upstream/payload/templates/{website,ecommerce}` — снапшоты официальных шаблонов для исследования (reference only)

Важно: сейчас это **не финальная структура**, а “скелет” для проектирования.

## 5) Целевая структура `web-core` (что считаем правильным)

Ниже — **предлагаемая** структура. Она предназначена для того, чтобы:

- добавлять новые сайты как `apps/<name>`
- переиспользовать shared‑код как `packages/*`
- деплоить каждый сайт независимо через Argo CD

```
web-core/
  apps/
    corporate/                # корпоративный сайт (Next.js + Payload)
    shop/                     # интернет-магазин (Next.js + Payload, ecommerce-фичи)
    saas/                     # SaaS web app (Next.js + Payload или отдельная CMS)
    landings/                 # группа лендингов (один deployment на группу)

  packages/
    ui/                       # общий UI (design system primitives)
    cms-core/                 # общие коллекции/хуки/утилиты Payload, НЕ завязанные на конкретный сайт
    cms-blocks/               # общие blocks/компоненты контента
    cms-ecommerce/            # ecommerce-надстройки (Stripe и т.п.) — только если решим использовать
    plugins/
      payload-plugin-multisite/  # мультисайтовость (если подтвердим необходимость)
    config/                   # (позже) shared configs (ts/eslint/next) если реально нужно

  deploy/                     # GitOps артефакты (в этой папке будет жить “истина” для ArgoCD)
    argocd/
      apps/                   # app-of-apps слой для ArgoCD (web-core side)
        dev/                  # Applications только для dev (пока)
        stage/                # (заготовка)
        prod/                 # (заготовка)
    charts/
      web-app/                # базовый Helm chart для Next/Payload app
      cnpg/                   # (опционально) шаблон/фрагменты для CNPG per-namespace
    env/
      dev/
        corporate.yaml        # values/overlays для corporate-dev (не секреты)
        shop.yaml
        saas.yaml
        landings.yaml
      stage/                  # (заготовка)
      prod/                   # (заготовка)

  docs/research/templates/    # исследования официальных шаблонов (Payload)
  upstream/                   # снапшоты upstream (reference only)
```

Примечание: реальные имена директорий можно закрепить позже (например, оставить `apps/corporate-website`), но принцип — тот же.

## 6) Маппинг “apps → deployments → namespaces → БД”

Целевой принцип: **каждый deployment = отдельный namespace + отдельный CNPG Cluster**.

Рекомендованный нейминг:

- namespace: `web-<app>-<env>` (например `web-corporate-dev`)
- CNPG Cluster: `<app>-cnpg` (например `corporate-cnpg`)
- ArgoCD Application: `web-<app>-<env>` (например `web-corporate-dev`)

Примерная таблица:

| App | Deployment | Namespace | БД (CNPG Cluster) | Домен(ы) |
|---|---|---|---|---|
| corporate | web-corporate-dev | web-corporate-dev | corporate-cnpg | `corp.dev.synestra.tech` |
| shop | web-shop-dev | web-shop-dev | shop-cnpg | `shop.dev.synestra.tech` |
| saas | web-saas-dev | web-saas-dev | saas-cnpg | `app.dev.synestra.tech` |
| landings | web-landings-dev | web-landings-dev | landings-cnpg | `*.dev.synestra.tech` (или список хостов) |

## 7) GitOps + Argo CD: как связать два репозитория

### Рекомендуемая модель (app-of-apps)

1) В `synestra-platform` добавляется **один** ArgoCD Application, указывающий на `web-core`:

- примерное имя: `web-core`
- source repo: `web-core` (GitLab)
- path: `deploy/argocd/apps`
- destination namespace: `argo` (где живут Application ресурсы)

2) В `web-core` находятся **дочерние** ArgoCD Applications (по одному на deployment):

- `web-corporate-dev`
- `web-shop-dev`
- `web-saas-dev`
- `web-landings-dev`

Каждый дочерний Application указывает на:

- chart/manifest в `web-core/deploy/charts/...`
- values/overlays в `web-core/deploy/env/dev/...`
- destination namespace `web-<app>-dev`

### AppProject

Рекомендуется создать отдельный AppProject (в `synestra-platform`) для web‑приложений, чтобы:

- ограничить destinations (только `web-*-*`)
- ограничить sourceRepos (только нужные репозитории/helm‑репозитории)
- формально отделить “платформу” от “продукта”

## 8) Секреты и “не‑секреты”: контракт

### Где что живёт

- **Секреты** (DB credentials, PAYLOAD_SECRET, Stripe keys, CRON_SECRET и т.п.) — **в `synestra-platform/secrets/**`**, SOPS‑encrypted.
- **Не‑секреты** (ingress hosts, ресурсы, HPA, feature flags, публичные NEXT_PUBLIC_*) — **в `web-core/deploy/env/<env>/*.yaml`**.

Нормативный документ по env vars (dev→stage→prod) и валидации: `docs/architecture/env-contract.md`.

### Рекомендованный минимум env vars (по официальным templates)

Payload `templates/website` показывает минимальные переменные:

- `DATABASE_URI` (secret)
- `PAYLOAD_SECRET` (secret)
- `NEXT_PUBLIC_SERVER_URL` (non-secret; публичный)
- `CRON_SECRET` (secret; если используем cron endpoints)
- `PREVIEW_SECRET` (secret; если используем preview links)

Payload `templates/ecommerce` добавляет Stripe и помечен как BETA:

- `STRIPE_SECRET_KEY` (secret)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (non-secret)
- `STRIPE_WEBHOOKS_SIGNING_SECRET` (secret)

Подробности: `docs/research/templates/`.

## 9) База данных (CNPG) per-namespace

### Роли

- `synestra-platform`:
  - ставит CNPG operator (и при необходимости общие StorageClass/backup‑политики)
  - хранит bootstrap/app secrets (SOPS)
- `web-core`:
  - описывает CNPG Cluster ресурсы **в namespace конкретного сайта**
  - описывает приложения, которые используют эту БД

### Миграции Payload

Единый “правильный” паттерн нужно выбрать и закрепить (см. `docs/notes.md` → открытые вопросы). Практически, в Kubernetes чаще всего используют:

- **ArgoCD hook Job** (pre-sync): выполнить миграции до rollout приложения
- или **initContainer** в Deployment: запускать миграции перед стартом контейнера

Для GitOps предпочтительнее Job (легче наблюдать/повторять/катить).

## 10) Hot‑разработка: Okteto (вместо hostPath)

В `synestra-platform` сейчас есть dev-only “hostPath + build внутри Pod” подход (`infra/webcore/payload/values.dev-hot.yaml`). Он не масштабируется и привязан к одной ноде/пути.

Важно: Okteto Self‑Hosted уже развернут на платформе (через Argo CD) и предоставляет:
- control‑plane: `okteto.services.synestra.tech`,
- BuildKit builder: `buildkit.services.synestra.tech`,
- Registry: `registry.services.synestra.tech`,
- SSO (OIDC) через Keycloak.

При этом в нашей установке отключены `okteto-nginx` и `okteto-ingress`, поэтому Okteto **не заменяет** ingress‑маршрутизацию сайтов: публичные домены сайтов обслуживаются нашими Ingress’ами/Traefik, а Okteto используется для dev‑loop “поверх” уже развернутых workloads.

Целевой подход (dev‑loop поверх GitOps):

1) ArgoCD разворачивает базовый dev‑деплой (стабильный образ).
2) Разработчик запускает **Okteto** для конкретного app:
   - поднимается dev container в кластере
   - код синхронизируется (без hostPath)
   - порты пробрасываются
   - запускается `pnpm dev` / `next dev`

Практический итог: “ощущение локальной разработки”, но процесс работает через кластер и не требует хаков с файловой системой ноды.

Открытый вопрос (нужно закрыть перед масштабированием на много сайтов): Okteto namespaces vs Kubernetes namespaces. Сейчас возможна ситуация, когда Kubernetes namespace уже существует (создан ArgoCD), но Okteto CLI не видит его как Okteto Namespace. Канон выбора ownership’а namespace и совместимости с ArgoCD `CreateNamespace` фиксируем в `docs/runbooks/runbook-okteto-dev.md`.

## 11) CI/CD контракт (GitLab + GitOps)

Фиксируем ожидание:

- `web-core` хранит **истину** по деплою (values/manifests).
- `synestra-platform` (GitLab CI) строит образы и пушит в registry.

Рекомендуемый базовый механизм для `dev`:

1) Образ тегируется **immutable tag** (например SHA коммита `web-core`).
2) Pipeline (в `synestra-platform`) после сборки делает **git commit** в `web-core` (обновляет `deploy/env/dev/<app>.yaml` с новым image tag).
3) ArgoCD подхватывает commit и деплоит.

Примечание (актуальная схема dev+prod на старте):
- image tag держим в раздельных release‑слоях:
  - `deploy/env/release-dev/<app>.yaml` (dev release),
  - `deploy/env/release-prod/<app>.yaml` (prod release);
- promotion = обновление `release-prod` на tag, проверенный в dev;
- env‑специфика (домены, `SYNESTRA_ENV`, Secret refs) остаётся в `deploy/env/<env>/<app>.yaml`.
Runbooks:
- `docs/runbooks/runbook-dev-prod-flow.md`
- `docs/runbooks/runbook-ci-dev-to-prod.md`

Альтернатива (позже): ArgoCD Image Updater / иной автоматический image tag updater (уменьшает “commit‑шум”, но требует отдельной настройки и политики безопасности).

## 12) Что делаем дальше (практические шаги)

1) Утвердить этот документ (или скорректировать).
2) Создать `deploy/` структуру в `web-core` и минимальный app-of-apps слой для `dev`.
3) В `synestra-platform`:
   - добавить AppProject `web-core`
   - добавить root Application `web-core` (указатель на `web-core/deploy/argocd/apps`)
4) Спроектировать CNPG per-namespace для первого сайта (corporate) и секреты к нему.
5) Довести “runbook: hot dev” на базе Okteto (включая канон namespaces и откат dev к baseline при необходимости).
