# web-synestra-io

Документ для фиксации параметров окружения и инфраструктуры приложения.

## Базы данных

### Dev
- **Тип:** Postgres (CloudNativePG).
- **Кластер:** `synestra-io-dev-cnpg` (namespace `databases`).
- **Манифест кластера:** `synestra-platform/infra/databases/cloudnativepg-web/web-synestra-io-dev/cluster.yaml`.
- **DB/роль (initdb):** `synestra_io` (bootstrap в manifest).
- **Секрет initdb:** `synestra-io-initdb-secret` (используется в manifest).
- **Переменная подключения приложения:** `DATABASE_URI`.
- **Где хранится `DATABASE_URI`:** SOPS‑секрет `synestra-platform/secrets/web-synestra-io-dev/web-synestra-io-dev-env.yaml`.

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
- **Release/namespace:** `minio-web-cnpg-backups` в `object-storage-web-core`.
- **Манифест MinIO:** `synestra-platform/infra/object-storage/minio/values.web-synestra-io.yaml`.
- **Buckets:** `cnpg-backups`, `payload-media-prod`, `payload-media-dev`.

### Переменные приложения (web-core values)
- **Dev:** `deploy/env/dev/synestra-io.yaml`
  - `S3_ENDPOINT` = `http://minio-web-cnpg-backups.object-storage-web-core.svc.cluster.local:9000`
  - `S3_BUCKET` = `payload-media-dev`
  - `S3_REGION` = `us-east-1`
  - `S3_FORCE_PATH_STYLE` = `true`
- **Prod:** `deploy/env/prod/synestra-io.yaml`
  - `S3_ENDPOINT` = `http://minio-web-cnpg-backups.object-storage-web-core.svc.cluster.local:9000`
  - `S3_BUCKET` = `payload-media-prod`
  - `S3_REGION` = `us-east-1`
  - `S3_FORCE_PATH_STYLE` = `true`

### Резервное копирование БД (CNPG)
- **Prod объектное хранилище:** `s3://cnpg-backups/synestra-io-cnpg`
- **Endpoint:** `http://minio-web-cnpg-backups.object-storage-web-core.svc.cluster.local:9000`
- **Манифест:** `synestra-platform/infra/databases/cloudnativepg-web/web-synestra-io-prod/cluster.yaml`
