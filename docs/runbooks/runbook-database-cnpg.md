# Runbook: добавить базу данных Postgres через CloudNativePG (CNPG) для нового web‑приложения

Статус: актуально на **2025-12-16**.

Цель: повторяемо подготовить dev/prod БД для нового сайта/приложения в нашей GitOps‑схеме:
- web‑приложение живёт в `web-core`,
- БД управляется платформой (`synestra-platform`, namespace `databases`),
- секреты — только в `synestra-platform` (SOPS).

---

## 0) Решение по умолчанию (platform-managed DB)

По умолчанию используем **platform-managed DB**:
- CNPG Cluster’ы живут в namespace `databases` и управляются `synestra-platform`.
- В `web-core` для приложения всегда `postgres.enabled: false` и подключение по `DATABASE_URI`.

Допустимая альтернатива (только для POC/экспериментов):
- per-namespace DB (CNPG Cluster создаёт Helm chart `deploy/charts/web-app` в namespace приложения).

## 1) Термины (минимум)

- **CNPG** (CloudNativePG) — оператор PostgreSQL в Kubernetes (CRD `postgresql.cnpg.io/v1`).
- **CNPG Cluster** — ресурс `kind: Cluster`, который поднимает Stateful PostgreSQL.
- **initdb secret** — Secret с кредами владельца БД для bootstrap (`bootstrap.initdb.secret`).
- **RW service** — сервис вида `<cluster>-rw` для записи (например `synestra-io-cnpg-rw`).

## 2) Нейминг (обязательный стандарт)

### 2.1 Веб‑namespace’ы

- `web-<app-key>-dev`
- `web-<app-key>-stage` (когда появится)
- `web-<app-key>-prod`

### 2.2 CNPG Cluster’ы в `databases`

- prod: `<app-key>-cnpg`
- dev: `<app-key>-dev-cnpg`
- stage: `<app-key>-stage-cnpg`

### 2.3 initdb secret (bootstrap)

Namespace: `databases`  
Имя: `<app-key>-initdb-secret`

Ключи:
- `username`
- `password`

### 2.4 runtime env secret приложения

Namespace: `web-<app-key>-<env>`  
Имя: `web-<app-key>-<env>-env`

Ключи (минимум):
- `DATABASE_URI`
- `PAYLOAD_SECRET`

## 3) Входные данные (что нужно заранее решить)

- `<app-key>` — ключ приложения (например `corporate`, `shop`, `synestra-io`).
- `<db_name>` — имя базы (обычно совпадает с “snake_case” вариантом, например `synestra_io`).
- `<db_owner>` — владелец (обычно совпадает с `<db_name>` или `<app-key>`).
- размеры storage и требования к HA (на старте обычно `instances: 1`).

Важно:
- bootstrap `initdb` применяется **только при создании** кластера; изменения `bootstrap.initdb.*` на существующем кластере не сработают → требуется пересоздание (в dev допустимо, в prod только осознанно).

---

## 4) Ownership и GitOps‑границы (2 репозитория)

### `synestra-platform` (платформа)
- SOPS‑секреты (`secrets/databases/**`, `secrets/web-<app>-<env>/**`).
- CNPG Cluster’ы в namespace `databases` (`infra/databases/cloudnativepg/**`).
- ArgoCD Applications для БД (`argocd/apps/infra-<app>-db*.yaml`).

### `web-core` (приложение)
- values `deploy/env/<env>/<app>.yaml` с `envFrom.secretRef` и `postgres.enabled:false`.
- ArgoCD Applications `deploy/argocd/apps/{dev,prod}/<app>.yaml`.

---

## 5) `synestra-platform`: создать initdb secret (SOPS)

Файл: `synestra-platform/secrets/databases/<app-key>-initdb-secret.yaml`

Рекомендации:
- `metadata.namespace: databases`
- `type: kubernetes.io/basic-auth`
- ключи: `username`, `password`
- секрет шифруем SOPS (см. `synestra-platform/docs/wiki/secret-creation.md`)

Важно: пока допустимо использовать **один** initdb secret для dev+prod одного сайта.

---

## 6) `synestra-platform`: добавить CNPG Cluster manifests (dev + prod)

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

## 7) `synestra-platform`: добавить ArgoCD Applications для БД

Создаём 2 приложения (manual sync обычно ок):

- `synestra-platform/argocd/apps/infra-<app-key>-db.yaml`
  - source path: `infra/databases/cloudnativepg/<app-key>`
  - destination namespace: `databases`
- `synestra-platform/argocd/apps/infra-<app-key>-dev-db.yaml`
  - source path: `infra/databases/cloudnativepg/<app-key>-dev`
  - destination namespace: `databases`

---

## 8) `synestra-platform`: добавить `DATABASE_URI` в web env secrets (dev + prod)

В web‑namespace’ах должны быть runtime env secrets:
- `web-<app-key>-dev-env` в `web-<app-key>-dev`
- `web-<app-key>-prod-env` в `web-<app-key>-prod`

Там должен быть `DATABASE_URI`, который указывает на сервис CNPG в `databases`, например:

- dev host: `<app-key>-dev-cnpg-rw.databases.svc.cluster.local`
- prod host: `<app-key>-cnpg-rw.databases.svc.cluster.local`

Формат `DATABASE_URI` зависит от используемого драйвера, но для Postgres обычно:

```text
postgresql://<username>:<password>@<host>:5432/<db_name>
```

Секреты правим только в `synestra-platform/secrets/**` и шифруем SOPS.

---

## 9) `web-core`: отключить встроенную БД в chart и ссылаться на Secret

В values приложения:

- `deploy/env/dev/<app-key>.yaml`
- `deploy/env/prod/<app-key>.yaml`

должно быть:
- `envFrom.secretRef: "web-<app-key>-<env>-env"`
- `postgres.enabled: false`

Это фиксирует единый паттерн: web‑chart не создаёт Postgres внутри `web-*` namespace.

Примечание: для POC можно включить `postgres.enabled: true`, но это **не** основной путь.

---

## 10) Порядок применения (важно)

1) `infra-secrets` (ArgoCD) — чтобы secrets появились в кластере.
2) DB apps:
   - `infra-<app-key>-db`
   - `infra-<app-key>-dev-db`
3) web apps (из `web-core`):
   - `web-<app-key>-dev` (сначала dev)
   - promotion → `web-<app-key>-prod`

Если где-то упал hook Job миграций — удаляем Job и синхронизируем заново (Job immutable).

---

## 11) Быстрая проверка

- В namespace `databases`:
  - CNPG Cluster `Healthy`
  - сервисы `*-rw` существуют
- В namespace приложения:
  - hook Job миграций `Succeeded`
  - `Deployment` `Available`
  - домен отвечает `200`

---

## 12) Минимальный шаблон CNPG Cluster (platform-managed)

Ключевые требования:
- `enableSuperuserAccess: false` (по умолчанию),
- `bootstrap.initdb.database` и `bootstrap.initdb.owner` совпадают с целевым пользователем/БД приложения,
- `bootstrap.initdb.secret.name` указывает на `<app-key>-initdb-secret`,
- защита от случайного prune: `argocd.argoproj.io/manifest-gc-strategy: orphan`,
- мониторинг через PodMonitor (если включён Prometheus Operator на платформе).

## 13) Миграции Payload (канон GitOps)

- Миграции запускаются Job’ом как ArgoCD hook (`Sync`) в `deploy/charts/web-app`.
- Job ждёт Postgres и затем выполняет `payload migrate`.
- Миграции должны быть в git (`apps/<app>/src/migrations/**`), иначе rollout недетерминированный.
- Если Job упал — удалить Job и пересинхронизировать приложение (Job immutable).

См. также: `docs/runbooks/runbook-payload-migrations.md`.

## 14) Backup/Restore и refresh dev ← prod

Рекомендуемый (финальный) механизм:
- `spec.backup.barmanObjectStore` на prod‑кластере,
- `ScheduledBackup` или on‑demand `Backup`,
- восстановление dev через `bootstrap.recovery` (пересоздание dev‑кластера из backup).

Временный (допустимый) механизм:
- in‑cluster `pg_dump | pg_restore` из prod в dev.

Операционный runbook: `docs/runbooks/runbook-db-refresh-dev-from-prod.md`.

## 15) Refresh dev‑БД из prod‑БД

См. отдельный runbook: `docs/runbooks/runbook-db-refresh-dev-from-prod.md`.

## 16) Чеклист для нового приложения (коротко)

1) `synestra-platform`: создать `<app-key>-initdb-secret` (SOPS) в `secrets/databases/`.
2) `synestra-platform`: добавить CNPG Cluster manifests для dev/prod в `infra/databases/cloudnativepg/`.
3) `synestra-platform`: добавить ArgoCD Applications `infra-<app-key>-db` и `infra-<app-key>-dev-db`.
4) `synestra-platform`: добавить/обновить `web-<app-key>-<env>-env` secret’ы с `DATABASE_URI`.
5) `web-core`: поставить `postgres.enabled=false` и указать `envFrom.secretRef`.
6) Порядок синхронизации:
   - `infra-secrets`,
   - DB apps (`infra-<app-key>-db`, `infra-<app-key>-dev-db`),
   - web apps (`web-<app-key>-dev`, затем promotion в prod).
