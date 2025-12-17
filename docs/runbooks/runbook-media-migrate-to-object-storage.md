# Runbook: перевести хранение Media (Payload uploads) на object storage (MinIO / S3)

Статус: актуально на **2025-12-17**.

Цель: отказаться от хранения uploads на PVC (`public/media`) и хранить медиа в S3‑совместимом object storage (у нас MinIO), чтобы:
- refresh dev из prod не требовал синхронизации media PVC;
- упростить масштабирование и независимость от нод/дисков;
- сделать хранение медиа более предсказуемым (bucket/prefix per‑site).

Связанные документы:
- `docs/runbooks/runbook-db-refresh-dev-from-prod.md`
- `docs/runbooks/runbook-dev-prod-flow.md`
- `docs/backlog/next-media-route.md`

## 0) Предпосылки

- В кластере есть MinIO (S3‑compatible) и он Healthy:
  - ArgoCD app: `infra-minio-web-synestra-io`
  - Namespace: `object-storage-web-core`
- В `apps/<app>` включён storage plugin Payload для S3 (`@payloadcms/storage-s3`).
- В `deploy/env/{dev,prod}/<app>.yaml` выставлены:
  - `SYNESTRA_MEDIA_STORAGE=s3`
  - `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_FORCE_PATH_STYLE`
- В secret `web-<app>-<env>-env` есть креды:
  - `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

Важно: в `web-core` секреты не коммитим. В GitOps values храним только **имя Secret**.

## 1) Подготовить bucket

Bucket должен существовать до переключения приложения на S3.

Пример bucket: `payload-media`.

## 2) Перенести текущие файлы из PVC в bucket (один раз)

Если prod ранее хранил uploads на PVC, нужно скопировать файлы, иначе после переключения будут 404 на `/api/media/file/...`.

Рекомендация: копировать внутри кластера через временный Pod, который:
- монтирует `web-<app>-prod-web-app-media` как `/src`;
- получает `S3_*` креды через `envFrom.secretRef`;
- выполняет `mc mirror` в bucket.

## 3) Переключить приложение на S3 и отключить PVC

1) Убедиться, что app умеет работать с S3 (новый образ собран/развернут).
2) В values отключить PVC:
- `persistence.media.enabled: false`
3) Выполнить rollout.

## 4) Проверки

- `GET /` не даёт 500.
- `GET /api/media/file/<known>` отдаёт 200 (проверить несколько файлов).
- Новая загрузка файла через Payload Admin появляется в bucket и доступна через сайт.

## 5) Откат (если нужно)

Если требуется временно откатиться:
- вернуть `SYNESTRA_MEDIA_STORAGE=local`;
- вернуть `persistence.media.enabled: true` (PVC);
- выполнить rollout.

Примечание: откат возможен только пока PVC не удалён/не потерян.

## 6) Troubleshooting

### 404 на `GET /api/media/file/<filename>`

1) **Если ответ — JSON вида `{"message":"File not found"}`**, почти всегда это означает, что Payload пытается читать файл **локально** (из `staticDir`/PVC), а не через S3‑adapter.

Проверь:
- `SYNESTRA_MEDIA_STORAGE=s3` реально есть в env у pod.
- В secret `web-<app>-<env>-env` присутствуют `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` и они не “перезатираются” GitOps‑синком.
- `@payloadcms/storage-s3` подключён в `plugins` Payload и включается **на runtime** (после rollout).

2) **Если ответ — пустой 404 (Not Found) без JSON**, это уже похоже на ответ S3‑staticHandler, то есть adapter работает, но объект не найден по ключу.

Тогда проверь:
- Bucket/endpoint/region/forcePathStyle соответствуют MinIO.
- В bucket присутствует нужный объект по ожидаемому ключу.
  - `@payloadcms/storage-s3` использует ключ вида `path.posix.join(prefix, filename)`.
  - `prefix` берётся из поля `prefix` в документе Media (если оно заполнено). Если в БД у файлов есть `prefix`, то при миграции нужно сохранить этот путь в object storage.
