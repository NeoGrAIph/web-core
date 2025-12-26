# web-synestra-io

Документ для фиксации параметров окружения и инфраструктуры приложения.

## Миграции и сборка образа

- **Prod‑сборка требует готовую схему в БД.** В `Dockerfile.prod` build подключается к БД и выполняет SSG (`pnpm build`). Если таблиц нет, сборка падает с ошибкой `relation "pages" does not exist`.
- **Файлы миграций должны быть в git.** Их нужно создать заранее, иначе `payload migrate` не сможет поднять схему на пустой БД.
- **Как создать миграции в dev:** при активной Okteto dev‑сессии запускаем `payload migrate:create` напрямую в dev‑поде (через `kubectl exec`). Файлы появляются в `apps/synestra-io/src/migrations/` и синкаются локально, затем их нужно коммитить в git.
- **Dev‑режим с пустой БД:** при `okteto up` используется `PAYLOAD_DB_PUSH=true`, поэтому схема создаётся автоматически через **db push** (не через `payload migrate`). Это удобно для dev, но **не заменяет** миграции для prod.

## Базы данных

### Dev
- **Тип:** Postgres (CloudNativePG).
- **Кластер:** `synestra-io-dev-cnpg` (namespace `databases`).
- **Манифест кластера:** `synestra-platform/infra/databases/cloudnativepg-web/web-synestra-io-dev/cluster.yaml`.
- **DB/роль (initdb):** `synestra_io` (bootstrap в manifest).
- **Секрет initdb:** `synestra-io-initdb-secret` (используется в manifest).
- **Переменная подключения приложения:** `DATABASE_URI`.
- **Где хранится `DATABASE_URI`:** SOPS‑секрет `synestra-platform/secrets/web-synestra-io-dev/web-synestra-io-dev-env.yaml`.

#### Ручная очистка dev БД (кластер + PVC)
```bash
kubectl -n databases delete cluster synestra-io-dev-cnpg
kubectl -n databases delete pvc -l cnpg.io/cluster=synestra-io-dev-cnpg
```
Комментарий: PVC на `local-path` могут переходить в `Terminating` и удаляться с задержкой — это ожидаемо.

### Prod
- **Тип:** Postgres (CloudNativePG).
- **Кластер:** `synestra-io-cnpg` (namespace `databases`).
- **Манифест кластера:** `synestra-platform/infra/databases/cloudnativepg-web/web-synestra-io-prod/cluster.yaml`.
- **DB/роль (initdb):** `synestra_io` (bootstrap в manifest).
- **Секрет initdb:** `synestra-io-initdb-secret` (используется в manifest).
- **Переменная подключения приложения:** `DATABASE_URI`.
- **Где хранится `DATABASE_URI`:** SOPS‑секрет `synestra-platform/secrets/web-synestra-io-prod/web-synestra-io-prod-env.yaml`.

## Объектное хранилище (S3)

### Общая инфраструктура
- **Провайдер:** MinIO (внутри кластера).
- **Бэкапы CNPG:** `minio-web-cnpg-backups` в `object-storage-web-core` (bucket `cnpg-backups`).
  - Манифест: `synestra-platform/infra/object-storage/minio/values.web-synestra-io.yaml`.
- **Медиа:** `minio-web-synestra-io` в `object-storage-web-core` (buckets `payload-media-prod`, `payload-media-dev`).
  - Манифест: `synestra-platform/infra/object-storage/minio/values.web-synestra-io-media.yaml`.

### Переменные приложения (web-core values)
- **Dev:** `deploy/env/dev/synestra-io.yaml`
  - `S3_ENDPOINT` = `http://minio-web-synestra-io.object-storage-web-core.svc.cluster.local:9000`
  - `S3_BUCKET` = `payload-media-dev`
  - `S3_REGION` = `us-east-1`
  - `S3_FORCE_PATH_STYLE` = `true`
- **Prod:** `deploy/env/prod/synestra-io.yaml`
  - `S3_ENDPOINT` = `http://minio-web-synestra-io.object-storage-web-core.svc.cluster.local:9000`
  - `S3_BUCKET` = `payload-media-prod`
  - `S3_REGION` = `us-east-1`
  - `S3_FORCE_PATH_STYLE` = `true`

### Резервное копирование БД (CNPG)
- **Prod объектное хранилище:** `s3://cnpg-backups/synestra-io-cnpg`
- **Endpoint:** `http://minio-web-cnpg-backups.object-storage-web-core.svc.cluster.local:9000`
- **Манифест:** `synestra-platform/infra/databases/cloudnativepg-web/web-synestra-io-prod/cluster.yaml`
