# web-core

`web-core` — продуктовый монорепозиторий Synestra для разработки и сопровождения группы сайтов/веб‑приложений (corporate, e‑commerce, SaaS web, лендинги и др.) на стеке **Payload CMS + Next.js**, а также для хранения **GitOps‑артефактов деплоя** этих приложений (шаблоны/values/манифесты), которые применяются через Argo CD.

Репозиторий находится в стадии **проектирования и подготовки к разработке**: структура и правила формируются **на основании исследований best practices** под целевую задачу и **анализа официальных шаблонов и документации Payload**.

## Зачем этот репозиторий

- Быстро и качественно разрабатывать несколько сайтов в одном репозитории, переиспользуя общие части (CMS‑модули, блоки, UI, утилиты, конфиги).
- Деплоить сайты **независимо** друг от друга (снижаем риск “всё упало из‑за одного релиза”).
- Поддерживать понятный GitOps‑контракт для Kubernetes/ArgoCD: приложение/values — здесь, кластерная инфраструктура и секреты — в отдельном репозитории.

## Границы ответственности

- `~/synestra-platform` — **платформенный репозиторий** (Kubernetes‑инфраструктура и эксплуатация):
  - путь: `~/synestra-platform`;
  - назначение: управление кластером и общими компонентами платформы;
  - что там есть (типично):
    - Argo CD и “app-of-apps”/корневые Applications для подключения прикладных репозиториев;
    - ingress/cert-manager/DNS‑интеграции и прочие cluster‑level компоненты;
    - операторы (например CloudNativePG), observability/логирование/мониторинг;
    - централизованные базы данных/сервисы данных платформы (если используются);
    - централизованные секреты (SOPS/age и т.п.);
    - CI/CD (GitLab) для сборки и публикации контейнерных образов, которые затем потребляются деплоями.
- `~/repo/web-core` — **код приложений**, общие библиотеки/пакеты, не‑секретные параметры, GitOps‑шаблоны деплоя и документация.

Принцип: **в `web-core` не коммитим plaintext‑секреты**. Здесь допустимы только ссылки на Secret names/keys и `.env.example`.

## Базовые принципы архитектуры

- **Несколько deployments** из одной монорепы (как минимум: corporate / shop / saas / landings).
- Изоляция на deployment:
  - отдельный `namespace`;
  - отдельная БД (стратегия: CloudNativePG, кластер на namespace).
- Окружения проектируем как `dev → stage → prod`, но на старте разворачиваем и показываем результат в `dev`.
- Hot‑разработка в Kubernetes: выбран подход через **Okteto** (конкретный режим интеграции фиксируем по мере внедрения в `synestra-platform`).

## Зафиксированный стек и версии

- Payload CMS: `3.68.3`
- Next.js: `15.4.9`
- Node.js: `>= 22` (см. `package.json`)
- Turborepo (turbo): `2.6.3` (см. `package.json`)

## Ключевые решения (актуально)

- **Монорепа**: `apps/*` (deployable apps) + `packages/*` (shared code/configs), pnpm workspaces + Turborepo как координатор задач (`pnpm dev/build/lint/test`).
- **Независимый деплой**: один deployment = один ArgoCD `Application`; инфраструктура/секреты/CI в `~/synestra-platform`, а `web-core` хранит код и GitOps‑артефакты (без секретов).
- **Секреты**: plaintext‑секреты не коммитим; используем `.env.example` и ссылки на Kubernetes Secret names/keys.
- **Shared configs**:
  - ESLint: `packages/eslint-config` (flat config), подключается в `apps/*/eslint.config.mjs`;
  - TypeScript: `packages/typescript-config` (configs `base.json`, `nextjs.json`), используется через `extends`.
    Важно: потребители должны иметь `@synestra/typescript-config` в `devDependencies` (обычно `"workspace:*"`), иначе TypeScript не сможет резолвить `extends`.
- **Shared UI**: `packages/ui` — общий UI‑слой; поддерживаем импорт из корня и subpath exports (`@synestra/ui/button`, `@synestra/ui/card`).
- **Тестовый контур**: базовые UI‑тесты на Vitest в `packages/ui`; запускаются через `pnpm test` (Turborepo).
- **CI (референс)**: в репо есть пример workflow `.github/workflows/ci.yml` (основной CI всё равно может быть в `synestra-platform`).

## Документация

Начни с индекса: `docs/README.md`.

## Структура репозитория (кратко)

```text
apps/        — deployable приложения (Next.js + Payload)
packages/    — общий код и конфиги (UI, ESLint, TypeScript и др.)
deploy/      — GitOps для ArgoCD/Helm (charts, values по env, Applications)
docs/        — архитектура, исследования, runbooks, материалы курса
upstream/    — референс‑снапшоты (например, официальные шаблоны Payload)
.github/     — референс CI (в проде может жить в synestra-platform)
turbo/       — Turborepo tooling (генераторы/утилиты, если используются)
.vscode/     — настройки рабочей области (опционально)
```

Ключевые документы:
- Архитектура и взаимодействие репозиториев: `docs/architecture/architecture.md`
- Целевая структура репозитория: `docs/architecture/repo-structure.md`
- Контракт env vars + валидация (dev→stage→prod): `docs/architecture/env-contract.md`
- Конспект исследований и критерии: `docs/research/research.md`
- Исследование официальных шаблонов Payload: `docs/research/templates-research.md`
- Runbooks (dev‑процессы, первый dev‑деплой): `docs/runbooks/README.md`
- GitOps деплой: `deploy/README.md`

## Локальная разработка (быстрый старт)

1) Установить зависимости:

```bash
pnpm install
```

2) Выбрать приложение и подготовить env:
- см. `.env.example` внутри нужного `apps/*` (например `apps/corporate-website/.env.example`).

3) Запустить dev‑сервер (пример для corporate):

```bash
pnpm --filter @synestra/corporate-website dev
```

4) Быстрые проверки (перед пушем):

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Примечание: для добавления нового приложения из official Payload template используйте runbook `docs/runbooks/runbook-add-app-from-payload-template.md`.

## Turborepo (turbo)

В корне репозитория используется Turborepo как координатор задач (см. `turbo.json` и root scripts в `package.json`).

- Запуск задач по монорепе: `pnpm dev|build|lint|typecheck|test`
- Для локальной разработки обычно удобнее запускать конкретный app через `pnpm --filter <package> dev`
- Для сборки контейнеров (CI/CD) используется `turbo prune --docker` — см. скрипты:
  - `pnpm prune:corp`
  - `pnpm prune:shop`
  - `pnpm prune:exp`

## GitOps / Argo CD (обзор)

В `web-core` находятся:
- базовый шаблон деплоя (Helm chart): `deploy/charts/web-app`;
- значения per‑env/per‑deployment: `deploy/env/**`;
- ArgoCD Applications (per‑env): `deploy/argocd/apps/**`.

Реальные секреты (DB bootstrap/app user, Payload secret, интеграции и т.п.) создаются в GitLab репозитории `synestra-platform`.

## Официальные шаблоны Payload (референсы)

Снапшоты официальных шаблонов Payload храним в `upstream/` как **референс** для анализа и переноса паттернов (не для прямого деплоя):
- provenance: `upstream/payload/README.md`
- шаблоны: `upstream/payload/templates/*`
- результаты анализа: `docs/research/templates/*`
