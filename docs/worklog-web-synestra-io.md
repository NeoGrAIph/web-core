# Worklog: web-synestra-io

Дата: 2025-12-25

## Итоговое состояние (действующие изменения)

### web-core
- Приложение `synestra-io` находится в `apps/synestra-io` (без вложенного `template`).
- `apps/synestra-io` переведено на Postgres:
  - используется `@payloadcms/db-postgres` в `src/payload.config.ts`;
  - настроен `migrationDir` и `push` для non‑prod.
- Подключено S3‑хранилище для media через `@payloadcms/storage-s3` и env‑флаг `SYNESTRA_MEDIA_STORAGE=s3`.
- Stripe временно отключён в коде:
  - `paymentMethods` пустой;
  - checkout и confirm‑order безопасно отключены через `NEXT_PUBLIC_ENABLE_STRIPE=false`.
- Обновлён `importMap` админки под S3‑upload handler.
- В `.env.example` добавлены Postgres/S3 env‑переменные и флаг `NEXT_PUBLIC_ENABLE_STRIPE=false`.
- Создан `apps/synestra-io/pnpm-lock.yaml` для корректной сборки.
- Добавлен README в корень `web-core` с описанием структуры репозитория.

### synestra-platform
- Добавлены отдельные Dockerfile для `web-synestra-io`:
  - `docker/web-synestra-io/Dockerfile.prod`
  - `docker/web-synestra-io/Dockerfile.dev`
- GitLab CI для `web-synestra-io` переведён на новые Dockerfile и путь приложения:
  - `APP_DIR=apps/synestra-io`
  - контекст сборки `docker/web-synestra-io`
- Обновлены values для dev/prod:
  - команды dev и миграций указывают на `/repo/apps/synestra-io` и `/app/apps/synestra-io` соответственно.

## Примечания
- Корневой `pnpm-workspace.yaml` в `web-core` не используется; зависимости устанавливаются внутри `apps/synestra-io`.
- Для сборки prod важно наличие `SYNESTRA_IO_DATABASE_URI` в CI и корректный `WEB_CORE_REF`.
