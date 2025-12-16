# Runbook: поднять Payload CMS 3 (Postgres) “с нуля” так, чтобы БД корректно и детерминированно инициализировалась

Статус: актуально на **2025-12-16** (версия стека: Payload **3.68.3**, Next.js **15.4.9**).  
Этот документ — **временный канон** и будет уточняться по мере углубления в официальную документацию Payload/Argo CD/Okteto и нашу практику.

Цель: если мы разворачиваем сайт в `web-<app>-prod` на **пустую Postgres БД** (CNPG), то после деплоя:
- схема БД создана (таблицы/индексы),
- админка `/admin` открывается (можно создать первого пользователя),
- дальнейшие изменения схемы катятся через миграции, а не “магией”.

Связанные документы:
- Канон по БД: `docs/architecture/database-cnpg.md`
- Канон migrations hook Job: `docs/architecture/canon-v0.md` (раздел про миграции)
- Runbook добавления нового app: `docs/runbooks/runbook-add-app-from-payload-template.md`

---

## 0) Важное различие: Mongo template ≠ Postgres в production

Официальный `templates/website` в upstream использует MongoDB (`@payloadcms/db-mongodb`).  
В Mongo‑мире “поднять с нуля” проще: схема не требует миграций, структура коллекций создаётся динамически.

В `web-core` мы целимся в **Postgres** (`@payloadcms/db-postgres` + CloudNativePG). Для Postgres в production‑условиях нам нужна дисциплина миграций:
- в dev допустим быстрый режим “push схемы”,
- в dev/prod контуре схема должна быть воспроизводимой через `payload migrate` (migration files в git).

Нормативный документ по политике миграций в `web-core`: `docs/architecture/payload-migrations.md`.

---

## 1) Что должно быть в репозитории приложения ДО деплоя в `prod`

### 1.1. `payload.config.ts` обязан задавать `migrationDir` и управлять `push`

Минимум для Postgres:
- `migrationDir: path.resolve(dirname, 'migrations')`
- `push: process.env.NODE_ENV !== 'production'` (или эквивалентная логика)

Почему это важно:
- в `production` мы не рассчитываем на “автопуш схемы”;
- миграции становятся единственным детерминированным способом инициализации.

### 1.2. Должна существовать baseline‑миграция, закоммиченная в git

Для *первого* деплоя в prod на пустую БД миграции — это и есть “инициализация”.

Обязательный артефакт:
- `apps/<app>/src/migrations/**` (как минимум один baseline migration + `index.ts`).

### 1.3. Образ приложения обязан содержать migration files

Типовая ошибка при “production‑оптимизациях”: собрать образ так, что в runtime нет `src/migrations/**`, и тогда `payload migrate` нечего применять.

Правило:
- если мы используем `next build` и любой pruning/standalone — отдельно проверь, что `migrationDir` реально попадает в runtime слой образа.

---

## 2) Как корректно получить baseline‑миграцию (Postgres)

Цель: сделать так, чтобы на пустой БД в `production` можно было выполнить `payload migrate` и получить рабочую схему.

Рекомендуемый порядок (для нового app):

1) В dev‑режиме (локально или в dev‑контуре) включён `push: true`.
2) Собираем/меняем коллекции/глобалы/поля до “схема выглядит правильно”.
3) Генерируем миграцию:
   - `pnpm --filter @synestra/<app> payload migrate:create`
4) Фиксируем миграцию в git (`src/migrations/**`).
5) Проверяем воспроизводимость:
   - на *пустой* БД выполнить `pnpm --filter @synestra/<app> payload migrate`
   - убедиться, что приложение стартует и `/admin` не падает с `relation ... does not exist`.

Примечание:
- `seed` (демо‑контент) — это не миграции, это отдельная операция и обычно не должна выполняться автоматически в prod.

Официальный источник (Payload 3, migrations workflow и варианты запуска миграций в prod):  
`https://payloadcms.com/docs/database/migrations`.

---

## 3) Bootstrap в Kubernetes “с нуля” (пример: `web-synestra-io-prod`)

Это “канон” для нашего GitOps/ArgoCD подхода.

### 3.1. Предпосылки

- В `synestra-platform` создан CNPG cluster (prod) в namespace `databases` и есть runtime secret с:
  - `DATABASE_URI`,
  - `PAYLOAD_SECRET`,
  - (при необходимости) `CRON_SECRET`, `PREVIEW_SECRET`, `NEXT_PUBLIC_SERVER_URL` (non‑secret может идти через values).
- В `web-core` values приложения указывают `envFrom.secretRef` на этот secret.

### 3.2. Порядок действий

1) Развернуть/восстановить prod БД (CNPG cluster готов и принимает подключения).
2) Включить/проверить migrations Job в helm chart (в `web-core` это `deploy/charts/web-app`, включено по умолчанию).
3) Деплой приложения через ArgoCD.
4) Убедиться, что миграции выполнились:
   - Job `*-migrate` завершился `Complete`.
5) Открыть `/admin` и создать первого пользователя (если его нет).

Примечание: Payload также допускает запуск миграций “при старте сервера” через `prodMigrations`, но для Kubernetes мы канонизируем отдельный Job до старта приложения, чтобы упростить ordering и избежать конкуренции миграций при 2+ репликах. Подробности: `docs/architecture/payload-migrations.md`.

### 3.3. (Опционально) Seed для website‑template

У `templates/website` есть seed‑механика (кнопка в dashboard или endpoint `/next/seed`).  
Это добавляет демо‑страницы и медиа (например, hero background), поэтому пустая главная страница/отсутствие фонового изображения — типично “просто не делали seed”.

Рекомендация:
- в prod seed использовать только осознанно (или вырезать/закрыть фичу после первого запуска).

Проверка “seed ещё не делали”:
- `GET /api/pages?limit=1` возвращает `totalDocs: 0`,
- `GET /api/media?limit=1` возвращает `totalDocs: 0`.

---

## 4) Симптомы и быстрые проверки (если “не поднялось”)

### 4.1. `/admin` редиректит по кругу / не логинится

Чаще всего причины:
- `PAYLOAD_SECRET` отсутствует/меняется между деплоями (сломаны JWT/cookies),
- `NEXT_PUBLIC_SERVER_URL` не соответствует реальному домену,
- миграции не выполнились, БД пустая (ошибки в логах сервера/Job’а),
- приложение подключено не к той БД (`DATABASE_URI` неверный или попал fallback из конфигурации).

Минимальный чек:
- `Job *-migrate` успешен,
- в логах миграций нет “No migrations found”,
- `DATABASE_URI` и `PAYLOAD_SECRET` реально попали в Pod (через `envFrom.secretRef`).
