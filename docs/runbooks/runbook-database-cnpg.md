# Runbook: добавить базу данных Postgres через CloudNativePG (CNPG) для нового web‑приложения

Статус: актуально на **2025-12-16**.  
Канон: `docs/architecture/database-cnpg.md`.

Цель: повторяемо подготовить dev/prod БД для нового сайта/приложения в нашей GitOps‑схеме:
- web‑приложение живёт в `web-core`,
- БД управляется платформой (`synestra-platform`, namespace `databases`),
- секреты — только в `synestra-platform` (SOPS).

---

## 0) Входные данные (что нужно заранее решить)

- `<app-key>` — ключ приложения (например `corporate`, `shop`, `synestra-io`).
- `<db_name>` — имя базы (обычно совпадает с “snake_case” вариантом, например `synestra_io`).
- `<db_owner>` — владелец (обычно совпадает с `<db_name>` или `<app-key>`).
- размеры storage и требования к HA (на старте обычно `instances: 1`).

---

## 1) `synestra-platform`: создать initdb secret (SOPS)

Файл: `synestra-platform/secrets/databases/<app-key>-initdb-secret.yaml`

Рекомендации:
- `metadata.namespace: databases`
- `type: kubernetes.io/basic-auth`
- ключи: `username`, `password`
- секрет шифруем SOPS (см. `synestra-platform/docs/wiki/secret-creation.md`)

Важно: пока допустимо использовать **один** initdb secret для dev+prod одного сайта.

---

## 2) `synestra-platform`: добавить CNPG Cluster manifests (dev + prod)

Рекомендуемая структура (как уже используется на платформе):

- `synestra-platform/infra/databases/cloudnativepg/<app-key>/cluster.yaml` (prod)
- `synestra-platform/infra/databases/cloudnativepg/<app-key>/kustomization.yaml`
- `synestra-platform/infra/databases/cloudnativepg/<app-key>-dev/cluster.yaml` (dev)
- `synestra-platform/infra/databases/cloudnativepg/<app-key>-dev/kustomization.yaml`

Критично:
- namespace всегда `databases`
- имена кластеров:
  - prod: `<app-key>-cnpg`
  - dev: `<app-key>-dev-cnpg`
- `bootstrap.initdb`:
  - `database: <db_name>`
  - `owner: <db_owner>`
  - `secret.name: <app-key>-initdb-secret`
- защита от случайного удаления:
  - `metadata.annotations.argocd.argoproj.io/manifest-gc-strategy: orphan`

---

## 3) `synestra-platform`: добавить ArgoCD Applications для БД

Создаём 2 приложения (manual sync обычно ок):

- `synestra-platform/argocd/apps/infra-<app-key>-db.yaml`
  - source path: `infra/databases/cloudnativepg/<app-key>`
  - destination namespace: `databases`
- `synestra-platform/argocd/apps/infra-<app-key>-dev-db.yaml`
  - source path: `infra/databases/cloudnativepg/<app-key>-dev`
  - destination namespace: `databases`

---

## 4) `synestra-platform`: канон секретов `DATABASE_URI` (dev + prod)

В web‑namespace’ах должны быть runtime env secrets приложения **без** `DATABASE_URI`:
- `web-<app-key>-dev-env` в `web-<app-key>-dev` (например `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`)
- `web-<app-key>-prod-env` в `web-<app-key>-prod`

`DATABASE_URI` материализуем в отдельный runtime Secret `web-<app-key>-<env>-db-env`, который создаётся CronJob’ом в namespace `databases`.

### 4.1. Добавить “db-uri-sync” манифесты (dev + prod)

Добавляем в `synestra-platform` по одному файлу на окружение:
- `infra/databases/cloudnativepg/<app-key>-dev/db-uri-sync.yaml`
- `infra/databases/cloudnativepg/<app-key>/db-uri-sync.yaml`

Что делают эти манифесты:
- читают `databases/<app-key>-initdb-secret` (`username`/`password`);
- собирают `DATABASE_URI` на базе host’а CNPG write service:
  - dev: `<app-key>-dev-cnpg-rw.databases.svc.cluster.local`
  - prod: `<app-key>-cnpg-rw.databases.svc.cluster.local`
- создают/обновляют Secret:
  - `web-<app-key>-dev/web-<app-key>-dev-db-env` с ключом `DATABASE_URI`
  - `web-<app-key>-prod/web-<app-key>-prod-db-env` с ключом `DATABASE_URI`

Пример (реализация для `synestra-io`):
- `synestra-platform/infra/databases/cloudnativepg/synestra-io-dev/db-uri-sync.yaml`
- `synestra-platform/infra/databases/cloudnativepg/synestra-io/db-uri-sync.yaml`

### 4.2. Как подключать секреты в chart `web-app`

В `web-core`:
- `envFrom.secretRef: "web-<app-key>-<env>-env"`
- `envFrom.extraSecretRefs[]` должен включать:
  - `"web-<app-key>-<env>-db-env"`
  - (опционально) `"web-<app-key>-<env>-s3-env"`

Формат `DATABASE_URI` (Postgres):

```text
postgresql://<username>:<password>@<host>:5432/<db_name>
```

Секреты правим только в `synestra-platform/secrets/**` и шифруем SOPS.

---

## 5) `web-core`: отключить встроенную БД в chart и ссылаться на Secret

В values приложения:

- `deploy/env/dev/<app-key>.yaml`
- `deploy/env/prod/<app-key>.yaml`

должно быть:
- `envFrom.secretRef: "web-<app-key>-<env>-env"`
- `envFrom.extraSecretRefs` включает `"web-<app-key>-<env>-db-env"`
- `postgres.enabled: false`

Это фиксирует единый паттерн: web‑chart не создаёт Postgres внутри `web-*` namespace.

---

## 6) Порядок применения (важно)

1) `infra-secrets` (ArgoCD) — чтобы secrets появились в кластере.
2) DB apps:
   - `infra-<app-key>-db`
   - `infra-<app-key>-dev-db`
3) web apps (из `web-core`):
   - `web-<app-key>-dev` (сначала dev)
   - promotion → `web-<app-key>-prod`

Если где-то упал hook Job миграций — удаляем Job и синхронизируем заново (Job immutable).

---

## 7) Быстрая проверка

- В namespace `databases`:
  - CNPG Cluster `Healthy`
  - сервисы `*-rw` существуют
- В namespace приложения:
  - hook Job миграций `Succeeded`
  - `Deployment` `Available`
  - домен отвечает `200`

---

## 8) Refresh dev‑БД из prod‑БД

См. отдельный runbook: `docs/runbooks/runbook-db-refresh-dev-from-prod.md`.
