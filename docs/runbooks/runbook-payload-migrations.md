# Payload CMS 3 + PostgreSQL: канон миграций (для `web-core`)

Статус: актуально на **2025-12-16** (Payload **3.68.3**).  
Область: только **PostgreSQL** (CNPG) и деплой через **GitOps/Argo CD**.

Источник истины по поведению Payload migrations:  
`https://payloadcms.com/docs/database/migrations`.

---

## 1) Термины: `push` vs `migrate`

В Payload 3 (Postgres) есть два режима изменения схемы:

1) **`push`** — быстрый dev‑режим: схема “пропушивается” автоматически (без файлов миграций).
2) **`migrate`** — детерминированный режим: схема меняется через **migration files**, которые лежат в git.

Ключевое правило: **не смешиваем `push` и `migrate` для одной и той же базы**. Если вы уже “наpushили” схему в dev‑БД, а потом начали мигрировать — это источник неочевидных проблем. Каноничное решение для dev — пересоздать dev‑БД и применить миграции заново.

---

## 2) Почему для prod “с 0” миграции обязательны

Если прод‑БД пустая (новый кластер CNPG / удалили PVC / новый namespace), то:
- без migration files Payload **не создаст** таблицы и “схема не появится сама”;
- правильный старт — выполнить `payload migrate`, который создаст таблицы и записи в `payload_migrations`.

Практическое следствие для `web-core`: **baseline‑миграция должна существовать в git до первого prod‑деплоя**.

---

## 3) Минимальный контракт в коде приложения

### 3.1. Адаптер Postgres + `migrationDir`

В `apps/<app>/src/payload.config.ts` обязательно:
- `db: postgresAdapter({ ... migrationDir: path.resolve(dirname, 'migrations') ... })`
- `push: process.env.NODE_ENV !== 'production'` (или эквивалент)

Почему:
- фиксируем место миграций (`src/migrations/**`) и делаем его единообразным;
- в prod отключаем auto‑push и принуждаем `migrate`.

### 3.2. Миграции должны попадать в runtime образ

Если сборка оптимизируется (standalone output / turbo prune / docker multi-stage), проверь:
- `src/migrations/**` присутствует в runtime слое;
- `migrationDir` указывает на реальный путь в контейнере.

Если миграции запускаются через `pnpm` (Job в `deploy/charts/web-app`):
- в runtime должен быть `pnpm-workspace.yaml` (pnpm не читает workspaces из `package.json`);
- должны быть **app‑node_modules** (`apps/<app>/node_modules`) с `payload` CLI и `cross-env`;
- бинарям нужен доступ через `PATH` (`node_modules/.bin`) либо используйте `pnpm exec payload`.

Иначе Job падает с `cross-env: not found` или `Command "payload" not found`.

---

## 4) Как получить baseline‑миграцию (для нового сайта)

Рекомендуемый workflow:

1) В dev работаем в режиме `push` (быстро итеративно меняем коллекции/поля).
2) Когда “схема готова” — генерируем baseline migration file:
   - `pnpm --filter @synestra/<app> payload migrate:create`
3) Проверяем миграции на пустой БД (локально или в отдельной dev‑БД):
   - `pnpm --filter @synestra/<app> payload migrate`
4) Коммитим `apps/<app>/src/migrations/**`.

---

## 5) Где запускать миграции в prod (варианты) и наш выбор

Payload описывает несколько вариантов, когда и где запускать миграции. В нашем стеке:

### Вариант A (канон `web-core`): Kubernetes Job до старта приложения

Мы запускаем `payload migrate` как отдельный Job в том же окружении, что и приложение:
- тот же образ,
- те же env vars (через `envFrom.secretRef`),
- запуск **до** rollout основного Deployment.

Реализация в `web-core`:
- `deploy/charts/web-app/templates/migrations-job.yaml`
- `deploy/charts/web-app/values.yaml` (`migrations.command` + ожидание TCP доступности Postgres)

Почему этот вариант сейчас лучший:
- не требуется доступ CI к БД,
- ordering контролируется GitOps (Job → Deployment),
- воспроизводимость выше (одинаковая среда выполнения).

### Вариант B: запуск миграций в CI перед сборкой/деплоем

Payload описывает best practice “выполнить миграции до build”. Это подходит, если CI имеет сетевой доступ к БД prod и мы готовы этим управлять.

В нашем стеке (GitLab CI → Argo CD) это возможно, но требует:
- безопасной сети CI → cluster DB,
- учёта RPO/RTO и контроля параллельных пайплайнов.

### Вариант C: `prodMigrations` (runtime‑запуск на старте сервера)

Payload допускает “запуск миграций при инициализации сервера” через `prodMigrations`. Это удобно, когда нельзя мигрировать в CI и не хочется отдельного Job.

Минусы в Kubernetes:
- при 2+ репликах может появиться конкуренция “кто мигрирует” (нужно продумать блокировки/стартовую стратегию),
- усложняет rollout/rollback (миграция может произойти “внутри” обычного старта приложения).

Поэтому для `web-core` на старте канонизируем вариант A, а `prodMigrations` рассматриваем как запасной путь.

---

## 6) Влияние на dev→prod flow и rollback

1) PR, меняющий схему (collections/fields/relations), обязан содержать migration files.
2) При promotion dev→prod миграции выполняются как часть GitOps rollout.
3) Rollback кода не всегда = rollback схемы.

Минимальный операционный принцип:
- миграции считаем “однонаправленными” и планируем откат схемы отдельно (если требуется).
