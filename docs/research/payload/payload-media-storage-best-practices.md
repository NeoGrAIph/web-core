# Payload CMS 3: media/uploads и storage — best practices (official-first)

Дата актуальности: **2025-12-16** (Payload **3.68.3** в `web-core`).  
Фокус: как хранить файлы (uploads) без боли в проде, и как стандартизировать это в монорепо.

## 1) Официальные источники (первичные)

- Uploads overview (основы upload‑коллекций, `staticDir`, `mimeTypes`, `imageSizes`):  
  `https://payloadcms.com/docs/upload/overview`
- Storage Adapters (официальный интерфейс адаптеров + рекомендации):  
  `https://payloadcms.com/docs/upload/storage-adapters`
- Cloud Storage Plugin (официальный путь к S3/R2/Blob и т.п., access control / signed downloads):  
  `https://payloadcms.com/docs/plugins/cloud-storage`

---

## 2) Что важно понять заранее (prod‑реальность)

1) Uploads = **не только записи в БД**, но и **файлы**, которые должны переживать:
   - перезапуск контейнера,
   - пересборку образа,
   - масштабирование на 2+ реплики,
   - деплой/rollback.

2) “Локальная файловая система контейнера” в Kubernetes обычно **эпемерна**.  
   Если вы пишете файлы в `staticDir` без PV или storage adapter — вы почти гарантированно потеряете медиа.

---

## 3) Best practices из официальной доки (выжимка)

### 3.1. `staticDir` и предсказуемые пути

- `staticDir` задаёт путь, куда Payload будет писать файлы; относительные пути считаются относительно директории, где лежит `payload.config.*`.
- В монорепо и в контейнере почти всегда надёжнее использовать **абсолютный путь** (`path.resolve(dirname, ...)`).

### 3.2. Ограничивайте типы файлов (`mimeTypes`)

- Для upload‑коллекций используйте `mimeTypes` (allowlist) и не позволяйте “что угодно”, если это не нужно бизнесу.
- Это снижает риск загрузки нежелательных/опасных форматов и упрощает CDN/кеширование.

### 3.3. Генерация изображений (`imageSizes`) — это нагрузка

- `imageSizes` и `sharp` дают удобные деривативы, но это CPU/IO работа.
- Не плодите размеры “на всякий случай”: держите небольшой набор, понятный дизайну/контент‑команде.

### 3.4. Storage adapters вместо local storage (когда 2+ реплики или нужен внешний storage)

- Для “облачного” хранения используйте storage adapter (официальный интерфейс) или `@payloadcms/plugin-cloud-storage`.
- По умолчанию cloud storage plugin старается **сохранить access control**: файл остаётся доступен через Payload, а не напрямую из bucket’а.
- Если хотите отдавать файл “напрямую” (публичные URL) — у плагина есть режим `disablePayloadAccessControl`, но тогда безопасность/ACL переезжает в storage/CDN.
- Для производительности при защищённых файлах используйте `signedDownloads` (presigned URL), чтобы не проксировать большие файлы через приложение.

---

## 4) Канон для `web-core` (уменьшаем копипаст и риск)

### 4.1. Базовый путь “сейчас”: local storage + PV (1 реплика или shared volume)

1) В каждом app:
   - upload‑коллекция `Media` (slug `media`) с `upload.staticDir` → `apps/<app>/public/media` (абсолютно).
2) В Kubernetes:
   - PVC/PV, смонтированный в **тот же** путь `public/media` внутри контейнера.
3) Ограничение:
   - если Deployment масштабируется на 2+ реплики, local PV должен быть **shared (RWX)**; иначе безопаснее перейти на cloud storage adapter.

Пример реализации в репо: `apps/synestra-io/src/collections/Media.ts`.

Практический нюанс для self-hosted Next.js:
- если фронт использует `next/image` и `getMediaUrl` возвращает **absolute URL** (с origin), нужно:
  - разрешить origin в `next.config.mjs:images.remotePatterns` (обычно через `NEXT_PUBLIC_SERVER_URL`),
  - обеспечить корректную отдачу `GET`/`HEAD` для `GET /api/media/file/<filename>` (в `web-core` это решено route handler’ом в app).

### 4.2. Базовый путь “потом”: S3/R2/Blob через cloud storage plugin

Рекомендуемая стратегия для масштабирования:
- держим структуру upload‑коллекции стабильной,
- подключаем `@payloadcms/plugin-cloud-storage` (или свой adapter),
- все секреты (keys) — только через k8s Secret references и `.env.example`.

---

## 5) Стандарты структуры (для генераторов/шаблонов)

Для каждого нового сайта/app фиксируем:
- `apps/<app>/src/collections/Media.ts` (upload config + `mimeTypes` + `imageSizes` preset),
- `apps/<app>/public/media/` (runtime path; в k8s монтируется PV),
- значения helm chart (`deploy/charts/web-app`) для media persistence (mountPath строго соответствует `staticDir`).

Следующий шаг для снижения копипаста: генератор, который создаёт `Media.ts` с нашим preset’ом `imageSizes` и сразу добавляет нужные значения в values overlay окружения.
