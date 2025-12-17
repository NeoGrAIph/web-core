# Контракт env vars (`dev → stage → prod`) и валидация

Этот документ фиксирует единый контракт env vars для приложений `apps/*` в `web-core`.

Цели:
- разработчики быстро понимают “какие env vars нужны и где их задавать”;
- в репозитории **нет plaintext‑секретов**;
- `stage/prod` максимально близки к `prod`‑условиям, при этом локальный `dev` остаётся простым.

## 1) Базовые правила

### Секреты vs не‑секреты

- **Секреты** (DB URI, `PAYLOAD_SECRET`, ключи Stripe и т.п.) **никогда не коммитим** в `web-core`.
  - В Kubernetes они живут в `Secret`, созданном из `synestra-platform` (SOPS/age).
  - В Helm values в `web-core` допускаются только **ссылки** на Secret (`envFrom.secretRef`) и имена ключей в документации.
- **Не‑секреты** (ingress host, `NEXT_PUBLIC_*`, feature flags) храним в `web-core`:
  - в `deploy/env/<env>/*.yaml` → `.env` (Helm chart `web-app`).

### Клиентские переменные

- Всё, что доступно клиенту, обязано иметь префикс `NEXT_PUBLIC_`.
- Никогда не добавляй секреты в `NEXT_PUBLIC_*`.

### Окружения

В Next.js `NODE_ENV` обычно:
- `development` в локальном `next dev`,
- `production` в `next build` и в Kubernetes (и для `stage`, и для `prod`).

Примечание про Okteto hot‑dev:
- когда мы запускаем `next dev` **внутри кластера** через Okteto, `NODE_ENV` должен быть `development` (иначе Next.js ругается на нестандартные значения и могут быть странные эффекты).
- это относится только к dev‑сессии/окружению `dev`, и не меняет принцип “в prod — production”.

Поэтому для различения `dev|stage|prod` используем отдельную переменную:

- `SYNESTRA_ENV=dev|stage|prod`

Правило:
- локально (если переменная не задана) считаем `SYNESTRA_ENV=dev`;
- в Kubernetes для каждого deployment **обязательно** задаём `SYNESTRA_ENV` через Helm values (`deploy/env/<env>/*.yaml`).

## 2) Где задавать env vars (единый контракт)

### Локально

В каждом приложении есть `apps/<app>/.env.example`.

Рекомендуемый путь:
1) Скопировать `apps/<app>/.env.example` → `apps/<app>/.env.local` (файл игнорируется git).
2) Запускать `pnpm --filter <app> dev`.

### Kubernetes / ArgoCD

Helm chart: `deploy/charts/web-app`.

- Не‑секреты: `deploy/env/<env>/<app>.yaml` → `.env` (рендерится как `env:` в Pod).
- Секреты: `deploy/env/<env>/<app>.yaml` → `envFrom.secretRef` (подключает `Secret` целиком).

Важно: переменные из `.env` **должны** попадать и в основной `Deployment`, и в `migrations Job`.

## 3) Список переменных (минимальный стандарт)

### Общие (для всех Next.js + Payload apps)

- `SYNESTRA_ENV` (non-secret): `dev|stage|prod`
- `NEXT_PUBLIC_SERVER_URL` (non-secret): публичный URL приложения (домен/ингресс)
- `PAYLOAD_SECRET` (secret): секрет Payload (JWT/шифрование); должен быть стабильным в пределах deployment
- `DATABASE_URI` (secret): строка подключения к Postgres

### Опциональные (включаются при использовании соответствующих фич)

- `CRON_SECRET` (secret): авторизация jobs/cron endpoints (например, `GET /api/payload-jobs/run`, если включён jobs runner)
- `PREVIEW_SECRET` (secret): подпись preview links (если включены)
- `SEED_KEY` (secret): дополнительная защита endpoint `POST /next/seed` в `stage/prod` (если seed оставлен включённым)

### Ecommerce (если включаем Stripe)

- `STRIPE_SECRET_KEY` (secret)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (non-secret)
- `STRIPE_WEBHOOKS_SIGNING_SECRET` (secret)

## 4) Правила валидации

Мы валидируем env vars **в рантайме** при загрузке server‑кода (например, при импорте `payload.config.ts`).

Стандарт:
- в `apps/<app>/src/env.ts` описывается схема (Zod) и правила “что обязательно в stage/prod”;
- общая функция валидации живёт в `packages/env`;
- ошибки валидации **не** выводят значения секретов (только имена переменных и причину).

Политика обязательности:
- `dev`: допускаем отсутствующие секреты и используем dev‑дефолты (локальная БД/URL).
- `stage` и `prod`: секреты/URL должны быть заданы явно (иначе приложение падает при старте).

## 5) Примечания по миграциям

Если миграции запускаются как `Job` (ArgoCD hook), то этот Job должен получать тот же набор env vars,
что и основной `Deployment` (включая `SYNESTRA_ENV`), иначе валидация может “думать”, что это `dev`.

---

## 6) Источники (официальные)

- Next.js: Environment Variables (App Router): https://nextjs.org/docs/app/guides/environment-variables
- Kubernetes: Secrets (в т.ч. `envFrom` / `secretKeyRef`): https://kubernetes.io/docs/concepts/configuration/secret/
