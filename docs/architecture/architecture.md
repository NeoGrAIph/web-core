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
- Обеспечить устойчивую компонентную платформу: shared‑компоненты/схемы без форков, фасады `@/ui/*` и `@/admin-ui/*`, точечные overrides.
- Вести разработку через `payload-dev` и переносить стабильные изменения в `payload-core`.

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
- Историческая заметка: ранее существовал dev-only подход “hostPath + build внутри Pod” для Payload (не масштабируется). Сейчас целевой dev‑loop — Okteto поверх GitOps (см. `docs/runbooks/runbook-okteto-dev.md`).

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

Сейчас в репозитории есть:

- `apps/payload-core/` — копия официального Payload Website template (пока без фасадов и shared‑слоя).
- `apps/synestra-io/` — копия официального Payload Website template (кастомизации ещё не начинались).
- `packages/*` — заготовки shared‑пакетов (`ui`, `cms-*`, `utils`, конфиги).
- `upstream/payload/templates/{website,ecommerce}` — снапшоты официальных шаблонов для исследования (reference only).

Важно: структура и содержимое ещё не доведены до целевой архитектуры.

## 5) Целевая структура `web-core` (что считаем правильным)

Ниже — **предлагаемая** структура. Она предназначена для того, чтобы:

- добавлять новые сайты как `apps/<name>`
- переиспользовать shared‑код как `packages/*`
- деплоить каждый сайт независимо через Argo CD

```
web-core/
  apps/
    payload-core/             # эталонный сайт (после внедрения фасада и shared‑слоя)
    payload-dev/              # workbench для shared‑изменений (dev‑контур)
    synestra-io/              # доменное приложение (override’ы поверх shared)

  packages/
    ui/                       # общий UI (design tokens + primitives)
    cms-core/                 # общие коллекции/хуки/утилиты Payload (без доменной логики)
    cms-blocks/               # общие schema блоков (Payload Blocks)
    cms-fields/               # общие field builders (links, groups и т.п.)
    utils/                    # shared утилиты
    plugins/                  # плагины (по мере необходимости)

  deploy/                     # GitOps артефакты (истина для ArgoCD)
    argocd/
      apps/                   # app-of-apps слой для ArgoCD (web-core side)
        dev/                  # Applications только для dev (пока)
        stage/                # (заготовка)
        prod/                 # (заготовка)
    charts/
      web-app/                # базовый Helm chart для Next/Payload app
      cnpg/                   # (опционально) фрагменты CNPG для POC (per-namespace DB)
    env/
      dev/
        corporate.yaml        # values/overlays для corporate-dev (не секреты)
        shop.yaml
        saas.yaml
        landings.yaml
      stage/                  # (заготовка)
      prod/                   # (заготовка)

  docs/research/templates/    # исследования официальных шаблонов (Payload) + проект обработки
  upstream/                   # снапшоты upstream (reference only)
```

Примечание: реальные имена директорий можно закрепить позже (например, оставить `apps/corporate-website`), но принцип — тот же.

## 6) Маппинг “apps → deployments → namespaces → БД”

Целевой принцип: **каждый deployment = отдельный namespace + отдельная БД (CNPG Cluster)**.

Примечание: где физически живёт CNPG Cluster — зависит от выбранного режима:
- **per-namespace** (быстрый старт): CNPG Cluster создаёт сам chart `deploy/charts/web-app` при `values.postgres.enabled=true`;
- **platform-managed DB** (как для `synestra.io`): CNPG Cluster живёт в namespace `databases` и управляется `synestra-platform`, а в `web-core` для приложения ставим `postgres.enabled=false`, и подключаемся через `DATABASE_URI` к сервису вида `*-cnpg-rw.databases.svc.cluster.local`.

Рекомендованный нейминг:

- namespace: `web-<app>-<env>` (например `web-corporate-dev`)
- CNPG Cluster:
  - prod: `<app>-cnpg` (например `corporate-cnpg`)
  - dev: `<app>-dev-cnpg` (например `corporate-dev-cnpg`)
  - stage: `<app>-stage-cnpg` (например `corporate-stage-cnpg`)
- ArgoCD Application: `web-<app>-<env>` (например `web-corporate-dev`)

Примерная таблица:

| App | Deployment | Namespace | БД (CNPG Cluster) | Домен(ы) |
|---|---|---|---|---|
| corporate | web-corporate-dev | web-corporate-dev | corporate-dev-cnpg | `corp.dev.synestra.tech` |
| shop | web-shop-dev | web-shop-dev | shop-dev-cnpg | `shop.dev.synestra.tech` |
| saas | web-saas-dev | web-saas-dev | saas-dev-cnpg | `app.dev.synestra.tech` |
| landings | web-landings-dev | web-landings-dev | landings-dev-cnpg | `*.dev.synestra.tech` (или список хостов) |

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

Нормативный документ по env vars (dev→stage→prod) и валидации: `docs/runbooks/runbook-env-contract.md`.

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

## 9) База данных (CNPG)

Нормативный канон по БД: `docs/runbooks/runbook-database-cnpg.md`.

### Роли (по умолчанию: platform-managed DB)

- `synestra-platform`:
  - ставит CNPG operator и платформенные дефолты;
  - описывает CNPG Cluster’ы в namespace `databases` (`infra/databases/cloudnativepg/**`);
  - хранит initdb secrets в `secrets/databases/**` (SOPS);
  - хранит runtime env secrets приложений в `secrets/web-*/**` (в т.ч. `DATABASE_URI`).
- `web-core`:
  - **не создаёт БД** по умолчанию (`postgres.enabled=false`);
  - хранит только ссылки на Secret’ы (`envFrom.secretRef`) и не‑секретные values;
  - запускает миграции Payload как часть GitOps деплоя (hook Job).

Допустимая альтернатива (только для POC): per-namespace DB, когда CNPG Cluster создаёт сам chart `deploy/charts/web-app` в namespace приложения (`postgres.enabled=true`).

### Миграции Payload (выбранный паттерн)

Мы используем ArgoCD hook Job **`Sync`** с `sync-wave`, чтобы:
- дождаться доступности Postgres,
- выполнить `payload migrate`,
- и только затем продолжить rollout приложения.

Реализация: `deploy/charts/web-app/templates/migrations-job.yaml` и `deploy/charts/web-app/values.yaml`.
Нормативный документ по миграциям Payload+Postgres: `docs/runbooks/runbook-payload-migrations.md`.

## 10) Hot‑разработка: Okteto (вместо hostPath)

Историческая заметка: ранее для dev использовался подход “hostPath + build внутри Pod” (например, `infra/webcore/payload/values.dev-hot.yaml`). Он не масштабируется и привязан к одной ноде/пути, поэтому целевым остаётся Okteto.

Важно: Okteto Self‑Hosted уже развернут на платформе (через Argo CD) и предоставляет:
- control‑plane: `okteto.synestra.tech`,
- BuildKit builder: `buildkit.okteto.synestra.tech`,
- Registry: `registry.okteto.synestra.tech`,
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

Важно для dev‑окружений: Okteto namespace должен быть создан через Okteto, иначе он не появится в UI/CLI. Поэтому для dev‑Apps обычно **не используем** `CreateNamespace=true` в ArgoCD (см. `docs/runbooks/runbook-okteto-dev.md`).

## 11) CI/CD контракт (GitLab + GitOps)

Фиксируем ожидание (source of truth):

- `web-core` хранит **истину** по деплою (values/manifests).
- `synestra-platform` (GitLab CI) строит образы и пушит в registry.

Канон вынесен в отдельные документы:
- dev → prod promotion (release‑слои): `docs/architecture/release-promotion.md`
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
4) Спроектировать CNPG для первого сайта (corporate) по канону platform-managed DB (namespace `databases`) и секреты к нему (см. `docs/runbooks/runbook-database-cnpg.md`).
5) Довести “runbook: hot dev” на базе Okteto (включая канон namespaces и откат dev к baseline при необходимости).
