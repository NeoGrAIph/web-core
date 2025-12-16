# Канон: базы данных Postgres через CloudNativePG (CNPG)

Статус: **временный канон**, актуален на **2025-12-16**.  
Он будет уточняться по мере дальнейшего изучения официальной документации Okteto / Argo CD / CloudNativePG / Payload CMS и накопления практики.

Цель: зафиксировать **единый, повторяемый** способ подготовки БД для новых веб‑приложений (Next.js + Payload) так, чтобы:
- деплои были предсказуемыми в GitOps (Argo CD),
- секреты не попадали в `web-core`,
- naming/структура были “шаблонными” для генераторов и LLM‑агентов,
- dev/prod окружения были максимально похожи по инфраструктуре.

---

## 1) Термины (минимум)

- **CNPG** (CloudNativePG) — оператор PostgreSQL в Kubernetes (CRD `postgresql.cnpg.io/v1`).
- **CNPG Cluster** — ресурс `kind: Cluster`, который поднимает Stateful PostgreSQL.
- **initdb secret** — Secret с кредами владельца БД для bootstrap (`bootstrap.initdb.secret`).
- **RW service** — сервис вида `<cluster>-rw` для записи (например `synestra-io-cnpg-rw`).

---

## 2) Решение “по умолчанию” (для единообразия)

По умолчанию для web‑приложений мы используем **platform-managed DB**:

- CNPG Cluster’ы живут в namespace **`databases`** и управляются репозиторием `synestra-platform`.
- В `web-core` в values приложения ставим:
  - `postgres.enabled: false`
  - приложение подключается к БД через `DATABASE_URI` из Secret (`envFrom.secretRef`).

Почему так (практически):
- web‑Applications (из `web-core`) изолированы AppProject’ом и **не должны** управлять ресурсами платформы;
- БД проще сопровождать (backup/restore/политики/мониторинг) как часть платформы;
- уменьшаем риск “сломать БД” случайным `--prune` при синхронизации web‑приложений.

Допустимая альтернатива (только для экспериментов/быстрых POC):
- **per-namespace DB**: CNPG Cluster создаётся самим Helm chart `deploy/charts/web-app` в namespace приложения (`postgres.enabled: true`).

---

## 3) Нейминг (обязательный стандарт)

### 3.1. Веб‑namespace’ы

- `web-<app-key>-dev`
- `web-<app-key>-stage` (когда появится)
- `web-<app-key>-prod`

Примеры: `web-synestra-io-dev`, `web-corporate-prod`.

### 3.2. CNPG Cluster’ы в `databases`

Рекомендуемый паттерн (как уже используется для `n8n` и `synestra.io`):

- prod: `<app-key>-cnpg`
- dev: `<app-key>-dev-cnpg`
- stage: `<app-key>-stage-cnpg`

### 3.3. initdb secret (bootstrap)

Namespace: `databases`  
Имя: `<app-key>-initdb-secret` (например `synestra-io-initdb-secret`).

Рекомендуемый тип:
- `kubernetes.io/basic-auth`

Ключи (минимум):
- `username`
- `password`

Важно:
- Secret **SOPS‑зашифрован** в Git (`synestra-platform/secrets/databases/**`).
- Мы **можем** временно использовать один initdb secret и для dev и для prod одного сайта (как сейчас для `synestra.io`), но это организационное решение; при ужесточении безопасности легко перейти на отдельные secrets.

### 3.4. runtime env secret приложения

Namespace: `web-<app-key>-<env>`  
Имя: `web-<app-key>-<env>-env` (например `web-synestra-io-dev-env`).

Ключи (минимум, см. `docs/architecture/env-contract.md`):
- `DATABASE_URI`
- `PAYLOAD_SECRET`

---

## 4) Ownership и GitOps‑границы (2 репозитория)

### 4.1. `synestra-platform` (платформа)

Должно содержать:
- SOPS‑секреты:
  - `secrets/databases/<app-key>-initdb-secret.yaml`
  - `secrets/web-<app-key>-<env>/web-<app-key>-<env>-env.yaml` (включая `DATABASE_URI`)
- Манифесты CNPG Cluster’ов (в `databases`):
  - `infra/databases/cloudnativepg/<app-key>/cluster.yaml` (prod)
  - `infra/databases/cloudnativepg/<app-key>-dev/cluster.yaml` (dev)
  - (позже) `infra/databases/cloudnativepg/<app-key>-stage/cluster.yaml` (stage)
- ArgoCD Applications, которые применяют эти манифесты:
  - `argocd/apps/infra-<app-key>-db.yaml`
  - `argocd/apps/infra-<app-key>-dev-db.yaml`

### 4.2. `web-core` (приложение + GitOps артефакты)

Должно содержать:
- values для env:
  - `deploy/env/<env>/<app-key>.yaml`
    - `envFrom.secretRef: web-<app-key>-<env>-env`
    - `postgres.enabled: false` (для platform-managed DB)
- ArgoCD Applications:
  - `deploy/argocd/apps/dev/<app-key>.yaml`
  - `deploy/argocd/apps/prod/<app-key>.yaml`

---

## 5) Минимальный шаблон CNPG Cluster (platform-managed)

Ключевые требования для web‑БД:
- `enableSuperuserAccess: false` (по умолчанию),
- `bootstrap.initdb.database` и `bootstrap.initdb.owner` совпадают с целевым пользователем/БД приложения,
- `bootstrap.initdb.secret.name` указывает на `<app-key>-initdb-secret`,
- защита от случайного prune: `argocd.argoproj.io/manifest-gc-strategy: orphan`,
- мониторинг через PodMonitor (если включён Prometheus Operator на платформе).

---

## 6) `DATABASE_URI` (куда подключаемся)

Для `databases`‑кластеров CNPG создаёт сервисы, например:
- `synestra-io-cnpg-rw.databases.svc.cluster.local`
- `synestra-io-dev-cnpg-rw.databases.svc.cluster.local`

`DATABASE_URI` храним **в runtime env secret** приложения (в web‑namespace), пример формата:

```text
postgresql://<username>:<password>@<cluster>-rw.databases.svc.cluster.local:5432/<database>
```

Важно:
- не печатать секреты в логах/CI;
- не хранить `DATABASE_URI` в `web-core`.

---

## 7) Миграции Payload (как “правильно” в GitOps)

В `deploy/charts/web-app` миграции выполняются Job’ом как Argo CD hook:
- hook: `Sync` (не `PreSync`, чтобы не ловить deadlock на первом install, когда БД создаётся/поднимается параллельно),
- Job ждёт доступности Postgres по TCP и затем запускает `payload migrate`.

Правила:
- **миграции обязаны быть в git** (`apps/<app>/src/migrations/**`), иначе rollout становится недетерминированным;
- если hook Job упал, его нужно удалить и пересинхронизировать приложение (Job immutable):
  - `kubectl -n <ns> delete job <name>`
  - `argocd app sync <app> --prune` (если требуется).

Нормативный документ по миграциям Payload+Postgres: `docs/architecture/payload-migrations.md`.

---

## 8) Важный нюанс: bootstrap не “переигрывается”

Если CNPG Cluster уже создан, изменения в `bootstrap.initdb.*` **не применятся** к существующему кластеру.

Поэтому любые правки:
- пользователя/владельца,
- initdb secret,
- имени БД,

требуют **пересоздания** кластера (в dev — нормально; в prod — только осознанно, через backup/restore план).

---

## 9) Backup/Restore и “DB refresh” dev ← prod

Цель: иметь управляемый способ:
- регулярно бэкапить prod,
- восстанавливать prod при авариях,
- делать refresh dev‑БД из prod‑снимка для разработки.

Финальный (рекомендуемый) механизм для CloudNativePG:
- `spec.backup.barmanObjectStore` на prod‑кластере,
- `ScheduledBackup` для prod (и/или on-demand `Backup`),
- восстановление dev через `bootstrap.recovery` (пересоздание dev‑кластера из backup).

Предпосылки:
- S3‑совместимое object storage (S3/MinIO) и SOPS‑секрет с доступом;
- договорённость по ретеншну/стоимости и нагрузке на prod.

Временный (допустимый на старте) механизм без object storage:
- in‑cluster `pg_dump | pg_restore` из prod в dev.

Операционная инструкция: `docs/runbooks/runbook-db-refresh-dev-from-prod.md`.

---

## 9) Чеклист для нового приложения (коротко)

1) `synestra-platform`: создать `<app-key>-initdb-secret` (SOPS) в `secrets/databases/`.
2) `synestra-platform`: добавить CNPG Cluster manifests для dev/prod в `infra/databases/cloudnativepg/`.
3) `synestra-platform`: добавить ArgoCD Applications `infra-<app-key>-db` и `infra-<app-key>-dev-db`.
4) `synestra-platform`: добавить/обновить `web-<app-key>-<env>-env` secret’ы с `DATABASE_URI`.
5) `web-core`: поставить `postgres.enabled=false` и указать `envFrom.secretRef`.
6) Порядок синхронизации:
   - `infra-secrets` (чтобы secrets появились),
   - DB apps (`infra-<app-key>-db`, `infra-<app-key>-dev-db`),
   - web apps (`web-<app-key>-dev`, затем promotion в prod).
