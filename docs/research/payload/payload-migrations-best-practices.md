# Payload CMS 3: миграции и эволюция схемы — best practices (official-first)

Дата актуальности: **2025-12-16** (Payload **3.68.3** в `web-core`).  
Цель: зафиксировать практики, которые уменьшают риск “сломать БД” и уменьшают копипаст при добавлении новых apps/пакетов вокруг Payload.

## 1) Официальные источники (первичные)

- Migrations (общий обзор, команды CLI, “best practices”):  
  `https://payloadcms.com/docs/database/migrations`
- Postgres adapter (`push`, schema hooks, особенности хранения blocks):  
  `https://payloadcms.com/docs/database/postgres`
- SQLite adapter (в основном для локальной разработки/прототипов):  
  `https://payloadcms.com/docs/database/sqlite`
- MongoDB adapter (для контраста: нет “SQL schema”, миграции чаще про данные):  
  `https://payloadcms.com/docs/database/mongodb`

---

## 2) Что такое migrations в Payload 3 (на практике)

Payload migrations — это “версионирование изменений” (схемы и/или данных), которое:
- хранится в репозитории как набор файлов (обычно `src/migrations/**`),
- выполняется командой `payload migrate`,
- фиксируется в базе (у Postgres/SQLite — через таблицу `payload_migrations`).

Важно: в Postgres/SQLite Payload генерирует миграции из **конфига** (collections/fields), поэтому миграции — это часть “контракта деплоя”, а не опциональная оптимизация.

---

## 3) Ключевая развилка: `push` vs `migrate` (Postgres/SQLite)

Официальный смысл:
- `push: true` — быстрый dev‑режим, который “подкручивает” схему автоматически (без файлов миграций).
- `push: false` + `payload migrate` — детерминированный прод‑режим через migration files.

Практика для продакшена:
- **в prod всегда `push: false`**;
- **не направлять `push` на базу, где важны данные** (stage/prod/общая dev‑БД), иначе легко получить рассинхрон/потерю данных;
- если “наpushили” схему, а потом переходите на migrations — проще и надёжнее пересоздать dev‑БД и применить миграции заново, чем лечить состояние.

---

## 4) Рекомендуемый workflow (официальная логика → наш канон)

### 4.1. Как получать миграции

Официальный подход:
- в процессе разработки меняем schema (Payload config),
- при готовности изменений создаём migration files через `payload migrate:create`,
- проверяем их на “чистой” базе,
- коммитим миграции.

В `web-core` это уже оформлено каноном:
- `apps/<app>/src/payload.config.ts` фиксирует `migrationDir`,
- `apps/<app>/src/migrations/**` коммитится и попадает в runtime‑образ,
- в k8s миграции выполняются отдельным Job до старта приложения.

См. внутренний нормативный документ: `docs/architecture/payload-migrations.md`.

### 4.2. Где запускать миграции

Официально Payload допускает несколько вариантов (до старта сервера, в CI, на старте приложения).

Канон `web-core` для Kubernetes/Argo CD:
- **отдельный Job** (`deploy/charts/web-app/templates/migrations-job.yaml`) с командой `payload migrate`,
- запуск **до** rollout основного Deployment (управляется GitOps sync-wave/hook).

---

## 5) Стандарты структуры в монорепо (уменьшаем копипаст)

Минимальный “контракт” для каждого Payload‑приложения в `apps/*`:

1) `apps/<app>/src/payload.config.ts`
   - `db: postgresAdapter({ ..., migrationDir: path.resolve(dirname, 'migrations'), push: !isProd })`
   - `typescript.outputFile` направлен внутрь app (`src/payload-types.ts`)
2) `apps/<app>/src/migrations/`
   - `index.ts` (реестр миграций)
   - `*.ts` (функции `up`/`down`)
   - `*.json` (schema snapshot для генерации diff)
   - `README.md` (коротко: где выполняются миграции в проде)

Живой пример: `apps/synestra-io/src/payload.config.ts` и `apps/synestra-io/src/migrations/`.

---

## 6) Best practices, которые легко нарушить (и как не нарушать)

1) **Не делайте schema env‑зависимой без крайней необходимости.**  
   Payload явно предупреждает: если ваша schema зависит от env vars, миграции могут различаться между средами. Если это всё же нужно — генерация миграций должна выполняться в “prod‑конфигурации”, и это должно быть отражено в runbook.

2) **Всегда проверяйте `payload migrate` на пустой базе** перед тем как считать миграцию “готовой”.  
   Это самый быстрый способ отловить ошибки порядка миграций/недостающих файлов.

3) **Не рассчитывайте на FS внутри контейнера** для продакшен‑схемы.  
   Если `src/migrations/**` не попал в runtime‑слой, `payload migrate` выполнится “пусто”, и приложение не поднимется корректно.

4) **Rollback кода ≠ rollback схемы.**  
   Планируйте миграции как однонаправленные изменения; откат схемы — отдельная операция (и отдельное решение).

---

## 7) Что можно автоматизировать далее (следующий шаг)

Чтобы ещё сильнее уменьшить копипаст при создании нового сайта/app:
- добавить генератор (`@turbo/gen`) шаблона `src/migrations/*` + заготовок npm scripts (`migrate`, `migrate:create`, `migrate:status`) + обязательных строк в `payload.config.ts`.

