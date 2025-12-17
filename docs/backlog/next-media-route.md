# Backlog: кастомный Next route `/api/media/file/*` конфликтует с Payload и ломает S3/MinIO

Статус: **актуально** (инцидент закрыт, канон зафиксирован, требуются превентивные меры).

## Контекст

В Payload коллекция `media` по умолчанию отдаёт файлы через endpoint:

- `GET /api/media/file/<filename>`

При переходе на object storage (MinIO / S3) этот endpoint должен обслуживаться **Payload storage adapter** (в нашем случае — `@payloadcms/storage-s3`), а не локальным диском / PVC.

## Симптомы (как это проявлялось)

- `GET /api/media/file/<filename>` возвращает `404` с JSON: `{"message":"File not found"}`.
- При этом объект в bucket существует (проверка `HeadObject`/`mc find` проходит).
- Dev/Prod могут “временами работать”, если pod ещё держит старые env vars или если файл случайно присутствует локально — что создаёт ложное ощущение корректной настройки S3.

## Root cause

В приложении был добавлен кастомный Next route:

- `apps/synestra-io/src/app/api/media/file/[filename]/route.ts`

Он:

1) **перехватывал** URL `/api/media/file/<filename>` раньше, чем Payload;
2) всегда пытался читать файл **локально** из `public/media`;
3) отдавал JSON `{"message":"File not found"}` при отсутствии файла.

После отключения PVC (что правильно при S3) этот route начинал стабильно возвращать 404, полностью обходя Payload S3 static handler.

В `templates/payload/website` этот же паттерн также присутствовал и мог попасть в новые apps при копировании шаблона.

## Канон (как правильно)

1) **Не создавать** Next route, который занимает путь `/api/media/file/*`.
2) Для выдачи медиа использовать стандартный Payload endpoint `/api/media/file/<filename>`.
3) Кэширование/заголовки — через Payload `upload.modifyResponseHeaders` в коллекции `media` (работает одинаково для local и для S3):

- `Cache-Control: public, max-age=31536000, immutable` (пример каноничной политики для неизменяемых имён файлов).

4) Если когда-либо понадобится “обёртка” над медиа, она должна быть либо:
   - на **другом path** (например `/media/*`), либо
   - явным reverse-proxy к Payload (без подмены `/api/media/file/*`), с сохранением поведения S3/presigned URL.

## Что уже исправлено

- Удалён конфликтующий Next route из `apps/synestra-io`.
- Удалён конфликтующий Next route из `templates/payload/website`.
- Добавлено кэширование через `upload.modifyResponseHeaders` в `Media` (app + template).

## Backlog / задачи на предотвращение регрессии

### A) Запретить повторное появление route’а (DoD: не появится снова)

- Добавить проверку в CI/линт (или pre-commit): запрещать файлы в `apps/*/src/app/**/api/media/file/**`.
  - Минимальный вариант: `rg`-проверка в `pnpm lint`/`pnpm test` pipeline.
  - Альтернатива: ESLint rule не подойдёт (это файловая структура).

### B) Зафиксировать канон в архитектуре

- Добавить ссылку на этот документ в `docs/architecture/component-system.md` или рядом с каноном “Media storage”.
- Обновить runbook миграции медиа на S3 ссылкой на этот документ.

### C) Опционально: улучшить UX/перфоманс раздачи медиа

- Рассмотреть `signedDownloads` (presigned URLs) на уровне `@payloadcms/storage-s3`, если захотим отдавать крупные файлы напрямую из MinIO/S3 (без проксирования через Next/Payload), сохраняя access control.

