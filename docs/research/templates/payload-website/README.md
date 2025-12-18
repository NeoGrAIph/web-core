# Payload шаблон: website

Источник: `https://github.com/payloadcms/payload/tree/main/templates/website`  
Снапшот в репозитории: `upstream/payload/templates/website`  
Provenance (снапшот): `upstream/payload/README.md` (commit `77f96a4ff224e37285d3d554686e9fe3af25d00b`)

## Зачем мы изучаем этот шаблон (польза для `web-core`)

- Каноничный паттерн интеграции Payload v3 + Next.js App Router (admin, API routes, preview/live preview).
- Явный контракт env vars: что должно быть Secret, а что — не‑секретной конфигурацией.
- Production‑аспекты: redirects/SEO/search, jobs/scheduled publishing, revalidation hooks.
- Базовый контур тестов (Vitest + Playwright) для “production‑ready” website template.
- Референс по контейнеризации (Next standalone) и dev‑шорткатам (compose).

Важно: `upstream/` — **только референс**. Мы адаптируем паттерны под Kubernetes + CNPG/Postgres + GitOps и **не деплоим шаблон как есть**.

## Сопоставление версий (наши ограничения vs upstream)

Из `upstream/payload/templates/website/package.json`:
- Next.js: `15.4.9` (совпадает с выбранной версией Next для `web-core`)
- React: `19.2.1`
- engines: Node `^18.20.2 || >=20.9.0`, pnpm `^9 || ^10`

Наши зафиксированные версии:
- Payload: `v3.68.3`
- Next.js: `v15.4.9`

В upstream‑снапшоте Payload‑пакеты указаны как `workspace:*` (потому что это часть монорепы Payload). В `web-core` мы должны **прибить** `payload@3.68.3` и явные версии нужных `@payloadcms/*` пакетов/плагинов.

## Переменные окружения (таблица + классификация)

Источники:
- Пример: `upstream/payload/templates/website/.env.example`
- Фактическое использование: `upstream/payload/templates/website/src/**`
- Типы: `upstream/payload/templates/website/src/environment.d.ts`
- Next config: `upstream/payload/templates/website/next.config.js`

| Переменная | Секрет? | Область | Обязательна | Где используется | Примечания / k8s-следствия |
|---|---:|---|---|---|---|
| `DATABASE_URI` | да | на деплой | да | `src/payload.config.ts` | В снапшоте используется Mongo adapter. Для CNPG/Postgres нужно сменить adapter и, вероятно, контракт env. |
| `PAYLOAD_SECRET` | да | на деплой | да | `src/payload.config.ts` | Должен быть стабильным; ротация влияет на JWT/шифрование сессий/токенов. |
| `NEXT_PUBLIC_SERVER_URL` | нет | на деплой | да (prod) | `src/utilities/getURL.ts`, sitemap routes | Base URL без trailing slash; должен совпадать с ingress host. |
| `CRON_SECRET` | да | на деплой | зависит | `src/payload.config.ts` (jobs access) | Используется как `Authorization: Bearer <CRON_SECRET>` для вызова job endpoints из CronJob/планировщика. |
| `PREVIEW_SECRET` | да | на деплой | зависит | `src/utilities/generatePreviewPath.ts`, `src/app/(frontend)/next/preview/route.ts` | В шаблоне передаётся в querystring → риск утечки в access logs/referrer; смягчать на ingress или менять механику. |
| `VERCEL_PROJECT_PRODUCTION_URL` | нет | платформа | опционально | `next.config.js`, `src/utilities/getURL.ts` | Vercel‑специфично. В k8s обычно используем `NEXT_PUBLIC_SERVER_URL`. |
| `__NEXT_PRIVATE_ORIGIN` | нет | платформа | опционально | `next.config.js` | Next internal; в k8s обычно не используется. |
| `POSTGRES_URL` | да | на деплой | опционально | `README.md` (пример) | Упоминается для Vercel Postgres adapter; в коде снапшота не используется. |
| `BLOB_READ_WRITE_TOKEN` | да | на деплой | опционально | `README.md` (пример) | Упоминается для Vercel Blob storage; в коде снапшота не используется. |

GitOps‑маппинг:
- Секреты (Secret): креды БД, `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`.
- Не‑секреты (values/ConfigMap): `NEXT_PUBLIC_SERVER_URL`.

## Деплой / миграции / runtime‑обязанности

### DB adapter и миграции

Снапшот кода использует Mongo:
- `src/payload.config.ts` → `mongooseAdapter({ url: process.env.DATABASE_URI })`

Но README явно подчёркивает для SQL/PG необходимость миграций:
- создать миграцию: `pnpm payload migrate:create`
- выполнить миграции в проде до `start`: `pnpm payload migrate`

Официальная документация по миграциям (Payload 3) уточняет workflow для Postgres:
- в dev можно использовать `push` (быстро, без миграций),
- затем генерировать migration files (`migrate:create`) и коммитить их,
- в окружениях “не dev” (в т.ч. prod) нужно запускать `payload migrate` перед стартом приложения.

Источник: `https://payloadcms.com/docs/database/migrations`.

Для нашей цели CNPG/Postgres это обязательный контур:
- выбрать Postgres adapter, совместимый с `payload@3.68.3`,
- выбрать место выполнения миграций:
  - Kubernetes `Job` (предпочтительно: “run once”, проще контролировать конкуренцию),
  - `initContainer` (осторожно с конкуренцией при scale),
  - Argo CD hook (если хотим строгий ordering при sync).

### Build outputs и ожидания контейнера

Снапшот содержит Dockerfile для Next standalone output:
- `upstream/payload/templates/website/Dockerfile` ожидает `output: 'standalone'`.

Для `web-core` это полезный референс, потому что образы собираются в GitLab (в `synestra-platform`) и деплоятся через GitOps:
- если мы выберем standalone output, его нужно стандартизировать для наших Next apps и CI образов.

### Generated artifacts (import map + payload types)

Шаблон коммитит сгенерированные артефакты:
- `src/app/(payload)/admin/importMap.js` (используется в `src/app/(payload)/layout.tsx`)
  - механизм обновления: `payload generate:importmap` (script `generate:importmap`)
- `src/payload-types.ts`
  - механизм обновления: `payload generate:types` (script `generate:types`)

Решение для `web-core`:
- трактуем это как “generated, but committed” и добавляем CI‑проверку актуальности (иначе admin может сломаться или типы поплывут).

## Подводные камни Kubernetes/GitOps (как “сломать прод” при наивном переносе)

- Uploads пишутся на локальный диск:
  - `src/collections/Media.ts` пишет в `public/media`.
  - В k8s нужны персистентные writable данные (PVC) или переход на object storage (S3‑совместимый) через storage plugin.
  - При 2+ репликах локальный диск приводит к рассинхрону, если storage не shared (RWX) / не вынесен наружу.
- Preview secret гуляет в querystring:
  - `generatePreviewPath` добавляет `previewSecret` как query param; preview route проверяет его.
  - Нельзя логировать querystring на ingress или нужно менять модель preview‑авторизации.
- Seed — демо‑фича и потенциально разрушительная:
  - есть `/next/seed` (`src/app/(frontend)/next/seed/route.ts`) и кнопка в админке.
  - В проде логично убрать/отключить, чтобы исключить случайное destructive действие.
- Jobs endpoint auth:
  - `CRON_SECRET` проверяется через `Authorization` header (см. `payload.config.ts`).
  - Нужно явно прокинуть в CronJobs; секреты — per-deployment/namespace.
- Sitemap и связка с canonical URL:
  - template использует `next-sitemap` в `postbuild` и URL helpers.
  - Нужно решить: URL должен быть известен на build-time (жёстко) или runtime (предпочтительно в k8s).

## Тесты (базовый контур из шаблона)

Из `upstream/payload/templates/website/package.json`:
- `test:int`: Vitest (`vitest.config.mts`)
- `test:e2e`: Playwright (`playwright.config.ts`)
- `test`: запускает оба

Для `web-core` это реалистичный ориентир:
- минимум: unit/integration тесты shared packages и критичной логики app’ов,
- опционально: Playwright E2E для ключевых пользовательских сценариев (trade‑off vs время CI).

## Чек‑лист интеграции в `web-core` (обязательно)

- [ ] Выбрать Postgres adapter для `payload@3.68.3` и определить контракт env vars.
- [ ] Определить стратегию миграций (Job / initContainer / Argo hook) и правила конкуренции.
- [ ] Определить стратегию storage для uploads (PVC vs S3 plugin) и политику replica count.
- [ ] Зафиксировать security‑модель preview/live preview (избежать утечек секрета в querystring).
- [ ] Зафиксировать политику caching/ISR для self-hosted (не Payload Cloud).
- [ ] Зафиксировать baseline тестов (Vitest-only vs Vitest + Playwright) и как это ложится на Turbo/CI caching.
- [ ] Зафиксировать политику generated файлов (`payload-types.ts`, `admin/importMap.js`): когда запускать генераторы, что коммитить, как CI валидирует актуальность.
