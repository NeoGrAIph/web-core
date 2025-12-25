# Payload CMS 3: seed / defaultValue / изменения блоков (канон `web-core`)

Статус: актуально на **2025-12-17** (Payload **3.68.3**, Next.js **15.4.9**).

Цель: зафиксировать “как мы инициализируем контент” и “что делаем, когда меняем блоки/схему”, чтобы:
- новые сайты стартовали детерминированно;
- в `prod` нельзя было случайно “стереть всё” через seed;
- изменения schema не ломали seed и не превращались в ручные правки.

Связанные документы:
- миграции (Postgres): `docs/runbooks/runbook-payload-migrations.md`
- env‑контракт: `docs/architecture/env-contract.md`

Официальные ссылки Payload:
- Migrations: `https://payloadcms.com/docs/database/migrations`
- Fields overview (включая `defaultValue`): `https://payloadcms.com/docs/fields/overview`
- Blocks field (включая `defaultValue`, `blockName`): `https://payloadcms.com/docs/fields/blocks`

---

## 1) Базовые определения

- **migrations** — изменяют **схему БД** (таблицы/колонки/constraints). В `prod` для Postgres это обязательный, детерминированный путь.
- **seed** — добавляет/обновляет **контент и медиа** (страницы, посты, глобалы, файлы). Seed **не заменяет** migrations.
- **`defaultValue`** — “дефолт значения поля” (применяется в Admin UI и Local API, когда значение отсутствует). Это *не* “шаблон сайта”.

---

## 2) Политика seed для `prod`

Seed из upstream‑template обычно **деструктивный** (сначала чистит коллекции, потом создаёт демо‑данные). Это нормально для dev‑старта, но опасно для `stage/prod`.

Канон `web-core`:
- seed **не запускается автоматически** при деплое;
- seed‑endpoint (`POST /next/seed`) требует:
  - авторизованного пользователя (Payload auth),
  - **дополнительный ключ** `SEED_KEY` в `stage/prod` (см. раздел 4);
- без ключа seed в `stage/prod` отвечает `403`.

Это защищает от “случайного клика” в админке и от “стереть прод по привычке”.

---

## 3) Seed‑assets: никаких сетевых зависимостей

Upstream templates часто подтягивают картинки seed’а по URL вида `raw.githubusercontent.com/.../refs/heads/main/...`.
Это:
- не воспроизводимо (ветка `main` меняется),
- добавляет сетевую зависимость в рантайме,
- может ломаться из‑за rate limits/блокировок.

Канон `web-core`: seed‑скрипты читают файлы **локально** из `src/endpoints/seed/*.{webp,png}` (внутри приложения/шаблона).

Если когда‑то потребуется сетевой fetch — допускается только по pinned commit/tag (не `main`) и при явном согласовании.

---

## 4) Контракт env vars для seed

Добавляем секрет:
- `SEED_KEY` (secret) — ключ, который требуется передать в `POST /next/seed` в `stage/prod`.

Правило:
- `dev`: `SEED_KEY` можно не задавать (seed доступен только по auth).
- `stage/prod`: `SEED_KEY` обязателен, иначе `/next/seed` закрыт.

Технически ключ передаётся как HTTP header: `x-seed-key: <SEED_KEY>`.
В админке `web-core` при попытке seed в `stage/prod` появляется запрос ключа.

Хранение:
- локально: `apps/<app>/.env.local` (в git не коммитим),
- в Kubernetes: через `Secret` в `synestra-platform` и `envFrom.secretRef`.

---

## 5) `defaultValue`: когда использовать, а когда нет

`defaultValue` — хороший инструмент для “малых дефолтов”, например:
- дефолтный вариант `select` (`'info'`, `'typescript'`, `'lowImpact'`),
- числовые лимиты (`10`),
- булевы (`false`).

Не используем `defaultValue` как замену seed для “шаблонов страниц”:
- большие значения для `blocks`/`array` быстро устаревают при эволюции схемы,
- их сложнее мигрировать/отлаживать,
- это усиливает связанность UI и schema.

Если всё же задаём `defaultValue` для `blocks`:
- **всегда** заполняем `blockName` (для читаемости в Admin UI и стабильных якорей/рендера),
- следим, чтобы `defaultValue` соответствовал актуальной schema (иначе создание документа начнёт падать).

---

## 6) Изменения блоков и DoD (Definition of Done)

Любой PR, который меняет schema page builder’а, обязан учитывать 3 слоя:

1) **Schema** (Payload configs):
   - добавили/переименовали поля/блоки/relations → это влияет на данные в БД.
2) **Migrations** (Postgres):
   - изменения schema → добавляем migration files и проверяем `payload migrate` на пустой БД.
3) **Seed** (контент‑инициализация):
   - если seed создаёт сущности, которые зависят от изменённых полей/блоков — обновляем seed‑данные.

Минимальный DoD для PR со schema‑изменениями:
- есть migration files в `apps/<app>/src/migrations/**` (если менялась схема БД),
- seed (если он используется в app) компилируется и соответствует текущим блокам,
- прогоны локально:
  - `pnpm --filter <app> generate:types`
  - `pnpm --filter <app> generate:importmap`
  - `pnpm typecheck`
  - `pnpm build`

---

## 7) Источники (на что опирается канон)

Payload (официальные):
- Migrations: https://payloadcms.com/docs/database/migrations
- Local API (обзор): https://payloadcms.com/docs/local-api/overview
- Fields overview (`defaultValue`): https://payloadcms.com/docs/fields/overview
- Blocks field (`blockName`, `defaultValue`): https://payloadcms.com/docs/fields/blocks

Next.js (официальные):
- Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- `headers()` API: https://nextjs.org/docs/app/api-reference/functions/headers

Node.js (официальные):
- `fs/promises.readFile` (чтение локальных seed‑файлов): https://nodejs.org/api/fs.html#fspromisesreadfilepath-options
- `import.meta.url` (ESM, получение URL модуля): https://nodejs.org/api/esm.html#importmetaurl
- `url.fileURLToPath` (конвертация URL в путь): https://nodejs.org/api/url.html#urlfileurltopathurl

Payload templates (референс поведения seed, pinned snapshot commit):
- Repo: https://github.com/payloadcms/payload
- Snapshot commit (в `web-core/upstream`): https://github.com/payloadcms/payload/tree/77f96a4ff224e37285d3d554686e9fe3af25d00b
- Website seed endpoint: https://github.com/payloadcms/payload/blob/77f96a4ff224e37285d3d554686e9fe3af25d00b/templates/website/src/app/(frontend)/next/seed/route.ts
- Website seed script: https://github.com/payloadcms/payload/blob/77f96a4ff224e37285d3d554686e9fe3af25d00b/templates/website/src/endpoints/seed/index.ts
