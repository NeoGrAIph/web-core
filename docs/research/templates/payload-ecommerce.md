# Payload шаблон: ecommerce

Источник: `https://github.com/payloadcms/payload/tree/main/templates/ecommerce`  
Снапшот в репозитории: `upstream/payload/templates/ecommerce`  
Provenance (снапшот): `upstream/payload/README.md` (commit `77f96a4ff224e37285d3d554686e9fe3af25d00b`)

Статус upstream‑шаблона: в README указано, что шаблон **BETA**.

## Зачем мы изучаем этот шаблон (польза для `web-core`)

- Референс “магазина” на Payload: структура коллекций и workflow контента под e‑commerce.
- Пример использования `@payloadcms/plugin-ecommerce` (carts/addresses/orders/transactions/products/variants).
- Референс интеграции Stripe через `stripeAdapter` (платежи, webhook secret, publishable key).
- Референс по on-demand revalidation, preview/live preview и SEO (как часть прод‑контрака для storefront).
- База для требований к деплою “shop” deployment: БД, миграции, storage для media, внешние интеграции (Stripe).

Важно: `upstream/` — **только референс**. Мы адаптируем паттерны под Kubernetes + CNPG/Postgres + GitOps и **не деплоим шаблон как есть**.

## Сопоставление версий (наши ограничения vs upstream)

Из `upstream/payload/templates/ecommerce/package.json`:
- Next.js: `15.4.9` (совпадает с выбранной версией Next для `web-core`)
- React: `19.2.1`
- Tailwind: `^4.0.12` (важно: у `templates/website` Tailwind 3.x — возможна “вилка” по дизайн‑системе/инструментам)
- engines: Node `^18.20.2 || >=20.9.0`

Наши зафиксированные версии:
- Payload: `v3.68.3`
- Next.js: `v15.4.9`

В upstream‑снапшоте Payload‑пакеты указаны как `workspace:*` (потому что это часть монорепы Payload). В `web-core` нужно **прибить** `payload@3.68.3` и явные версии нужных `@payloadcms/*` пакетов/плагинов.

## Переменные окружения (таблица + классификация)

Источники:
- Пример: `upstream/payload/templates/ecommerce/.env.example`
- Фактическое использование: `upstream/payload/templates/ecommerce/src/**`
- Next config: `upstream/payload/templates/ecommerce/next.config.js`
- README (доп. варианты: Postgres/Vercel storage)

| Переменная | Секрет? | Область | Обязательна | Где используется | Примечания / k8s-следствия |
|---|---:|---|---|---|---|
| `PAYLOAD_SECRET` | да | на деплой | да | `src/payload.config.ts` | Ключ для JWT/шифрования. Должен быть стабильным. |
| `DATABASE_URI` | да | на деплой | да | `src/payload.config.ts` | В снапшоте используется Mongo adapter. Для CNPG/Postgres нужно сменить adapter и контракт env. |
| `NEXT_PUBLIC_SERVER_URL` | нет | на деплой | да (prod) | `src/utilities/getURL.ts`, множество компонентов (Auth, Media, forms), SEO meta | Базовый URL для API/медиа/редиректов; должен совпадать с ingress host. |
| `PAYLOAD_PUBLIC_SERVER_URL` | нет | на деплой | рекомендуется | `src/components/BeforeLogin/index.tsx` | Ссылка “логин на сайте” из админки. По смыслу должен совпадать с `NEXT_PUBLIC_SERVER_URL`. |
| `PREVIEW_SECRET` | да | на деплой | зависит | `src/utilities/generatePreviewPath.ts`, `src/app/(app)/next/preview/route.ts` | В шаблоне передаётся в querystring → риск утечки в access logs/referrer; смягчать на ingress или менять механику. |
| `STRIPE_SECRET_KEY` | да | на деплой | если Stripe | `src/plugins/index.ts` | Secret key Stripe. Нужен для server-side запросов и webhook проверки. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | нет | на деплой | если Stripe | `src/plugins/index.ts`, checkout/provider | Публичный ключ. Доступен клиенту. |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | да | на деплой | если Stripe | `src/plugins/index.ts` | Secret для проверки webhook подписи. |
| `COMPANY_NAME` | нет | на деплой | опционально | `src/components/Footer/index.tsx` | Branding/копирайт. |
| `SITE_NAME` | нет | на деплой | опционально | `src/components/Footer/index.tsx` (и мета в layout — закомментировано) | Branding/метаданные. |
| `TWITTER_CREATOR` | нет | на деплой | опционально | `src/app/(app)/layout.tsx` (закомментировано) | Для метаданных/карточек. |
| `TWITTER_SITE` | нет | на деплой | опционально | `src/app/(app)/layout.tsx` (закомментировано) | Для метаданных/карточек. |
| `NEXT_PUBLIC_VERCEL_URL` | нет | платформа | опционально | `src/app/(app)/robots.ts` (и мета в layout — закомментировано) | Vercel‑переменная. В k8s, скорее всего, не используем. |
| `VERCEL_PROJECT_PRODUCTION_URL` | нет | платформа | опционально | `src/utilities/getURL.ts` | Vercel‑переменная fallback. В k8s полагаемся на `NEXT_PUBLIC_SERVER_URL`. |
| `POSTGRES_URL` | да | на деплой | опционально | `README.md` (пример) | Упоминается для Vercel Postgres adapter; в коде снапшота не используется. |
| `BLOB_READ_WRITE_TOKEN` | да | на деплой | опционально | `README.md` (пример) | Упоминается для Vercel Blob storage; в коде снапшота не используется. |

GitOps‑маппинг:
- Секреты (Secret): креды БД, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, Stripe `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOKS_SIGNING_SECRET`.
- Не‑секреты (values/ConfigMap): `NEXT_PUBLIC_SERVER_URL`, `PAYLOAD_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, branding vars.

## Деплой / миграции / runtime‑обязанности

### DB adapter и миграции

Снапшот кода использует Mongo:
- `src/payload.config.ts` → `mongooseAdapter({ url: process.env.DATABASE_URI || '' })`

Но README подчёркивает для SQL/PG необходимость миграций:
- создать миграцию: `pnpm payload migrate:create`
- выполнить миграции в проде до `start`: `pnpm payload migrate`

Для нашей цели CNPG/Postgres это обязательный контур:
- выбрать Postgres adapter, совместимый с `payload@3.68.3`,
- выбрать место выполнения миграций (Job/initContainer/Argo hook) и правила конкуренции при scale.

### Пользователи, роли и модель доступа

В шаблоне `users` — это одновременно:
- коллекция админов (роль `admin`) для доступа к админке,
- коллекция покупателей (роль `customer`) для storefront.

См. `upstream/payload/templates/ecommerce/src/collections/Users/index.ts`:
- поле `roles` (select, `hasMany`, default `customer`),
- access‑правила: create публичный, read/update ограничены `adminOrSelf`,
- join‑поля на `orders`, `cart`, `addresses` (эти коллекции добавляются ecommerce plugin).

Вывод для нас:
- модель “users = customers” удобна для единого деплоя, но если мы отделяем публичный storefront от CMS‑домена/процесса, нужно заранее определить CORS/сессии/домены.

### Платежи и внешние вебхуки (Stripe)

Шаблон использует `@payloadcms/plugin-ecommerce` + `stripeAdapter`:
- `src/plugins/index.ts` читает `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET`.

В `package.json` есть helper‑скрипт:
- `stripe-webhooks`: `stripe listen --forward-to localhost:3000/api/stripe/webhooks`

Вывод для k8s:
- нужно подтвердить, какой именно endpoint обрабатывает Stripe webhooks (вероятно его регистрирует plugin-ecommerce через Payload API),
- ingress должен принимать внешние POST от Stripe на webhook URL,
- в проде потребуется отдельная стратегия управления Stripe secret’ами и webhook endpoints (в т.ч. возможная сегрегация по окружениям).

### Email / пароль‑восстановление

В `dependencies` есть `@payloadcms/email-nodemailer`, но в `payload.config.ts` настройка email адаптера закомментирована:
- `//email: nodemailerAdapter(),`

Вывод для нас:
- для реального магазина потребуется настроить отправку писем (reset password, уведомления, транзакционные письма) либо через Payload email adapter, либо через внешний сервис и отдельный доменный пакет/сервис.

### Generated artifacts (import map + payload types)

Шаблон коммитит сгенерированные артефакты:
- `src/app/(payload)/admin/importMap.js` (используется в `src/app/(payload)/layout.tsx`)
  - механизм обновления: `payload generate:importmap` (script `generate:importmap`)
- `src/payload-types.ts`
  - механизм обновления: `payload generate:types` (script `generate:types`)

Решение для `web-core`:
- трактуем это как “generated, but committed” и добавляем CI‑проверку актуальности.

## Подводные камни Kubernetes/GitOps (как “сломать прод” при наивном переносе)

- Uploads пишутся на локальный диск:
  - `src/collections/Media.ts` пишет в `public/media`.
  - В k8s нужны персистентные writable данные (PVC) или object storage (S3‑совместимый) через storage plugin.
  - При 2+ репликах локальный диск приводит к рассинхрону без shared storage (RWX) / external storage.
- Preview secret в querystring:
  - `generatePreviewPath` добавляет `previewSecret` в query param; preview route проверяет его.
  - Нельзя логировать querystring на ingress или нужно менять модель preview‑авторизации.
- Seed — демо‑фича и разрушительна:
  - есть `/next/seed` и кнопка в админке (см. `src/components/BeforeDashboard/SeedButton`).
  - В проде логично удалить/отключить.
- Template BETA:
  - возможны несовместимые изменения upstream и нестабильность API/поведения (особенно вокруг ecommerce plugin).
- Отдельные домены/происхождения (origin):
  - часть клиентских запросов в шаблоне строится как `fetch(${NEXT_PUBLIC_SERVER_URL}/api/...)` (см. `src/providers/Auth/index.tsx` и формы),
  - если storefront и API будут на разных доменах, нужно будет менять механику запросов и CORS/куки‑политику.
- Tailwind 4 vs Tailwind 3:
  - если мы хотим единый UI‑стек для всех сайтов, нужно заранее решить, как мы унифицируем tailwind/tooling.
- В снапшоте нет `Dockerfile`/`docker-compose.yml` (хотя README упоминает docker-compose):
  - нельзя “копировать деплой” из README; образ и runtime нужно проектировать отдельно (GitLab build + k8s manifests).
- В шаблоне нет `environment.d.ts` (в отличие от `templates/website`):
  - для `web-core` лучше держать явную типизацию env vars, чтобы ловить ошибки конфигурации на этапе сборки/CI.

## Тесты (базовый контур из шаблона)

Из `upstream/payload/templates/ecommerce/package.json`:
- `test:int`: Vitest (`vitest.config.mts`)
- `test:e2e`: Playwright (`playwright.config.ts`)
- `test`: запускает оба

Дополнительно:
- есть helper‑скрипт `stripe-webhooks` для локальной разработки webhook’ов через Stripe CLI.

Вывод для `web-core`:
- для “shop” deployment разумно иметь E2E smoke‑набор (минимум: каталог → корзина → checkout), но это нужно сбалансировать с временем CI и выбранным способом кеширования/фильтрации.

## Чек‑лист интеграции в `web-core` (обязательно)

- [ ] Принять решение: используем ли `@payloadcms/plugin-ecommerce` в нашем “shop” deployment (и в каком объёме).
- [ ] Принять решение по платёжному провайдеру (Stripe или другой) и по секретам/webhook endpoints.
- [ ] Выбрать Postgres adapter для `payload@3.68.3` и определить контракт env vars.
- [ ] Определить стратегию миграций (Job / initContainer / Argo hook) и правила конкуренции.
- [ ] Определить стратегию storage для uploads (PVC vs S3 plugin) и политику replica count.
- [ ] Зафиксировать security‑модель preview/live preview (избежать утечек секрета в querystring).
- [ ] Зафиксировать baseline тестов (Vitest-only vs Vitest + Playwright) и как это ложится на Turbo/CI caching.
- [ ] Зафиксировать политику generated файлов (`payload-types.ts`, `admin/importMap.js`): когда запускать генераторы, что коммитить, как CI валидирует актуальность.
