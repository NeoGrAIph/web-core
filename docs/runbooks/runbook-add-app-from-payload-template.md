# Runbook: добавить новый app из Payload template

Цель: быстро и предсказуемо добавить **новое deployable приложение** в `apps/*`, взяв за основу официальный Payload template (из `upstream/`) и адаптировав его под соглашения `web-core` (монорепа, shared packages, GitOps, отсутствие plaintext‑секретов).

Контекст:
- стек: **Payload `3.68.3` + Next.js `15.4.9`**
- монорепа: pnpm workspaces + Turborepo (`pnpm dev/build/lint/test`)
- деплой: GitOps/ArgoCD через `deploy/*`
- hot dev: Okteto (в `synestra-platform`)
- секреты: **только в `synestra-platform`**, в `web-core` — `.env.example` и ссылки на Secret names/keys

---

## 0) Соглашения (прежде чем начать)

Выберите:

1) **app key** (короткое имя для деплоя/values/арго): например `blog`, `corporate`, `shop`
2) **директория app**: `apps/<app-dir>` (пример: `apps/blog-website`)
3) **workspace package name**: `@synestra/<app-dir>` (пример: `@synestra/blog-website`)
4) **локальный порт**:
   - 3000: corporate
   - 3001: shop
   - 3002: experiments
   - 3003+: новые apps (если это deployable app)
5) **deployment/namespace для dev**:
   - namespace: `web-<app-key>-dev` (пример: `web-blog-dev`)
   - ArgoCD Application name: `web-<app-key>-dev`
6) **deployment/namespace для prod**:
   - namespace: `web-<app-key>-prod` (пример: `web-blog-prod`)
   - ArgoCD Application name: `web-<app-key>-prod`

Примечание (важно): на старте мы ведём разработку в `dev`, а в `prod` попадают только проверенные изменения через promotion (GitOps-коммит).
Канон: `docs/architecture/release-promotion.md`.

---

## 1) Выберите upstream template (референс)

В `web-core` official templates хранятся как снапшот (reference only):
- `upstream/payload/templates/website`
- `upstream/payload/templates/ecommerce` (BETA; требует осторожности из‑за Stripe/webhooks)

Правило: **не деплоим `upstream/**` напрямую** — только копируем/адаптируем в `apps/*`.

---

## 2) Создайте новый app (копия шаблона)

1) Скопируйте выбранный template в `apps/<app-dir>`.

2) Убедитесь, что в новую папку не попали артефакты:
- `node_modules/`
- `.next/`
- локальные `.env*` (кроме `.env.example`)

3) Приведите структуру к нашему минимуму:
- `src/app/**` (App Router)
- `src/payload.config.ts`
- `src/migrations/` (под Postgres миграции)
- `.env.example` (контракт env vars)

---

## 3) Приведите `package.json` приложения к стандарту монорепы

В `apps/<app-dir>/package.json`:

1) Имя пакета:
- `"name": "@synestra/<app-dir>"`

2) Скрипты:
- `"dev": "next dev --port <PORT>"`
- `"build": "next build"`
- `"start": "next start"`
- `"lint": "next lint"`

3) Версии фреймворков:
- `payload: 3.68.3`
- `@payloadcms/next: 3.68.3`
- `next: 15.4.9`
- `react/react-dom` — как в текущей политике репо

4) Workspace‑зависимости (по мере необходимости):
- `@synestra/ui: workspace:*`
- `@synestra/cms-core: workspace:*`
- `@synestra/cms-blocks: workspace:*`
- `@synestra/cms-ecommerce: workspace:*` (для shop)
- `@synestra/payload-plugin-multisite: workspace:*` (если используем)

5) Dev‑зависимости (обязательно):
- `@synestra/eslint-config: workspace:*`
- `@synestra/typescript-config: workspace:*`

---

## 4) Подключите shared ESLint/TypeScript конфиги

1) `apps/<app-dir>/eslint.config.mjs`:
- должен экспортировать `@synestra/eslint-config`.

2) `apps/<app-dir>/tsconfig.json`:
- `"extends": "@synestra/typescript-config/nextjs.json"`
- если используется alias `@/*`, задайте:
  - `"compilerOptions.baseUrl": "."`
  - `"compilerOptions.paths": { "@/*": ["./src/*"] }`

---

## 5) Подключите Payload к Next (и shared packages)

1) `apps/<app-dir>/next.config.mjs`:
- оборачиваем Next config через `withPayload(...)`.
- добавляем `transpilePackages`, чтобы Next корректно собирал workspace‑пакеты:
  - `@synestra/ui`, `@synestra/cms-*`, `@synestra/payload-plugin-multisite` (по мере использования).

2) `apps/<app-dir>/src/payload.config.ts`:
- база: `buildConfig({ ... })`
- db: в `web-core` целевой адаптер **Postgres** (`@payloadcms/db-postgres`) и миграции в `src/migrations`.
- “prod required env”: в `production` падать с ошибкой, если не заданы обязательные секреты (`DATABASE_URI`, `PAYLOAD_SECRET` и т.п.).

Примечание по шаблонам:
- upstream может быть рассчитан на MongoDB или иметь иной набор env vars — это **нормально**, адаптируем под наш контракт.

---

## 6) Оформите `.env.example` (контракт переменных)

Требования:
- в репозитории **нет** `.env.local` / `.env.production` и любых plaintext‑секретов.
- `.env.example` — это документация/контракт.

Минимальный набор для типового Payload+Next (ориентир из templates):
- `DATABASE_URI` — **secret**
- `PAYLOAD_SECRET` — **secret**
- `NEXT_PUBLIC_SERVER_URL` — **non-secret**
- `CRON_SECRET` — **secret** (если используем cron endpoints)
- `PREVIEW_SECRET` — **secret** (если используем preview links)

Для ecommerce дополнительно (если применимо):
- Stripe keys / webhook secret (все секреты — только в `synestra-platform`)

---

## 7) Локальная проверка (до GitOps)

1) Установить зависимости:
- `pnpm install`

2) Запуск одного app:
- `pnpm --filter @synestra/<app-dir> dev`

3) Быстрые проверки:
- `pnpm lint`
- `pnpm test`
- `pnpm build`

---

## 8) GitOps‑скелет dev‑деплоя (после локального запуска)

0) Release-слои (обязательны для канона promotion):
- `deploy/env/release-dev/<app-key>.yaml` (dev release: `image.repository` + `image.tag`)
- `deploy/env/release-prod/<app-key>.yaml` (prod release: `image.repository` + `image.tag`)

1) Values для dev (env‑слой):
- создать `deploy/env/dev/<app-key>.yaml` (только non-secret + ссылки на Secret’ы)
  - `env.NEXT_PUBLIC_SERVER_URL`
  - `envFrom.secretRef` (имя k8s Secret, который создаётся в `synestra-platform`)
  - `ingress.hosts` (dev домен)
  - `postgres.bootstrap.secretName` (bootstrap secret в `synestra-platform`)

2) Values для prod (env‑слой):
- создать `deploy/env/prod/<app-key>.yaml` (аналогично dev, но с prod доменом и `SYNESTRA_ENV=prod`)

3) ArgoCD Application для dev:
- создать `deploy/argocd/apps/dev/<app-key>.yaml`
  - отдельный namespace `web-<app-key>-dev`
  - helm valueFiles:
    - `../../env/release-dev/<app-key>.yaml`
    - `../../env/dev/<app-key>.yaml`
  - `repoURL` пока может быть placeholder и заполняется при интеграции с `synestra-platform`

4) ArgoCD Application для prod:
- создать `deploy/argocd/apps/prod/<app-key>.yaml`
  - отдельный namespace `web-<app-key>-prod`
  - helm valueFiles:
    - `../../env/release-prod/<app-key>.yaml`
    - `../../env/prod/<app-key>.yaml`

5) Важно:
- `experiments` не добавляем в `deploy/argocd/apps/**`.
- Dev должен быть “мягким” для Okteto (обычно `selfHeal: false`), prod — GitOps‑строгим (`selfHeal: true`): см. `docs/architecture/release-promotion.md`.

---

## 8.1) Миграции Payload (обязательная дисциплина)

Правило: изменения схемы БД **не** выкатываем “только кодом”.

- Для локальной разработки допустим быстрый режим (push/быстрые итерации), но для `dev/prod` контуров должны существовать **migration files в git** (`apps/<app-dir>/src/migrations/**`).
- Если менялась схема (коллекции/поля/relations/access), в PR должны быть добавлены миграции:
  - создать миграцию: `pnpm --filter @synestra/<app-dir> payload migrate:create`
  - применить миграции (локально): `pnpm --filter @synestra/<app-dir> payload migrate`

Runbook по k8s/GitOps паттерну миграций (hook Job): `docs/runbooks/runbook-dev-deploy-corporate.md`.

---

## 9) Когда и как выносить общее из app в `packages/*`

Цель: унифицировать и ускорять разработку, **не ломая лёгкость** интеграции новых Payload templates.

Рекомендация процесса:
1) Сначала довести app до рабочего состояния “как template”, с минимальными правками.
2) Затем выносить общее итеративно:
   - UI primitives → `packages/ui`
   - утилиты без привязки к Next/Payload → `packages/utils`
   - коллекции/глобалы/blocks Payload → `packages/cms-*`
   - плагины → `packages/plugins/*`

Критерий выноса:
- используется минимум в 2 apps, или ожидаемо будет переиспользоваться;
- API стабилен/понятен;
- нет жёсткой завязки на домен/конкретный сайт.

---

## Done-when (чеклист)

- [ ] Создан `apps/<app-dir>` и он запускается локально
- [ ] Есть `apps/<app-dir>/.env.example` без секретов
- [ ] Добавлены миграции в git (`apps/<app-dir>/src/migrations/**`) и их запуск воспроизводим (`payload migrate`)
- [ ] `apps/<app-dir>/tsconfig.json` расширяет `@synestra/typescript-config/nextjs.json`
- [ ] `apps/<app-dir>/eslint.config.mjs` использует `@synestra/eslint-config`
- [ ] `apps/<app-dir>/next.config.mjs` содержит `withPayload` и `transpilePackages` (по необходимости)
- [ ] `pnpm lint`, `pnpm test`, `pnpm build` проходят в корне
- [ ] Добавлены GitOps артефакты dev+prod:
  - `deploy/env/{dev,prod}/<app-key>.yaml`
  - `deploy/env/release-{dev,prod}/<app-key>.yaml`
  - `deploy/argocd/apps/{dev,prod}/<app-key>.yaml`
