# Runbook: refresh dev media bucket из prod (MinIO/S3) через `mc mirror` в кластере

Статус: актуально на **2025-12-18**.

Цель: когда dev‑БД актуализируется из prod, привести **dev object storage** (bucket для Payload media uploads) к состоянию prod, не трогая prod bucket.

Канон:
- **разные bucket’ы** для prod и dev (или минимум разные `prefix`), чтобы dev не мог повредить prod‑медиа;
- refresh делаем **внутри кластера** одноразовым Job (повторяемо, без установки утилит локально);
- не занимаем путь `/api/media/file/*` кастомным Next route (см. `docs/runbooks/runbook-media-migrate-to-object-storage.md` и `docs/runbooks/runbook-db-refresh-dev-from-prod.md`).

## 0) Предпосылки

1) Приложение использует `@payloadcms/storage-s3` и настроено на MinIO/S3.
2) У нас есть два bucket’а:
   - prod: `payload-media-prod`
   - dev: `payload-media-dev`

3) В кластере есть секрет для Job с доступами к обоим bucket’ам (source/destination).
   - Мы **не коммитим plaintext**. Secret создаётся в `synestra-platform` (SOPS) и затем применяется через `argo/infra-secrets`.
   - Имя секрета (по умолчанию в job): `web-synestra-io-dev-media-mirror-env` в namespace `web-synestra-io-dev`.

Ключи/переменные в Secret:
- `SRC_ENDPOINT` (обычно in-cluster MinIO service)
- `SRC_ACCESS_KEY_ID`
- `SRC_SECRET_ACCESS_KEY`
- `SRC_BUCKET` (`payload-media-prod`)
- `DST_ENDPOINT`
- `DST_ACCESS_KEY_ID`
- `DST_SECRET_ACCESS_KEY`
- `DST_BUCKET` (`payload-media-dev`)

## 1) Запуск refresh через Kubernetes Job (внутри кластера)

Job‑манифест (в `web-core`):
- `deploy/jobs/media-mirror-dev-from-prod.yaml`

Применить Job:

```bash
kubectl -n web-synestra-io-dev apply -f deploy/jobs/media-mirror-dev-from-prod.yaml
kubectl -n web-synestra-io-dev wait --for=condition=complete job/media-mirror-dev-from-prod --timeout=60m
kubectl -n web-synestra-io-dev logs job/media-mirror-dev-from-prod
```

Очистить Job (чтобы можно было запускать заново):

```bash
kubectl -n web-synestra-io-dev delete job/media-mirror-dev-from-prod --ignore-not-found
```

## 2) Важные нюансы (Payload)

1) Payload ожидает, что object keys совпадают с тем, что он вычисляет на чтение:
- как правило это `prefix + filename`, где `prefix` берётся из поля `prefix` документа `media`.

Поэтому нельзя копировать “в плоский корень” — нужно сохранять пути.
`mc mirror` это делает корректно: ключи сохраняются.

2) Если dev и prod используют разные bucket’ы, но в dev‑БД лежат ссылки/ключи из prod — это нормально: ключи одинаковые, bucket другой, мы их переносим mirror’ом.

## 3) Как это запускать через Okteto (опционально)

Если хочется унифицировать запуск “ops‑таски” через Okteto:

1) Выбираем Okteto context/namespace:

```bash
okteto context use <synestra-okteto>
okteto namespace web-synestra-io-dev
```

2) Запускаем те же команды `kubectl apply/wait/logs`, но уже в Okteto‑контексте (kubeconfig/namespace подхватятся автоматически).

Если в будущем понадобится запускать refresh как часть “одной кнопки” (`okteto deploy`/pipeline) — можно вынести эти команды в `deploy:` секцию Okteto manifest или в отдельный pipeline.
