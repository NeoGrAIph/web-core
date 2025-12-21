# Runbook / отчёт: bootstrap `synestra.io` (prod) и `dev.synestra.io` (dev)

Дата актуальности: **2025-12-15**.  
Версии: **Payload `3.68.3`**, **Next.js `15.4.9`**, **Turborepo `2.6.3`**.  
Namespaces:
- **prod**: `web-synestra-io-prod`
- **dev**: `web-synestra-io-dev`

Этот документ фиксирует **только то, что реально осталось в Git** (в двух репозиториях) после проделанной работы, и объясняет:
- *что* именно добавлено/изменено;
- *зачем* это сделано;
- *на основании каких правил/документов/ограничений* принимались решения;
- *какой ожидаемый результат* и *какие текущие проблемы* (если они наблюдаются).

---

## 0) Короткое резюме (что было сделано)

### В `web-core` (`/home/neograiph/repo/web-core`)

1) Добавлено deployable приложение **`apps/synestra-io`** на базе обработки официального Payload template `website` (источники — `upstream/payload/templates/website`, read-only).
2) Подготовлен универсальный Helm chart **`deploy/charts/web-app`** для деплоя одного Next.js+Payload app (Deployment/Service/Ingress/PVC/CNPG Cluster + migrations hook Job).
3) Подготовлены values и ArgoCD Application‑манифесты для **двух окружений**:
   - `deploy/env/dev/synestra-io.yaml` + `deploy/argocd/apps/dev/synestra-io.yaml`
   - `deploy/env/prod/synestra-io.yaml` + `deploy/argocd/apps/prod/synestra-io.yaml`
   - release‑слои:
     - `deploy/env/release-dev/synestra-io.yaml`
     - `deploy/env/release-prod/synestra-io.yaml`
4) Исправлены проблемы, которые блокировали деплой через ArgoCD/Helm:
   - `deploy/charts/web-app/templates/README.md` переносится в `_README.md`, чтобы Helm не пытался парсить Markdown как YAML‑манифест;
   - команда миграций выполнена через `pnpm --filter "$APP_NAME" payload migrate` (монорепа + сборка из `turbo prune`);
   - `persistence.media.mountPath` для `synestra-io` выставлен на реальный путь `/app/apps/synestra-io/public/media`;
   - включён ESM‑режим для внутренних пакетов/конфига, чтобы CLI `payload` корректно запускался (см. раздел 2.3).

### В `synestra-platform` (`/home/neograiph/synestra-platform`)

1) Добавлен ArgoCD AppProject **`synestra-web`** (изоляция web‑приложений в namespaces `web-*`).
2) Добавлен root ArgoCD Application **`apps-web-core`** (app‑of‑apps), который подтягивает ArgoCD Applications из `web-core`.
3) Добавлены wildcard TLS сертификаты (cert-manager) и Traefik `TLSStore default` для автоподбора сертификата по SNI без per-namespace TLS secrets.
4) Убраны конфликтующие host’ы (`synestra.io`, `synestra.tech`) из legacy ingress приложения `infra-payload`, чтобы освободить домены под новые сайты.
5) Созданы SOPS‑зашифрованные секреты/namespace‑манифесты для `web-synestra-io-dev` и `web-synestra-io-prod` (env + registry pull secret), а также общий initdb secret для CNPG в namespace `databases` (`synestra-io-initdb-secret`).

---

## 1) Принципы и ограничения, которые учитывались

### 1.1. Разделение ответственности (два репозитория)

- `web-core` — **код приложений** + **GitOps‑артефакты приложений** (chart/values/ArgoCD Application manifests), без секретов.
- `synestra-platform` — **кластерная инфраструктура** (ArgoCD/Traefik/cert-manager/Okteto/Keycloak/DB operators) + **SOPS‑секреты**.

Это следует из правил в `web-core/AGENTS.md` и `synestra-platform/AGENTS.md`:
- secrets не храним в `web-core`;
- изменения кластера делаем через GitOps (ArgoCD), а не вручную.

### 1.2. Dev+Prod сразу, без Stage на старте

Схема “dev+prod” на старте зафиксирована в `web-core/docs/runbooks/runbook-dev-prod-flow.md`:
- dev нужен для hot‑разработки (Okteto) и быстрых итераций;
- prod — строго GitOps‑стабильный;
- позже можно добавить stage, не ломая структуру.

### 1.3. Namespaces как единицы изоляции

Принцип “one namespace ↔ one deployment ↔ one DB” реализован как:
- отдельный CNPG Cluster на deployment (для `synestra.io` кластера БД живут в namespace `databases` и управляются платформой),
- `synestra-platform/argocd/apps/app-projects.yaml` (AppProject ограничивает web‑приложения namespaces `web-*`).

Примечание: chart `deploy/charts/web-app` умеет (опционально) создавать CNPG Cluster в namespace приложения, но для `synestra.io` это отключено (`postgres.enabled=false`), см. `docs/architecture/database-cnpg.md`.

---

## 2) Что именно сделано в `web-core` и зачем

Ниже описано только то, что действительно существует в репозитории `web-core` на текущий момент.

### 2.1. Приложение: `apps/synestra-io/*`

**Файлы/каталоги:**
- `apps/synestra-io/` — Next.js 15 + Payload 3, адаптированный под монорепу.

**Зачем:**
- это первый “боевой” сайт на домене `synestra.io` (prod) и `dev.synestra.io` (dev),
- это референс‑реализация для дальнейшего тиражирования на сайты группы.

**Согласно чему:**
- исходник взят из официального шаблона Payload (upstream `website`, read-only),
- версии зафиксированы в `web-core/AGENTS.md` (Payload `3.68.3`, Next.js `15.4.9`).

**Важные особенности реализации:**

1) **Postgres вместо Mongo**
   - Payload template `website` по умолчанию ориентирован на MongoDB (`@payloadcms/db-mongodb`).
   - В `apps/synestra-io/src/payload.config.ts` используется `@payloadcms/db-postgres` и `DATABASE_URI`.
   - Это согласуется с общим курсом на CNPG (CloudNativePG) в кластере и типичным прод‑паттерном для k8s.

2) **Валидация env vars**
   - В `apps/synestra-io/src/env.ts` используется `@synestra/env` (Zod‑валидация) и явный контракт.
   - Причина: ошибки окружения должны падать **раньше**, с понятным сообщением, и без утечки значений.
   - Контракт описан в `docs/architecture/env-contract.md`.

3) **ESM / совместимость с Payload CLI**
   - Добавлено `"type": "module"` в:
     - `apps/synestra-io/package.json`
     - `packages/cms-core/package.json`
     - `packages/env/package.json`
   - Причина: Payload 3 запускает бинари через ESM и использует `tsx` для трансляции TS; в mixed CJS/ESM режиме ловятся ошибки резолва/экспортов.
   - Соответственно, конфиги, которые импортируются как ESM, приведены к `export default`:
     - `apps/synestra-io/redirects.js`
     - `apps/synestra-io/postcss.config.js`

4) **Media storage путь**
   - В `apps/synestra-io/src/collections/Media.ts` `staticDir` указывает на `../../public/media`.
   - В собранном образе (монорепа внутри контейнера) это соответствует пути:
     - `/app/apps/synestra-io/public/media`
   - Поэтому в values для `synestra-io` переопределён mountPath PVC (см. 2.4).

### 2.2. Shared packages: `packages/env` и `packages/cms-core`

**`packages/env`**
- Назначение: единый способ описывать env‑контракт и валидировать его runtime‑схемой (Zod) без вывода секретов.
- Ключевые exports:
  - `z` (реэкспорт Zod),
  - `getSynestraEnv(runtimeEnv)` → `dev|stage|prod`,
  - `createValidatedEnv({ schema, runtimeEnv, appName })`.

**`packages/cms-core`**
- Назначение: выносить повторно используемые Payload‑конфиги (коллекции/access/common patterns) в `packages/*`, чтобы разные сайты не копировали один и тот же код.
- Сейчас содержит `Users` collection (`packages/cms-core/src/collections/users.ts`) и экспорт из `packages/cms-core/src/index.ts`.

Почему это важно именно для нашей цели:
- Payload templates часто дублируют `Users`/auth/access в каждом app;
- если с первого сайта заложить вынос в `packages/*`, новые сайты легче добавлять “как из конструктора”.

### 2.3. Docker сборка под монорепу: `docker/Dockerfile.turbo`

**Файл:** `docker/Dockerfile.turbo`

**Зачем:**
- собирать **одно** приложение из монорепозитория без копирования всего репо в image;
- сделать сборку предсказуемой и совместимой с CI/remote cache (Turborepo).

**Как работает:**
1) Сначала делается `turbo prune --docker` → получается минимальный workspace в `out/<app>/json` и полный код в `out/<app>/full`.
2) Dockerfile ставит deps на базе `json/`, затем копирует `full/` и билдит только выбранный workspace:
   - `ARG APP_NAME`
   - `RUN pnpm --filter "${APP_NAME}" build`
3) В runtime stage прокидывается `APP_NAME` в env:
   - `ENV APP_NAME="${APP_NAME}"`
   - Это нужно и для старта (`pnpm --filter ${APP_NAME} start`), и для hook job миграций.

### 2.4. Helm chart приложения: `deploy/charts/web-app`

**Директория:** `deploy/charts/web-app/`

**Назначение:**
- унифицированный деплой одного приложения Next.js+Payload в Kubernetes:
  - `Deployment`, `Service`, `Ingress`,
  - `PVC` для медиа (`public/media`),
  - опционально CNPG Postgres `Cluster`,
  - migrations Job как ArgoCD hook.

**Почему chart живёт в `web-core`:**
- это “application layer”: шаблон деплоя сайтов;
- platform‑репозиторий отвечает за общие сервисы (Traefik/cert-manager/Okteto), но не должен знать детали каждого сайта.

#### 2.4.1. Критичный фикс: Markdown в `templates/`

**Факт:** ArgoCD показывал `ComparisonError` при генерации манифестов:
- Helm пытался парсить `deploy/charts/web-app/templates/README.md` как YAML.

**Исправление (в репозитории):**
- файл переименован в `deploy/charts/web-app/templates/_README.md`.

**Почему именно так:**
- Helm обрабатывает файлы в `templates/` как шаблоны, а файлы с `_`‑префиксом используются как “partials/служебные” и не рендерятся в манифесты.
- Нам важно сохранить пояснение рядом с шаблонами, но не ломать рендер.

#### 2.4.2. Миграции как ArgoCD hook Job

**Файл:** `deploy/charts/web-app/templates/migrations-job.yaml`

**Мотивация:**
- Payload требует миграции схемы БД до запуска приложения.
- В GitOps‑модели удобно запускать миграции как hook Job **до** rollout Deployment.
- В нашем chart это сделано как hook **`Sync`** (а не `PreSync`) с более поздней `sync-wave`, чтобы избежать deadlock на первом install (когда БД/приложение появляются в одном sync).

**Команда миграций:**
- Настроена в `deploy/charts/web-app/values.yaml` как:
  - `pnpm --filter "$APP_NAME" payload migrate`

**Почему не просто `payload migrate`:**
- образ собирается из монорепы и содержит несколько workspaces;
- `pnpm --filter` гарантирует запуск CLI в каталоге нужного app (там, где есть `payload.config.ts` и app‑зависимости).

#### 2.4.2.1. Bootstrap “с нуля” (пустая Postgres БД) — что обязательно

Если мы поднимаем `synestra.io` “с нуля” (БД пустая/кластер пересоздан), то корректный старт возможен только при соблюдении:
- в репозитории есть baseline‑миграция (`apps/synestra-io/src/migrations/**`),
- миграции реально попадают в runtime образ,
- при деплое выполняется `payload migrate` **до** старта приложения (у нас — hook Job).

Операционная инструкция и частые симптомы: `docs/runbooks/runbook-payload-bootstrap-from-zero.md`.

#### 2.4.3. PVC для media

**Файл:** `deploy/charts/web-app/templates/pvc-media.yaml` + монтирование в `templates/deployment.yaml`.

**Зачем:**
- Payload template `website` по умолчанию кладёт медиа в `public/media`.
- Без PVC медиа потеряются при пересоздании pod’а.

**Важно для `synestra-io`:**
- базовый chart mountPath по умолчанию: `/app/public/media`,
- но для `synestra-io` реальный путь: `/app/apps/synestra-io/public/media`,
- поэтому в values dev/prod добавлено переопределение (см. 2.5).

#### 2.4.4. CNPG Cluster для Postgres

**Файл:** `deploy/charts/web-app/templates/cnpg-cluster.yaml`

**Зачем:**
- этот шаблон позволяет (опционально) создавать CNPG Cluster в namespace приложения (режим **per-namespace DB**) для быстрых экспериментов/POC.

**Важно для `synestra.io`:**
- мы используем канон **platform-managed DB**: CNPG Cluster’ы живут в namespace `databases` и управляются `synestra-platform`,
- поэтому для `synestra.io` в values выставлено `postgres.enabled=false` (внутренний Postgres в namespaces сайтов отключён).

**Важная валидация values (Helm `required`):**
- если задан `postgres.bootstrap.secretName`, то обязаны быть заданы:
  - `postgres.bootstrap.database`
  - `postgres.bootstrap.owner`

Это предотвращает “тихие” ошибки, когда cluster создаётся без корректного initdb.

### 2.5. Values и ArgoCD Applications для `synestra-io`

**Dev values:** `deploy/env/dev/synestra-io.yaml`  
Содержит:
- `env.SYNESTRA_ENV=dev`,
- `env.NEXT_PUBLIC_SERVER_URL=https://dev.synestra.io`,
- `envFrom.secretRef=web-synestra-io-dev-env` (секрет создаётся в platform‑репозитории),
- `ingress.hosts[0].host=dev.synestra.io`,
- `persistence.media.mountPath=/app/apps/synestra-io/public/media`,
- `postgres.enabled=false` (БД не создаётся chart’ом, используем CNPG в `databases`).

**Prod values:** `deploy/env/prod/synestra-io.yaml`  
Аналогично, но:
- `SYNESTRA_ENV=prod`,
- `NEXT_PUBLIC_SERVER_URL=https://synestra.io`,
- `secretRef=web-synestra-io-prod-env`,
- `ingress.host=synestra.io`.

**Release values (dev/prod):**  
- `deploy/env/release-dev/synestra-io.yaml`  
- `deploy/env/release-prod/synestra-io.yaml`  
Содержит:
- `image.repository`,
- `image.tag` (это “релиз” в смысле `runbook-ci-dev-to-prod.md`),
- `image.pullSecrets` (`gitlab-regcred`).

**ArgoCD Application (dev):** `deploy/argocd/apps/dev/synestra-io.yaml`
- destination namespace: `web-synestra-io-dev`,
- `selfHeal: false` (на dev допускаем временные ручные/okteto‑патчи без мгновенного отката).

**ArgoCD Application (prod):** `deploy/argocd/apps/prod/synestra-io.yaml`
- destination namespace: `web-synestra-io-prod`,
- `selfHeal: true` (prod должен самовосстанавливаться к Git‑состоянию).

---

## 3) Что именно сделано в `synestra-platform` и зачем

Ниже описано только то, что реально существует в репозитории `synestra-platform` на текущий момент.

### 3.1. AppProject: `argocd/apps/app-projects.yaml` (`synestra-web`)

Добавлен AppProject `synestra-web`:
- `sourceRepos` ограничен `https://github.com/NeoGrAIph/web-core.git`,
- `destinations` ограничены namespaces `web-*`,
- `clusterResourceWhitelist` содержит только `Namespace`.

Зачем:
- не давать web‑приложениям деплоить что угодно в любые namespaces;
- изоляция и безопасность по умолчанию.

### 3.2. Root application: `argocd/apps/apps-web-core.yaml`

Добавлен root ArgoCD Application `apps-web-core`, который:
- смотрит в repo `web-core`, path `deploy/argocd/apps`,
- включает `directory.recurse: true`,
- и на первом шаге поднимает **только** `*/synestra-io.yaml` (`directory.include`).

Зачем:
- безопасный инкрементальный rollout: не деплоить сразу все будущие приложения из `web-core`.

### 3.3. Wildcard TLS и Traefik `TLSStore default`

Добавлены Certificates (namespace `ingress`):
- `infra/cert-manager/resources/certificate-wildcard-synestra-io.yaml` (для `synestra.io` и `*.synestra.io`)
- а также аналогичные wildcard’и для `*.synestra.tech`, `*.dev.synestra.tech`, `*.services.synestra.tech` (по файлам в той же директории)

Добавлен Traefik `TLSStore default`:
- `infra/ingress/traefik/resources/tlsstore-default.yaml`

Зачем:
- Helm chart `web-app` в `web-core` по умолчанию **не** задаёт `ingress.tls.secretName`;
- Kubernetes не разрешает ссылаться на TLS secret из другого namespace;
- поэтому TLS делается кластерно через Traefik TLSStore с wildcard‑сертификатами.

### 3.4. Устранение конфликтов доменов: `infra/webcore/payload/*`

В legacy приложении `infra-payload` (charts/payload) убраны домены:
- `synestra.io`
- `synestra.tech`

Файлы:
- `infra/webcore/payload/values.dev-hot.yaml`
- `infra/webcore/payload/values.prod.yaml`

Зачем:
- пока `infra-payload` держит host `synestra.io`, новый сайт не сможет получить этот домен (конфликт ingress rules по host).

### 3.5. Секреты и namespaces (SOPS): `secrets/web-synestra-io-*/` + `secrets/databases/`

Добавлены SOPS‑зашифрованные манифесты:

`secrets/web-synestra-io-dev/`
- `00-namespace.yaml` (Namespace `web-synestra-io-dev`)
- `gitlab-regcred.yaml` (pull secret для GitLab Registry)
- `web-synestra-io-dev-env.yaml` (Opaque secret с runtime env vars, в т.ч. `DATABASE_URI`)

`secrets/web-synestra-io-prod/`
- `00-namespace.yaml` (Namespace `web-synestra-io-prod`)
- `gitlab-regcred.yaml`
- `web-synestra-io-prod-env.yaml` (Opaque secret с runtime env vars, в т.ч. `DATABASE_URI`)

`secrets/databases/`
- `synestra-io-initdb-secret.yaml` — **общий** initdb secret (username/password) для bootstrap CNPG кластеров `synestra-io-cnpg` и `synestra-io-dev-cnpg` в namespace `databases`.


Зачем:
- `web-core` не хранит секреты и не должен их знать;
- приложения получают runtime‑конфиг через `envFrom.secretRef`, а секреты создаются GitOps‑ом в platform‑репозитории;
- БД для `synestra.io` управляется отдельными ArgoCD app’ами в `synestra-platform` (см. `argocd/apps/infra-synestra-io-db.yaml` и `argocd/apps/infra-synestra-io-dev-db.yaml`), поэтому **внутренний Postgres в namespaces сайтов отключён** (`deploy/env/{dev,prod}/synestra-io.yaml: postgres.enabled=false`).

---

## 4) Что должно получиться в кластере (целевая картина)

### 4.1. После синхронизации `synestra-platform` (ArgoCD)

Ожидаем:
- `apps-web-core` присутствует в ArgoCD и подтягивает `web-synestra-io-dev` и `web-synestra-io-prod` из `web-core`;
- в namespace `ingress` существуют:
  - wildcard Certificates (`wildcard-*-tls` secrets),
  - `TLSStore default`;
- `infra-payload` больше не объявляет ingress host `synestra.io`.

### 4.2. После синхронизации `apps-web-core`

Ожидаем, что для каждого из двух namespaces появятся ресурсы chart’а:
- `PVC` для media,
- `Job` миграций (hook),
- `Deployment` + `Service`,
- `Ingress` на нужный host.

А база данных разворачивается **отдельно** в namespace `databases`:
- dev: `synestra-io-dev-cnpg` (service `synestra-io-dev-cnpg-rw.databases.svc.cluster.local`)
- prod: `synestra-io-cnpg` (service `synestra-io-cnpg-rw.databases.svc.cluster.local`)

### 4.3. После этого снаружи

- `https://synestra.io` должен вести на новый `web-synestra-io-prod` сайт.
- `https://dev.synestra.io` должен вести на новый `web-synestra-io-dev` сайт.

### 4.4. Операционный чеклист: пересоздать `web-synestra-io-prod` “с нуля” (пустая БД)

Цель: если namespace/БД/volume были удалены, восстановить сайт **детерминированно** (без “ручной магии”), так чтобы:
- CNPG Postgres поднялся,
- выполнились миграции Payload,
- `/admin` открывался и позволял создать первого пользователя,
- (опционально) появился демо‑контент/фон из template через seed.

Важно (с учётом текущих настроек): ArgoCD Applications для `web-synestra-io-prod` и `web-synestra-io-dev` **не создают namespace автоматически** (`CreateNamespace=true` выключен). Поэтому namespace должен существовать до sync.

#### 4.4.1. Предпосылки в Git (что должно быть уже закоммичено)

- `apps/synestra-io/src/migrations/**` содержит baseline‑миграцию (иначе на пустой БД нечего применять).
- В `deploy/charts/web-app` включены migrations (по умолчанию да) и команда миграций использует `APP_NAME` + `payload migrate`.
- В `synestra-platform` существует runtime secret для `web-synestra-io-prod` с `DATABASE_URI`, `PAYLOAD_SECRET` (и опционально `CRON_SECRET`, `PREVIEW_SECRET`).

Подробный “канон bootstrap с нуля”: `docs/runbooks/runbook-payload-bootstrap-from-zero.md`.
Нормативный канон миграций (Postgres): `docs/architecture/payload-migrations.md`.

#### 4.4.2. Шаги восстановления (Kubernetes/ArgoCD)

1) Убедиться, что namespace существует:

```bash
kubectl get ns web-synestra-io-prod
```

Если отсутствует — создать (как временная ручная операция) или восстановить через GitOps‑манифесты в `synestra-platform` (предпочтительнее, если там заведён канон namespace lifecycle).

2) Убедиться, что runtime secret приложения существует в namespace (иначе миграции/приложение не стартуют):

```bash
kubectl -n web-synestra-io-prod get secret web-synestra-io-prod-env
kubectl -n web-synestra-io-prod get secret gitlab-regcred
```

3) Убедиться, что CNPG кластер prod существует и готов (namespace `databases`):

```bash
kubectl -n databases get cluster synestra-io-cnpg
kubectl -n databases get pods -l cnpg.io/cluster=synestra-io-cnpg
```

4) Запустить sync ArgoCD приложения `web-synestra-io-prod`:

```bash
argocd app sync web-synestra-io-prod
argocd app wait web-synestra-io-prod --health --timeout 600
```

5) Проверить, что миграции реально выполнились (hook Job `*-migrate`):

```bash
kubectl -n web-synestra-io-prod get job | grep -E "migrate|NAME" || true
kubectl -n web-synestra-io-prod logs job/web-synestra-io-prod-migrate
```

Ожидаем `Complete`. Если миграции не выполнились — `/admin` часто “не поднимается” или падает с ошибками вида `relation ... does not exist`.

6) Проверить приложение:

- `https://synestra.io/admin` — должна открываться страница логина.
- Первый пользователь создаётся на пустой БД через UI админки.

7) (Опционально) Добавить демо‑контент/фон из website template:

Website template кладёт часть демо‑контента через seed. Если главная “пустая” или нет фонового изображения — это ожидаемо, пока не выполнен seed.

Вариант A (через админку): кнопка seed в dashboard (если она оставлена в UI).  
Вариант B (endpoint): `POST /next/seed` (только если endpoint не отключён и вы понимаете последствия).

Важно для `stage/prod` в `web-core`:
- `POST /next/seed` дополнительно защищён `SEED_KEY` (см. `docs/architecture/payload-seeding.md`), чтобы нельзя было случайно выполнить деструктивный seed в проде.

Примечание: seed ≠ migrations. Seed — контент/медиа, migrations — схема БД.

8) (Опционально) Включить русский язык в Admin UI:

По умолчанию upstream шаблон показывает только English. Чтобы в `Payload Settings -> Language` появился русский, в конфиге приложения нужно задать `i18n.supportedLanguages` (см. `apps/synestra-io/src/payload.config.ts`). Это требует новой сборки образа и rollout через release values.

#### 4.4.3. Что делать, если нужно “полное с 0” (включая данные)

Если требуется именно “стереть всё и поднять заново”:
- удалить `CNPG Cluster` + PVC (в `databases`) для `synestra-io-cnpg`,
- удалить `PVC` media в `web-synestra-io-prod`,
- затем выполнить шаги 1–7 выше.

Если цель — dev как “клон prod” для разработки, используем CNPG backup/recovery flow:
- `docs/runbooks/runbook-db-refresh-dev-from-prod.md`.

---

## 5) Зафиксированные причины текущей проблемы (почему домены ведут не туда)

Этот раздел не про “что поменять дальше”, а про **факты**, которые объясняют текущее поведение, и напрямую связаны с уже существующими изменениями в Git.

### 5.1. `synestra.io` ведёт на неверный сайт

Факт (наблюдение): в кластере существует Ingress `webcore/payload`, который объявляет host `synestra.io`.

Почему так возможно:
- В `synestra-platform` домен убран из values (`infra/webcore/payload/values.*.yaml`), но приложение `infra-payload` в ArgoCD может быть **OutOfSync** и фактически ещё не применило изменения.

### 5.2. `dev.synestra.io` не отвечает (404)

Факт (наблюдение): если `web-synestra-io-dev` ещё не развернул Ingress, Traefik отдаёт 404 (нет matching router).

Почему `web-synestra-io-dev` мог не развернуться:
1) ранее ArgoCD не мог отрендерить chart из‑за файла `templates/README.md` (исправлено в `web-core` переносом в `_README.md`);
2) если hook Job миграций падает, ArgoCD не продолжает rollout остальных ресурсов (Deployment/Ingress).

---

## 6) Трассировка: какие коммиты это закрепляют

### `web-core`

- `998792c fix(synestra-io): unblock ArgoCD deploy and payload CLI`
  - перенос `deploy/charts/web-app/templates/README.md` → `_README.md`,
  - правки migration command,
  - ESM‑совместимость и конфиги,
  - mountPath для media,
  - pnpm override для `tsx` (через `package.json`).
- `e3261e4 chore(release): set synestra-io image tag`
  - обновление `deploy/env/release-dev/synestra-io.yaml` (dev релизный tag) + promotion в `deploy/env/release-prod/synestra-io.yaml`.

### `synestra-platform`

- `d89a74d feat(web): bootstrap synestra.io (dev+prod)`
  - AppProject `synestra-web`,
  - root app `apps-web-core`,
  - wildcard Certificates + Traefik TLSStore,
  - секреты для namespaces,
  - удаление конфликтующих доменов из `infra-payload`,
  - документация (wiki/runbooks).

---

## 7) Быстрый индекс файлов (для ревью человеком)

### В `web-core`

**Код приложения**
- `apps/synestra-io/package.json`
- `apps/synestra-io/src/payload.config.ts`
- `apps/synestra-io/src/env.ts`
- `apps/synestra-io/src/collections/Media.ts`
- `apps/synestra-io/redirects.js`
- `apps/synestra-io/postcss.config.js`

**Shared packages**
- `packages/env/src/index.ts`
- `packages/env/package.json`
- `packages/cms-core/src/index.ts`
- `packages/cms-core/src/collections/users.ts`
- `packages/cms-core/package.json`

**Docker / Turborepo**
- `docker/Dockerfile.turbo`
- `turbo.json`
- `package.json` (workspace + overrides)

**GitOps артефакты**
- `deploy/charts/web-app/**`
- `deploy/env/dev/synestra-io.yaml`
- `deploy/env/prod/synestra-io.yaml`
- `deploy/env/release-dev/synestra-io.yaml`
- `deploy/env/release-prod/synestra-io.yaml`
- `deploy/argocd/apps/dev/synestra-io.yaml`
- `deploy/argocd/apps/prod/synestra-io.yaml`

### В `synestra-platform`

**ArgoCD**
- `argocd/apps/app-projects.yaml` (AppProject `synestra-web`)
- `argocd/apps/apps-web-core.yaml` (root app)

**TLS**
- `infra/cert-manager/resources/certificate-wildcard-synestra-io.yaml`
- `infra/cert-manager/resources/certificate-wildcard-*.yaml` (прочие wildcard’и)
- `infra/ingress/traefik/resources/tlsstore-default.yaml`

**Legacy ingress**
- `infra/webcore/payload/values.dev-hot.yaml`
- `infra/webcore/payload/values.prod.yaml`

**Secrets (SOPS)**
- `secrets/web-synestra-io-dev/*`
- `secrets/web-synestra-io-prod/*`

---

## 8) Тематики для дальнейшего исследования (по официальной документации Okteto и Argo CD)

Ниже — список тематик, которые напрямую соответствуют уже выполненным шагам/артефактам (GitOps, dev+prod, TLS, секреты, migrations, монорепа).
Цель: по каждой теме сверить, как **официально** рекомендуют делать Okteto и Argo CD, и при необходимости скорректировать наш подход.

1) **Argo CD app-of-apps / “directory” applications**
   - root Application, `directory.recurse`, `directory.include`
   - стратегии безопасного инкрементального rollout (включать только выбранные apps)

2) **Argo CD AppProject и модели изоляции**
   - `sourceRepos`, `destinations` (namespace patterns), `clusterResourceWhitelist`
   - best practice по разграничению прав между platform и app repos

3) **Argo CD Sync Policy (automated/prune/selfHeal) для dev vs prod**
   - когда включать/выключать `selfHeal`
   - как сочетать hot‑dev (временные патчи) и GitOps‑строгость

4) **Argo CD hooks (Sync/PreSync) и миграции БД**
   - корректный паттерн миграций как hook Job
   - управление повторными запусками hook Job (immutability spec, hook-delete-policy)
   - порядок “migrations → deploy” и стратегии отката

5) **Okteto “dev” поверх существующего деплоя (ArgoCD-managed workloads)**
   - рекомендуемая модель: dev-окружения, dev‑контейнеры, sync, forward, dev commands
   - как Okteto патчит Deployment/Pod и как корректно возвращаться к baseline

6) **Сосуществование Argo CD и Okteto**
   - как избегать “гонок” между reconcile ArgoCD и изменениями Okteto
   - практики маркировки/ignoreDifferences (если применимо) vs отключение selfHeal на dev

7) **TLS и Ingress в GitOps: wildcard сертификаты и SNI-выбор**
   - best practice для Traefik + cert-manager + wildcard домены
   - подход “TLSStore default / без ingress.tls.secretName” и его ограничения

8) **Управление секретами в GitOps**
   - хранение секретов отдельно от app‑репозитория (SOPS/External Secrets/Vault и т.п.)
   - рекомендации Argo CD по генерации/подстановке секретов и multi-repo flows

9) **Namespace lifecycle: CreateNamespace=true vs управляемые Namespace манифесты**
   - что рекомендуют Argo CD и Okteto
   - риски “CreateNamespace” для прод‑окружений и альтернативы

10) **Database per namespace / operator-managed DB (CloudNativePG)**
   - паттерны bootstrap/initdb secrets
   - миграции и права доступа (db owner/app user), и как это “правильно” описывать в GitOps

11) **Монорепозитории и деплой одного приложения**
   - как официально рекомендуют собирать/публиковать образы из монореп (prune/partial checkouts)
   - минимизация контекста сборки, воспроизводимость и кеширование

12) **CI→GitOps релизный процесс (image tag как “релиз”)**
   - best practice Argo CD (Image Updater/commit-based tags) и Okteto (если задействуется)
   - канон promotion: `release-dev` → `release-prod` (два GitOps-коммита, prod получает только проверенный tag)
