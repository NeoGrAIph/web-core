# Runbook: “кнопки” в Okteto UI для refresh dev (DB / DB+Media)

Статус: актуально на **2025-12-18**.

Цель: дать разработчикам две “кнопки” в Okteto UI для dev‑окружения `web-synestra-io-dev`:
- **Refresh DB** (dev DB ← prod DB)
- **Refresh (DB+Media)** (dev DB ← prod DB + dev media bucket ← prod media bucket)

Канон: используем Okteto **Catalog Items** (CRD `catalogitems.git.okteto.com/v1`) как GitOps‑управляемые, read‑only entries в UI.

Официальная документация:
- Catalog Items через CRD: `https://www.okteto.com/docs/1.39/self-hosted/manage/custom-resource-definitions/`
- Deploy from Catalog: `https://www.okteto.com/docs/development/deploy/deploy-from-catalog/`

## 1) Что должно быть в репозитории `web-core`

1) One-off Job для refresh DB:
- `deploy/jobs/db-refresh-synestra-io-dev-from-prod.yaml`

2) One-off Job для refresh media:
- `deploy/jobs/media-mirror-dev-from-prod.yaml`

3) Два “deploy-only” Okteto manifest’а, которые запускают эти Job’ы:
- `.okteto/refresh-db.yml`
- `.okteto/refresh-db-media.yml`

## 2) Что должно быть в `synestra-platform` (GitOps)

1) MinIO bucket’ы и политики:
- prod bucket: `payload-media-prod`
- dev bucket: `payload-media-dev`

2) DNS для Okteto registry/buildkit

Okteto remote execution / catalog deploy использует BuildKit и registry endpoints:
- `buildkit.services.synestra.tech`
- `registry.services.synestra.tech`

Если эти имена не резолвятся из кластера (NXDOMAIN), кнопки будут “висеть” ещё до запуска наших Job’ов.

Временный GitOps‑фикс (пока не заведены публичные DNS записи): добавить эти имена в CoreDNS NodeHosts.
Сейчас это делается в `synestra-platform` через `clusters/core/coredns.yaml`.

3) Secret для mirror job в namespace `web-synestra-io-dev`:
- `web-synestra-io-dev-media-mirror-env` (с `SRC_*`/`DST_*`)

4) Два CatalogItem ресурса в namespace `okteto`, которые появятся в UI как отдельные пункты каталога.

## 3) Как запускать из Okteto UI

1) Открыть Okteto UI → `Namespaces` → выбрать `web-synestra-io-dev`.
2) Нажать `Deploy Dev Environment` → вкладка `Catalog`.
3) Выбрать один из пунктов:
   - `synestra-io: Refresh DB`
   - `synestra-io: Refresh (DB+Media)`
4) Нажать `Deploy` и дождаться `Success`.

## 4) Что делать, если refresh не сработал

- DB refresh:
  - проверь, что dev app не держит активных соединений к БД (лучше временно scale down).
  - посмотри логи job `refresh-synestra-io-dev-db-from-prod` в namespace `databases`.

- Media refresh:
  - проверь логи job `media-mirror-dev-from-prod` в namespace `web-synestra-io-dev`.
  - bucket должен существовать (создаётся платформой); mirror job не создаёт bucket.

Примечание про логи:
- `.okteto/refresh-*.yml` удаляет Job в начале (чтобы можно было запускать повторно), но не удаляет в конце — чтобы логи можно было посмотреть руками.
