# CI/CD контракт (self-host): `web-core` ↔ `synestra-platform`

Дата актуальности: **2025-12-18**.  
Статус: **канон v0.1** (дополняется по мере стабилизации CI, Argo CD и политик promotion).

Цель: зафиксировать **единый, проверяемый** контракт “как изменения из `web-core` попадают в Kubernetes”, при разделении ответственности:

- `web-core` = **код + GitOps значения/манифесты** (без секретов)
- `synestra-platform` = **секреты + кластер + CI, который строит образы**

Этот документ не заменяет:
- канон promotion слоёв: `docs/architecture/release-promotion.md`
- runbooks: `docs/runbooks/runbook-ci-dev-to-prod.md`, `docs/runbooks/runbook-synestra-io-release-promotion.md`

---

## 1) Границы ответственности (source of truth)

### 1.1 `web-core` (продукт/сайты)

Хранит истину про:
- **как деплоить** (Helm chart + values‑слои)
- **какой образ** деплоить (immutable `image.tag` в release‑слоях)
- **какие Secret’ы подключать** (только *имена/refs*, без значений)

Запрещено:
- коммитить plaintext‑секреты (в т.ч. токены registry, пароли БД, S3 ключи).

### 1.2 `synestra-platform` (платформа)

Хранит истину про:
- кластерную инфраструктуру (Argo CD, ingress/TLS, CNPG operator, Okteto, etc.)
- SOPS‑секреты и namespaces
- CI, который:
  - собирает и пушит Docker images,
  - (опционально) делает promotion коммитами в `web-core`.

---

## 2) Что считается релизом (immutable)

**Release** в нашем контексте = **immutable container image tag**, который однозначно соответствует состоянию кода `web-core`.

Канон values‑слоёв:
- dev release: `deploy/env/release-dev/<app>.yaml` → `image.repository`, `image.tag`
- prod release: `deploy/env/release-prod/<app>.yaml` → `image.repository`, `image.tag`

Почему именно так:
- promotion = простое изменение одного поля (`image.tag`)
- Argo CD хорошо работает, когда “что разворачивать” закреплено в Git

---

## 3) Минимальный self-host релизный поток (prod-first)

Ниже — “как должно быть”, независимо от конкретного CI (GitLab/GitHub).

### 3.1 Сборка образа (в `synestra-platform`)

Вариант A (каноничный для monorepo): сборка из pruned workspace (`turbo prune`) + Docker build.  
Вариант B (текущая реализация для `web-synestra-io`): platform‑pipeline указывает, какой commit `web-core` взять, и собирает образ.

Обязательные свойства результата:
- образ опубликован в registry
- tag **immutable** (никогда не перезаписывается)
- tag **сопоставим** с commit’ом `web-core` (например, содержит SHA префикс)

Практический нюанс (важно для стабильности pipeline):
- если platform‑pipeline принимает ref коммита `web-core`, используем **полный 40‑символьный SHA**, а не короткий.

### 3.2 Выкат в prod (в `web-core`)

В `web-core` меняется только release‑слой:
- `deploy/env/release-prod/<app>.yaml:image.tag = <new-tag>`

Далее:
- Argo CD делает sync/rollout автоматически (если включён autosync)
- миграции/хуки выполняются в рамках chart (см. `docs/architecture/payload-migrations.md`)

### 3.3 Definition of Done (DoD) релиза в prod

Релиз считается завершённым, когда выполнено всё:
1) новый tag зафиксирован в Git (`web-core`)
2) Argo CD application в `Healthy` + `Synced`
3) (если есть) миграции прошли успешно
4) smoke‑проверка по домену (`/`, `/admin`) не возвращает 5xx

---

## 4) Promotion dev → prod (если используем dev)

Канон: сначала dev release, затем prod release **тем же tag**:
- `deploy/env/release-dev/<app>.yaml:image.tag = X`
- validate dev
- `deploy/env/release-prod/<app>.yaml:image.tag = X`

Подробнее: `docs/architecture/release-promotion.md` и `docs/runbooks/runbook-ci-dev-to-prod.md`.

---

## 5) Что именно “триггерит” деплой (правило v0)

Цель правила: избежать “пересобираем всё всегда”, но и не пропустить зависимости.

### 5.1 Триггер на сборку image (CI в `synestra-platform`)

Собирать новый образ для app нужно, если изменилось хоть что-то из:
- `apps/<app>/**`
- любой shared package, от которого app реально зависит (обычно `packages/**`)
- общие build/tooling файлы, влияющие на сборку (например: `turbo.json`, root `package.json`, lockfile)

Не считать триггером на сборку (по умолчанию):
- `docs/**` (кроме случаев, когда docs включены в runtime image)

Рекомендуемый способ формализовать правило (когда будем автоматизировать):
- использовать `turbo build --dry-run` / git-based filtering, чтобы определить affected packages.

### 5.2 Триггер на rollout (ArgoCD)

Rollout происходит при изменении любого из:
- release‑слоя (`image.tag`)
- env‑слоя (ingress/resources/feature flags/secret refs)

---

## 6) Откат (rollback) в prod

Откат делаем GitOps’ом:
- вернуть `deploy/env/release-prod/<app>.yaml:image.tag` на предыдущий tag (новым коммитом)

Важно про Payload/Postgres:
- миграции обычно считаем forward‑only: откат кода ≠ откат схемы.
- поэтому “ломающие” миграции требуют отдельного плана совместимости/отката.

---

## 7) Пример: `synestra-io` (как реализовано сейчас)

### 7.1 Где в `web-core` меняется prod release

- `deploy/env/release-prod/synestra-io.yaml` → `image.repository`, `image.tag`

### 7.2 Где в `synestra-platform` задаётся, какой `web-core` собирать (если используем platform build)

Для образа `web-synestra-io` (пример текущего подхода):
- `docker/web-synestra-io/WEB_CORE_REF` — полный SHA коммита `web-core`
- `docker/web-synestra-io/VERSION` — tag образа (immutable)

### 7.3 Минимальная проверка статуса сборки (CI)

После push в platform repo:
- `glab ci status -l`

Примечание: команды и точные джобы зависят от настроек `synestra-platform`.

