# Dev‑деплой (Kubernetes + Argo CD): `corporate` сайт

Дата актуальности: **2025-12-15**.  
Версии: **Payload `v3.68.3`**, **Next.js `v15.4.9`**.

Цель документа — описать пошаговый план, как развернуть **один** сайт (корпоративный) в окружении **dev** через GitOps (Argo CD), учитывая:

- монорепо `~/repo/web-core` хранит **код** и **GitOps‑шаблоны** деплоя;
- `~/synestra-platform` хранит **инфраструктуру** и **секреты** (SOPS/age), а также выполняет сборку Docker‑образов (GitLab CI).

---

## 0) Как шаблоны Payload помогают именно нам

Мы используем официальный template Payload как **эталон продуктового приложения** (структура Next+Payload, набор плагинов, pages/collections, генераторы import map и types, минимальный набор env vars), а не как “готовый k8s‑деплой”.

Для `corporate` базовый референс — `upstream/payload/templates/website`:

- ✅ даёт проверенную структуру `src/**` + Next App Router + Payload admin
- ✅ даёт список env‑переменных и их смысл (`.env.example`)
- ✅ даёт примеры “обязательных” prod‑фич: jobs/cron auth, preview/live preview, SEO, redirects, media storage
- ✅ даёт Dockerfile‑паттерн (Next `output: 'standalone'`) как ориентир для наших образов
- ⚠️ требует адаптации под **Postgres (CNPG)**, потому что upstream‑шаблон по умолчанию использует MongoDB (`@payloadcms/db-mongodb`)

Отдельно: `upstream/payload/templates/ecommerce` нужен позже для `shop` (Stripe/webhooks/плагины), но для `corporate` в dev‑деплое не обязателен.

---

## 1) Соглашения именования для первого dev‑деплоя

Ниже — конкретные имена, которые используем в этом плане (чтобы не “плавать”):

- Deployment key: `corporate`
- App в монорепе: `apps/corporate-website` (workspace package: `@synestra/corporate-website`)
- Namespace: `web-corporate-dev`
- ArgoCD Application (внутри `web-core`): `web-corporate-dev`
- CNPG Cluster (platform-managed, namespace `databases`): `corporate-dev-cnpg` (сервис для записи: `corporate-dev-cnpg-rw.databases.svc.cluster.local`)
- Hostname (пример): `corporate.dev.<BASE_DOMAIN>`
  - `<BASE_DOMAIN>` выбирается в `synestra-platform` (в зависимости от DNS/ingress)

---

## 2) Предварительные условия (что должно быть в кластере)

Это обычно уже обеспечивает `synestra-platform`, но для первого деплоя стоит явно проверить:

1. Argo CD установлен и работает.
2. Ingress controller установлен, настроен (и понятно, какой класс ingress использовать).
3. cert-manager настроен (если нужен TLS для dev).
4. CloudNativePG operator установлен (уже есть в `synestra-platform`).
5. В кластере есть StorageClass по умолчанию (для PVC Postgres и для media‑uploads).
6. Argo CD имеет доступ к репозиторию `web-core` (repo credentials / deploy key / token).
7. Есть registry + `imagePullSecret` (если registry приватный).
8. (Опционально для hot‑dev) Okteto установлен и интегрирован (Self‑Hosted на платформе); схема “Okteto поверх ArgoCD” описана в `docs/runbooks/runbook-okteto-dev.md`.

---

## 3) Подготовка приложения `apps/corporate-website` в `web-core`

Цель шага: получить **рабочий** Next+Payload app локально, прежде чем идти в Kubernetes.

### 3.1. Синхронизация с референсом `templates/website`

Действия:

1) Перенести структуру и код из `upstream/payload/templates/website` в `apps/corporate-website` (как стартовую реализацию):

- `src/**` (collections, components, app routes, admin layout, utilities, plugins, etc.)
- `public/**` (или минимум `public/media` и необходимые ассеты)
- `tailwind.config.mjs` / `postcss.config.js` / `globals.css` — если оставляем Tailwind как есть (dev‑быстро).

2) Зафиксировать зависимости под наши версии:

- `payload@3.68.3`
- `@payloadcms/next@3.68.3`
- `next@15.4.9`
- `react@19.2.1`, `react-dom@19.2.1`

3) Сразу решить (минимум для dev):

- оставляем Tailwind (быстро), или заменяем на свою UI‑систему позже (не блокирует деплой).
- “generated artifacts” (`payload-types.ts`, `admin/importMap.js`) — в шаблоне они коммитятся; для нас это удобно:
  - в dev‑контуре: коммитим и держим актуальными
  - позже: добавим CI‑проверку/генерацию

### 3.2. Переход на Postgres (CNPG) вместо Mongo

Upstream `website` использует `mongooseAdapter({ url: process.env.DATABASE_URI })`.

Для Kubernetes‑цели нам нужно **перевести app на Postgres adapter**, чтобы:

- БД была Postgres под управлением CNPG (CloudNativePG)
- деплой использовал единый контракт `DATABASE_URI` (dev/prod одинаково; где именно живёт CNPG Cluster — зависит от выбранного режима, см. `docs/architecture/database-cnpg.md`)

Минимальный результат:

- dependency: `@payloadcms/db-postgres` (версия согласована с `payload@3.68.3`)
- `payload.config.ts`: `db: postgresAdapter({ ... })` и `DATABASE_URI` как connection string
- миграции включены и выполняются детерминированно (см. раздел 6)

> Важно: этот шаг может вскрыть “ломающиеся” места в шаблоне (seed, media, hooks). Это нормально: лучше поймать сейчас локально.

### 3.3. Локальный smoke‑test (обязателен перед k8s)

1) Поднимаем локальную Postgres (docker compose или локально).
2) Экспортируем env vars (минимум):

- `DATABASE_URI`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL` (например `http://localhost:3000`)
- `CRON_SECRET` / `PREVIEW_SECRET` (если включаем соответствующие фичи)

3) Запускаем:

- `pnpm install`
- `pnpm --filter @synestra/corporate-website dev`

Проверяем:

- открывается `/admin`
- можно создать пользователя / войти
- создаются коллекции/таблицы
- media upload работает (локально)

---

## 4) Docker‑образ для `corporate` (как будет запускаться в Kubernetes)

Цель шага: получить **воспроизводимый** production‑like образ, который GitLab CI будет собирать и пушить.

### 4.1. Что берём из upstream Dockerfile

Upstream `templates/website/Dockerfile` ориентируется на Next `output: 'standalone'`.

Это полезно как ориентир, но у нас появляется дополнительная задача:

- **миграции** (Postgres) должны запускаться перед стартом приложения

Поэтому для первого dev‑деплоя можно выбрать один из вариантов (рекомендуется выбрать один и стандартизировать):

**Вариант A (проще для dev): “толстый” runtime образ с `node_modules`**

- `next build` → `next start`
- в образе есть `node_modules`, можно запускать `payload` CLI для миграций
- минус: образ больше, но для dev это приемлемо

**Вариант B (ближе к prod): Next `standalone` + отдельный migrator Job**

- runtime образ минимальный
- миграции запускаются отдельным Job’ом (возможно отдельным образом или отдельным target)
- сложнее, но лучше масштабируется

Для первого dev‑деплоя (скорость важнее) обычно выбирают **A**, а затем переходят к **B**.

### 4.2. Что должно быть в образе “обязательно”

- фиксированный `node` (совпадает с нашей политикой Node >= 22)
- сборка приложения (`next build`)
- отсутствие `.env` файлов в образе
- корректная рабочая директория и `PORT`
- (если нужен) writable каталог для `public/media` (в k8s будет PVC)

---

## 5) GitOps артефакты в `web-core` (что нужно добавить/сгенерировать)

### 5.1. Helm chart: `deploy/charts/web-app`

Минимальные ресурсы:

- `Deployment`
- `Service`
- `Ingress`
- `ServiceAccount` (при необходимости)
- `PVC` для media (dev: включено, RWO)
- (опционально) `HorizontalPodAutoscaler` (dev: обычно выключено)

Параметризация через values:

- `image.repository`, `image.tag`, `image.pullSecrets`
- `service.port` (обычно 3000 внутри контейнера)
- `ingress.className`, `ingress.hosts`, `ingress.tls`
- `resources` (requests/limits)
- `env` (non-secret) и `envFrom.secretRef` (secret)
- `persistence.media.enabled`, `persistence.media.mountPath`

### 5.2. БД: Postgres через CloudNativePG (CNPG)

Канон для новых web‑приложений: **platform-managed DB**.

Это значит:
- CNPG Cluster’ы живут в namespace `databases` и управляются репозиторием `synestra-platform`;
- в `web-core` для приложения ставим `postgres.enabled: false`;
- приложение подключается к Postgres через `DATABASE_URI` из runtime Secret (через `envFrom.secretRef`).

Почему так:
- web‑приложения не должны владеть “платформенными” ресурсами и случайно удалять БД через `--prune`;
- упрощаем сопровождение (backup/restore/мониторинг/политики) централизованно на платформе;
- naming становится единообразным и шаблонным.

Операционный runbook: `docs/runbooks/runbook-database-cnpg.md`.  
Архитектурный канон: `docs/architecture/database-cnpg.md`.

Допустимая альтернатива (только для экспериментов/POC): **per-namespace DB**, когда CNPG Cluster создаёт сам chart `deploy/charts/web-app` при `postgres.enabled: true` (тогда нужны `*-db-init` secrets в web‑namespace).

### 5.3. Миграции Payload (GitOps‑паттерн)

Для Postgres миграции нужно запускать **до** rollout приложения.

Практичный GitOps‑вариант (и то, как уже устроен наш chart `deploy/charts/web-app`):

- `Job` миграций запускается как ArgoCD hook **`Sync`** (а не `PreSync`), чтобы избежать deadlock на первом install, когда БД поднимается параллельно.
- `sync-wave` миграций должен быть **позже**, чем волна БД (если БД создаётся chart’ом), и **раньше**, чем волна приложения.
- Job запускает `pnpm payload migrate`, используя **тот же образ**, что и приложение, и тот же Secret с env vars (`DATABASE_URI`, `PAYLOAD_SECRET`, ...).

Для dev достаточно:

- миграции выполняются на каждую синхронизацию (или только при изменении схем — позже оптимизируем)
- при параллельных деплоях не возникает гонки (в dev обычно 1 replica)

### 5.4. Values для dev: `deploy/env/dev/corporate.yaml`

Должны содержать только “не‑секреты”:

- ingress hosts/tls
- ресурсы
- feature flags (если есть)
- публичные `NEXT_PUBLIC_*` (например `NEXT_PUBLIC_SERVER_URL`)
- ссылки на Secret’ы (имя Secret), но не секретные значения

### 5.5. ArgoCD Application: `deploy/argocd/apps/dev/corporate.yaml`

`Application` должен:

- указывать на chart `deploy/charts/web-app`
- подключать values `deploy/env/dev/corporate.yaml`
- деплоить в namespace `web-corporate-dev`
- для dev‑окружений **не** использовать `CreateNamespace=true`, чтобы namespace создавался/жил “правильно” для Okteto (см. `docs/runbooks/runbook-okteto-dev.md`)
- иметь понятную стратегию sync для dev (обычно auto‑sync допустим)

---

## 6) Что нужно сделать в `synestra-platform` (секреты + связка ArgoCD)

### 6.1. Секреты (SOPS) для `web-corporate-dev`

Минимально нужно создать (наименования примерные, важно закрепить стандарт):

1) Secret для приложения (env):

- `DATABASE_URI` (или набор `DB_HOST/DB_USER/DB_PASS/DB_NAME`, но тогда собираем URI в app)
- `PAYLOAD_SECRET`
- `CRON_SECRET` (если jobs/cron)
- `PREVIEW_SECRET` (если preview)

2) База данных (канон: CNPG в namespace `databases`)

- initdb secret (SOPS) в `secrets/databases/`:
  - имя: `corporate-initdb-secret`
  - namespace: `databases`
  - ключи: `username`, `password` (тип обычно `kubernetes.io/basic-auth`)
- runtime `DATABASE_URI` лежит в `web-corporate-<env>-env` (в web‑namespace), и указывает на сервис CNPG вида:
  - dev: `corporate-dev-cnpg-rw.databases.svc.cluster.local`
  - prod: `corporate-cnpg-rw.databases.svc.cluster.local`

3) `imagePullSecret` (если registry приватный).

Важно:

- **все** эти secrets создаются в `synestra-platform/secrets/**` и применяются ArgoCD через SOPS plugin.
- `web-core` лишь ссылается на имена Secret’ов.

### 6.2. Связка ArgoCD `synestra-platform` ↔ `web-core`

Чтобы ArgoCD в кластере начал применять `web-core`:

1) В `synestra-platform` добавляем root Application (например `argocd/apps/web-core.yaml`), который указывает на путь `web-core/deploy/argocd/apps/dev`.
2) (Рекомендуется) добавляем AppProject для web‑приложений, который ограничивает:
   - `sourceRepos` (разрешённые репозитории)
   - `destinations` (только `web-*-*`)

На “первый запуск” допустимо временно создать **один** Application в `synestra-platform`, который указывает прямо на `web-core/deploy/...` для corporate, но целевой паттерн — app‑of‑apps.

### 6.3. CI сборка образа (GitLab) и обновление GitOps

Целевой dev‑цикл:

1) GitLab CI в `synestra-platform` собирает образ для `apps/corporate-website`.
2) Пушит в registry с immutable tag (например git SHA).
3) Обновляет `web-core/deploy/env/dev/corporate.yaml` (image tag) коммитом (или другой автоматизацией).
4) ArgoCD подхватывает commit и делает sync.

---

## 7) Пошаговая процедура “сделать dev‑деплой”

Ниже — “операционный” план (что реально делаем руками/скриптами).

### Шаг 1. Подготовить app (локально) и слить в `main`

- привести `apps/corporate-website` к рабочему состоянию (см. раздел 3)
- убедиться, что `pnpm --filter @synestra/corporate-website build` проходит
- убедиться, что app запускается локально

### Шаг 2. Добавить GitOps артефакты в `web-core`

- `deploy/charts/web-app/**`
- `deploy/env/dev/corporate.yaml`
- `deploy/argocd/apps/dev/corporate.yaml`

Слить в `main`.

### Шаг 3. Добавить secrets + root Application в `synestra-platform`

- добавить SOPS‑секреты для `web-corporate-dev`
- добавить root Application на `web-core` (или временный single Application)
- дождаться sync `synestra-platform` (ArgoCD применит новые ресурсы)

### Шаг 4. Собрать и запушить образ `corporate` (CI)

- запустить GitLab pipeline (или вручную для первого раза)
- получить `image.repository` и `image.tag`

### Шаг 5. Обновить `deploy/env/dev/corporate.yaml` на новый image tag

- либо автоматом (CI делает commit),
- либо вручную (первый прогон).

### Шаг 6. Дождаться ArgoCD Sync и проверить ресурсы

Проверки:

- namespace `web-corporate-dev` создан
- CNPG Cluster `corporate-dev-cnpg` в namespace `databases` в состоянии `Cluster in healthy state`
- миграции Job (если включён) выполнен успешно
- Deployment `web-corporate` в `Available`
- Ingress выдал адрес/сертификат (если TLS)

### Шаг 7. Функциональная проверка

- открыть `https://corporate.dev.<BASE_DOMAIN>/`
- открыть `https://corporate.dev.<BASE_DOMAIN>/admin`
- создать/войти в админку
- создать контент (Page/Post), проверить preview (если включено)
- загрузить media, убедиться что файл сохраняется (после restart пода)

---

## 8) “Done-when” для первого dev‑деплоя corporate

Считаем задачу “dev‑деплой corporate готов” когда:

- `web-corporate-dev` ArgoCD Application в `Synced` и `Healthy`
- `web-corporate-dev` namespace существует
- CNPG Cluster `corporate-dev-cnpg` (namespace `databases`) в `Cluster in healthy state`
- приложение отвечает по домену и открывается `/admin`
- медиа‑файлы переживают перезапуск pod’а (PVC подключён правильно)
- секреты не хранятся в `web-core` и не попали в git

---

## 9) Hot‑dev через Okteto (после базового деплоя)

Цель: заменить `hostPath`‑хаки на повторяемый “developer loop” поверх Kubernetes.

### 9.1. Важный нюанс: ArgoCD vs Okteto (drift)

Okteto dev‑режим временно патчит workload (команда/volume/sync), поэтому при строгом self‑heal ArgoCD будет пытаться откатить изменения.

Текущий канон для `dev` окружения:
- для web‑приложений `selfHeal: false` (ArgoCD не должен немедленно откатывать временные изменения, которые вносит Okteto dev‑сессия);
- для `stage/prod` — `selfHeal: true`.

Альтернативы (если позже потребуется жёсткий self‑heal в dev):
- отдельный dev namespace per developer,
- временная пауза auto‑sync на время сессии,
- точечный `ignoreDifferences` (требует высокой дисциплины).

### 9.2. Что добавить в `web-core`

- Okteto manifest в `.okteto/okteto.yml` (единая точка входа для монорепы):
  - sync правил (монорепа целиком),
  - проброс порта (обычно 3000),
  - команда запуска `pnpm --filter @synestra/corporate-website dev`.
- `.stignore` в корне репозитория (исключения для Syncthing).

### 9.3. Что добавить в `synestra-platform`

- (Уже сделано) поддерживать установку Okteto как платформенного приложения через ArgoCD (Helm chart).
- Определить и задокументировать канон namespaces (Okteto namespaces vs k8s namespaces) и RBAC, чтобы dev‑сессии можно было запускать “поверх” dev‑деплоя сайта.

---

## 10) Что можно упростить на первом шаге (если нужно “быстрее запуститься”)

Если цель — “показать живой dev URL как можно раньше”, допустимы упрощения:

- 1 replica, без HPA
- без TLS (если есть внутренний домен/ingress)
- миграции вручную (первый раз) — но зафиксировать, что это временно
- media storage через PVC RWO (без S3)
- отключить seed/cron/preview до следующей итерации

Главное: не нарушать базовые принципы — **изолированный namespace**, **1 БД на deployment (CNPG)**, **секреты только в synestra-platform**, **GitOps‑истина в web-core**.
