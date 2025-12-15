# Аудит текущего состояния `web-core`

Дата: **2025-12-14**.

Цель документа — зафиксировать текущее состояние репозитория (структура, tooling, GitOps‑скелет) и определить “разрывы” относительно:

- курса `docs/course/production-monorepostwith-turborepo/**`;
- целевой архитектуры `docs/architecture/**`;
- ограничений проекта: self-host/k3s, ArgoCD/Okteto в `synestra-platform`, dev-first без секретов в репо.

---

## 1) Короткое резюме

Репозиторий находится в стадии **проектирования/скелета**:

- уже есть базовая monorepo‑структура (`apps/*`, `packages/*`, `turbo.json`, pnpm workspaces);
- уже есть GitOps‑скелет (`deploy/charts/web-app`, `deploy/env/dev/*`, `deploy/argocd/apps/dev/*`) с placeholder’ами;
- документация активная и “нормативная” (архитектура, runbooks, исследования Payload templates и курса).

---

## 2) Структура репозитория (факт)

Ключевые директории:

- `apps/` — deployable Next.js apps:
  - `apps/corporate-website` (порт 3000)
  - `apps/ecommerce-store` (порт 3001)
  - `apps/experiments` (порт 3002)
  - `apps/landings` (placeholder)
  - `apps/saas-webapp` (placeholder)
- `packages/` — shared packages:
  - `@synestra/ui`, `@synestra/utils`
  - `@synestra/cms-core`, `@synestra/cms-blocks`, `@synestra/cms-ecommerce`
  - `@synestra/eslint-config`, `@synestra/typescript-config`
  - `@synestra/payload-plugin-multisite`
- `deploy/` — GitOps артефакты:
  - `deploy/charts/web-app` (Deployment/Service/Ingress/PVC/Job migrations + CNPG Cluster template)
  - `deploy/env/dev/*.yaml` (values; non-secret only; placeholder image/hosts)
  - `deploy/argocd/apps/dev/*.yaml` (Application; placeholder repoURL)
- `upstream/` — снапшоты официальных Payload templates (reference only) + provenance.
- `docs/` — архитектура/исследования/runbooks + сохранённый курс.

Схема верхнего уровня (по факту):

```
apps/        # Next.js+Payload apps (deployable units)
packages/    # shared packages (ui/utils/cms/*/configs/plugins)
deploy/      # GitOps артефакты (Helm/values/ArgoCD Applications)
docs/        # архитектура/исследования/runbooks/курс
upstream/    # снапшоты внешних референсов (Payload templates)
turbo/       # заготовки под generators и связанные инструменты
```

---

## 3) Tooling (факт)

- pnpm workspaces (`pnpm-workspace.yaml`): `apps/*`, `packages/*`, `packages/plugins/*`.
- Turborepo (`turbo.json`):
  - задачи `dev/build/lint/test`;
  - `build.outputs`: `.next/**` (без `.next/cache/**`) + `dist/**`;
  - `globalDependencies`: `**/.env.*local`.
- Root scripts: `pnpm dev|build|lint|test` → `turbo run ...`.
- Shared ESLint config: `packages/eslint-config` (flat config через `FlatCompat`), подключён в `apps/*/eslint.config.mjs`.
- Shared TypeScript configs: `packages/typescript-config/*`; apps/packages расширяют их через `extends` и держат `@synestra/typescript-config` в `devDependencies` (иначе TypeScript не сможет резолвить файл конфигурации через workspace).
- Next.js apps уже настроены на работу со workspace‑пакетами через `transpilePackages` в `apps/*/next.config.mjs` (важно для DX и “hot reload across packages”).

---

## 4) GitOps (факт)

Есть рабочий “скелет” для dev‑деплоя:

- ArgoCD Applications создают namespace и деплоят Helm chart `deploy/charts/web-app`.
- Values dev лежат в `deploy/env/dev/*` и содержат ссылки на Secret’ы (имя Secret) без секретных значений.
- В chart есть Job миграций Payload как ArgoCD hook (Sync + sync-wave), и PVC для `public/media`.

Текущее ограничение: в манифестах присутствуют placeholder’ы (`REPLACE_ME_*`), то есть это пока **шаблон/контракт**, а не подключённый прод/дев‑поток.

---

## 5) Разрывы (gaps) относительно курса и production‑DX

### Quick wins (низкий риск)
- Deliverables по курсу заведены (`docs/course/.../recommendations.md`, `docs/audit/current-state.md`, `docs/plan/alignment-plan.md`) — поддерживать их актуальными по мере внедрения изменений.
- Не описан self-host remote cache (контракт/варианты/как подключать из CI) — нужно документировать.
- В сохранённом курсе нет отдельной секции про env vars (она анонсирована, но отсутствует) — это нужно закрыть собственным стандартом для `web-core`.

### Structural changes (средний риск)
- Нет стандартизированного механизма “добавить новый app из Payload template” (процесс описан частично в research/runbooks, но не как единый чеклист/шаблон).

### Runtime / production patterns (средний/высокий риск)
- Не закреплён единый production‑паттерн: storage для uploads (PVC vs S3), preview/jobs endpoints, миграции/seed, политики логирования querystring (preview secret).

---

## 6) Следующий шаг

См. `docs/plan/alignment-plan.md` — план приведения к рекомендациям курса и production‑паттернам для self-host/k3s.
