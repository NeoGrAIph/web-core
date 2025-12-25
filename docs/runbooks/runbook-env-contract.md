# Runbook: контракт env vars (dev → stage → prod)

## Purpose
Зафиксировать единые правила работы с переменными окружения для приложений `apps/*`, без plaintext‑секретов в `web-core`, с предсказуемым поведением в dev/stage/prod.

## Goals
- Единый набор обязательных переменных для всех приложений.
- Чёткое разделение секретов и не‑секретов.
- Валидируемые env vars при запуске server‑кода.

## Prerequisites
- Доступ к репозиторию `web-core`.
- Понимание GitOps‑контракта и secret‑хранения в `synestra-platform`.

## Steps

### 1) Разделить секреты и не‑секреты
- **Секреты** (DB URI, `PAYLOAD_SECRET`, Stripe keys) **не храним** в `web-core`.
  - В Kubernetes секреты живут в `Secret`, созданном из `synestra-platform` (SOPS/age).
  - В `web-core` допускаются только **ссылки** на Secret (`envFrom.secretRef`).
- **Не‑секреты** (`NEXT_PUBLIC_*`, hosts, feature flags) храним в `deploy/env/<env>/*.yaml`.

### 2) Клиентские переменные
- Всё, что доступно клиенту, должно иметь префикс `NEXT_PUBLIC_`.
- Никогда не хранить секреты в `NEXT_PUBLIC_*`.

### 3) Окружения
- Для логики окружений используем `SYNESTRA_ENV=dev|stage|prod`.
- В Kubernetes `SYNESTRA_ENV` задаём **обязательно** через Helm values.
- В локальной разработке (если не задано) считаем `SYNESTRA_ENV=dev`.

Примечание для Okteto hot‑dev:
- при запуске `next dev` внутри кластера `NODE_ENV` должен быть `development`.

### 4) Где задавать env vars

**Локально:**
- `apps/<app>/.env.example` → `apps/<app>/.env.local` (git‑ignored).

**Kubernetes/ArgoCD:**
- не‑секреты: `deploy/env/<env>/<app>.yaml` → `.env` (как `env:` в Pod).
- секреты: `deploy/env/<env>/<app>.yaml` → `envFrom.secretRef` (подключение `Secret` целиком).

Важно: переменные из `.env` должны попадать и в `Deployment`, и в migrations Job.

### 5) Минимальный набор переменных

**Обязательные:**
- `SYNESTRA_ENV` (non-secret): `dev|stage|prod`
- `NEXT_PUBLIC_SERVER_URL` (non-secret): публичный URL приложения
- `PAYLOAD_SECRET` (secret)
- `DATABASE_URI` (secret)

**Опциональные:**
- `CRON_SECRET` (secret)
- `PREVIEW_SECRET` (secret)
- `SEED_KEY` (secret; если seed endpoint включён)

**Ecommerce (Stripe):**
- `STRIPE_SECRET_KEY` (secret)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (non-secret)
- `STRIPE_WEBHOOKS_SIGNING_SECRET` (secret)

### 6) Валидация env vars
- В `apps/<app>/src/env.ts` описываем схему (Zod) и правила обязательности.
- Общая функция валидации — в `packages/env`.
- Валидационные ошибки не должны выводить значения секретов.

Политика обязательности:
- `dev`: допускаем отсутствующие секреты (локальные дефолты).
- `stage` и `prod`: обязательная явная настройка, иначе приложение падает при старте.

### 7) Миграции и env vars
- Мigrations Job должен получать тот же набор env vars, что и основной `Deployment` (включая `SYNESTRA_ENV`).

## Validation
- В `web-core` отсутствуют plaintext‑секреты.
- `SYNESTRA_ENV` задан для всех k8s deployments.
- Валидация env vars падает только по отсутствующим значениям, без утечек секретов.

## Rollback / cleanup
- Откатить изменения в `deploy/env/*` и в app‑валидации через Git.
- Проверить, что Secrets остаются в `synestra-platform` и не затронуты.

## References
- Next.js: Environment Variables (App Router) — https://nextjs.org/docs/app/guides/environment-variables
- Kubernetes: Secrets — https://kubernetes.io/docs/concepts/configuration/secret/
