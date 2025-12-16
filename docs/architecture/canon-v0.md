# Канон `web-core` v0 (временный): Payload 3 + Next.js 15 + Argo CD + Okteto

Дата актуальности: **2025-12-15**.  
Статус: **черновик / временная версия**.

Этот документ фиксирует **временный базовый канон** разработки и деплоя сайтов/веб‑приложений в монорепозитории `web-core`.

Важно:

- Это **не финальная** версия. Её необходимо корректировать по мере изучения и принятия официальных рекомендаций:
  - Argo CD
  - Okteto
  - Payload CMS 3
  - а также результатов исследования официальных Payload templates и best‑practices для нашего стека.
- На текущем этапе этот канон основан на **фактическом опыте развёртывания** `synestra.io`/`dev.synestra.io` и текущих артефактах репозитория.

Связанные “источники” и runbooks:

- Архитектура и границы ответственности: `docs/architecture/architecture.md`
- Структура репозитория: `docs/architecture/repo-structure.md`
- Контракт env vars: `docs/architecture/env-contract.md`
- Runbooks (операционные): `docs/runbooks/README.md`
- Официальные конспекты: `docs/research/{payload,okteto,argocd}/*-official-notes.md`

---

## 1) Зачем существует `web-core`

`web-core` — монорепозиторий, который хранит:

- код сайтов/веб‑приложений на **Payload CMS 3** и **Next.js 15** (`apps/*`);
- общий переиспользуемый код (`packages/*`);
- GitOps‑артефакты деплоя приложений (Helm chart + values + ArgoCD Applications) (`deploy/*`);
- reference‑снапшоты официальных шаблонов/примеров (`upstream/*`, **не деплоим напрямую**).

Инфраструктурная часть (кластер, ArgoCD, cert-manager, ingress, Okteto, SOPS‑секреты и пр.) живёт в отдельном репозитории `synestra-platform`.

---

## 2) Непересматриваемые правила (на данном этапе)

### 2.1. Секреты

- **Никаких plaintext‑секретов** в `web-core`.
- В `web-core` допустимы только:
  - `.env.example` как документация,
  - ссылки на Kubernetes Secret (имена/ключи) в values (`envFrom.secretRef`).
- Секреты создаются и шифруются в `synestra-platform` (SOPS/age) и применяются GitOps‑ом.

### 2.2. Изоляция

- **Один сайт/деплой = один namespace + одна БД**.
- Платформа даёт операторов/CRD, продуктовый репозиторий описывает ресурсы “внутри namespace сайта”.

### 2.3. Версии (закреплены и меняются осознанно)

- Payload: `3.68.3`
- Next.js: `15.4.9`

### 2.4. `upstream/` — только референс

- `upstream/**` не предназначен для деплоя.
- Любой новый сайт начинается с копирования шаблона в `apps/*` и адаптации под наш канон.

---

## 3) Структура монорепозитория

- `apps/*` — deployable приложения (обычно Next.js + интегрированный Payload).
- `packages/*` — переиспользуемые модули (cms-core, env, ui и т.п.).
- `deploy/*` — GitOps (Helm chart’ы, values по окружениям, ArgoCD Applications).
- `docs/*` — документация и runbooks.

Нормативное описание структуры и маппинга на deployments: `docs/architecture/repo-structure.md`.

---

## 4) Окружения: `dev → stage → prod` (но стартуем с dev+prod)

### 4.1. Разделяем “Next.js NODE_ENV” и “наше окружение”

В Kubernetes `NODE_ENV` почти всегда `production`, поэтому для логики окружений используем:

- `SYNESTRA_ENV=dev|stage|prod`

Контракт и правила валидации: `docs/architecture/env-contract.md`.

### 4.2. Доменная схема (база)

На старте допустима схема (может корректироваться):

- prod: `sitename.synestra.io`
- dev: `sitename.dev.synestra.tech` (единый паттерн для всех сайтов, кроме корневых доменов)

Исключение (корневые домены):
- для сайтов на корневом домене вида `synestra.io` dev‑домен может быть `dev.synestra.io` (см. `docs/runbooks/runbook-first-site-synestra-io.md`).

Фактические домены задаются в `deploy/env/{dev,prod}/*.yaml` (ingress hosts).

---

## 5) GitOps: как деплоим через Argo CD

### 5.1. Шаблонная единица деплоя

Для каждого сайта/приложения мы создаём:

- values `deploy/env/dev/<app>.yaml` и `deploy/env/prod/<app>.yaml` (не‑секреты + ссылки на Secret’ы);
- release‑слои:
  - `deploy/env/release-dev/<app>.yaml` (dev release: image repo + immutable tag),
  - `deploy/env/release-prod/<app>.yaml` (prod release: image repo + immutable tag);
- ArgoCD Applications `deploy/argocd/apps/dev/<app>.yaml` и `deploy/argocd/apps/prod/<app>.yaml`.

### 5.2. Promotion: dev → prod через раздельные release‑слои

На старте используем канон “dev release → проверка → promotion в prod”:

- CI обновляет `deploy/env/release-dev/<app>.yaml:image.tag`
- ArgoCD выкатывает **dev**
- после проверки CI обновляет `deploy/env/release-prod/<app>.yaml:image.tag` тем же tag
- ArgoCD выкатывает **prod**

Runbook: `docs/runbooks/runbook-ci-dev-to-prod.md`.
Нормативный канон: `docs/architecture/release-promotion.md`.

### 5.3. Drift‑политика (dev vs prod)

Базовое правило (актуально для Okteto hot‑dev):

- dev: `selfHeal: false` (ArgoCD не должен немедленно откатывать изменения, которые временно вносит Okteto)
- prod: `selfHeal: true` (GitOps‑строго)

Runbook: `docs/runbooks/runbook-dev-prod-flow.md`.

---

## 6) Payload + Postgres: миграции (канон v0)

Ключевая идея: **в k8s/production‑условиях Postgres требует миграций**. Мы не полагаемся на “автосинк схемы” при деплое.

Нормативный документ по миграциям (Postgres): `docs/architecture/payload-migrations.md`.

### 6.1. Что считаем правильным процессом для нового сайта

1. Адаптировали template под Postgres (`@payloadcms/db-postgres`) и зафиксировали `migrationDir`.
2. Сгенерировали **baseline** миграцию и закоммитили её (`src/migrations/*`).
3. В кластере перед стартом приложения запускаем `payload migrate`.

Практическое следствие: если БД чистая, приложение сначала создаёт таблицы, затем запускается, а не падает с `relation ... does not exist`.

Операционная инструкция “как поднять с нуля” (пустая Postgres БД): `docs/runbooks/runbook-payload-bootstrap-from-zero.md`.

### 6.2. Где запускаем миграции

Для GitOps‑деплоя используем migrations как **Job** (в Helm chart `web-app`) и упорядочиваем ресурсы “волнами”:

- сначала БД (CNPG Cluster),
- затем migrations Job,
- затем Deployment/Service/Ingress.

Это уже реализовано в нашем chart’е и является “каноном” до появления альтернативы по результатам дальнейшего исследования.

### 6.3. Важно: ожидание готовности БД

Миграции должны ждать готовности Postgres (иначе Job падает по backoff). Для этого используем “wait-for-postgres” перед запуском `payload migrate`.

### 6.4. Seed ≠ migrations

- `seed` создаёт контент и медиа (например hero‑картинку главной страницы).
- `migrate` меняет схему БД.
- Seed обычно **dev‑операция**, её нельзя автоматически выполнять в prod.

На сайте `synestra.io` фон на главной появится только после выполнения seed (через админку / endpoint).

---

## 7) Okteto “поверх” Argo CD (канон v0)

Цель: dev‑режим **поверх** GitOps‑деплоя без hostPath и без сборки “внутри Pod”.

Базовый workflow:

1. ArgoCD развернул dev‑окружение как baseline (стабильный образ).
2. Разработчик/агент запускает Okteto dev‑сессию в namespace dev‑сайта:
   - синхронизируется код,
   - запускается dev‑сервер (`pnpm dev` / `next dev`),
   - изменения видны на dev‑домене.
3. По завершении:
   - изменения фиксируются в Git,
   - CI собирает новый образ и обновляет `deploy/env/release-dev/<app>.yaml`,
   - ArgoCD выкатывает в dev,
   - после проверки CI делает promotion в `deploy/env/release-prod/<app>.yaml`,
   - ArgoCD выкатывает в prod.

Сброс dev “как в prod” = завершить Okteto сессию + `argocd app sync` dev‑Application.

Runbook: `docs/runbooks/runbook-okteto-dev.md`.

---

## 8) Как добавляем новый сайт из Payload template (канон v0)

Правило: сначала запускаем сайт “как template” с минимальными правками, затем выносим общее.

Минимальный чеклист:

- скопировать upstream template в `apps/<app>`;
- привести `package.json` под workspace (`@synestra/<app>`) и скрипты;
- подключить shared ESLint/TS config (через `packages/*`);
- адаптировать `payload.config.ts` под Postgres + migrations;
- оформить `.env.example` (без секретов);
- создать baseline миграцию и закоммитить;
- добавить GitOps values и ArgoCD Application manifests.

Runbook: `docs/runbooks/runbook-add-app-from-payload-template.md`.

---

## 9) Shared‑код и “конструктор” компонентов (канон v0)

Цель — унификация без потери скорости интеграции новых шаблонов:

- **не** пытаемся “обобщить всё сразу”;
- выносим в `packages/*` только то, что:
  - используется минимум в 2 apps, или
  - очевидно будет переиспользоваться, и
  - имеет понятный стабильный API.

Рекомендуемое направление декомпозиции:

- `packages/ui` — UI primitives / дизайн‑токены (дальше решим Tailwind‑стратегию)
- `packages/cms-core` — общие коллекции/access/auth patterns
- `packages/cms-blocks` — общие blocks/sections
- `packages/env` — контракт и runtime‑валидация env vars

---

## 10) Требования к “удобству для LLM‑агентов” (канон v0)

Мы предполагаем, что значительную часть работы будет делать ассистент, поэтому:

- Любая операция должна иметь “бумажный след” в `docs/runbooks/*` (или ссылку на существующий runbook).
- Предпочитаем **декларативные** изменения (values/YAML/config) вместо “ручных шагов в кластере”.
- Для типовых проблем должны существовать smoke‑проверки (минимум: `/`, `/admin`, `/admin/login`).
- Все значения/пути должны быть воспроизводимыми и очевидными (однозначные имена apps, namespaces, values files).

---

## 11) Что точно НЕ финализировано (зоны пересмотра)

При дальнейшем исследовании мы ожидаем уточнить/пересмотреть:

1. ArgoCD drift‑стратегию dev (selfHeal vs ignoreDifferences/managedFields и т.п.).
2. Канонический способ запуска миграций (Job vs initContainer vs prodMigrations) и влияние на rollout/rollback.
3. Полный канон Okteto (namespaces, build service/buildkit, file sync, previews, registry).
4. Стандарты структуры/генераторы (Turborepo generators) для быстрого добавления сайтов и типовых “блоков‑конструктора”.
5. Tailwind стратегия (website template vs ecommerce template: разный major).
6. Stage‑окружение и промоут релизов (когда появится потребность в gate между dev/prod).
