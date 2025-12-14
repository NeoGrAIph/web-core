# AGENTS.md
Этот документ не заменяет, а дополняет AGENTS.md внутри корня репозитория для корректной работы по изучению материалов курса и реализации полезных знаний из него в данном репозитории.
## Цель
Вы являетесь агентом-ассистентом (DevOps + Web) для репозитория который в данный момент формируется, для обслуживания инфраструктуры разработки и размещения группы сайтов на базе **Payload CMS v3.68.3** и **Next.js v15.4.9**.

Ваша задача:
1) Изучить файлы в каталоге `docs/architecture` и проанализируй  **текущий репозиторий**.
2) Проанализировать **сохраненный курс** (далее: “Курс”) и выявить в нём полезные/проверяемые рекомендации.
3) Привести репозиторий к состоянию, максимально соответствующему рекомендациям Курса, при этом:
   - если Курс опирается на Vercel-специфику, переносить идеи на **self-host/Kubernetes (k3s)** аналоги.

## Область работ
- Best practices Next.js (App Router, data fetching, кеширование/ISR, image optimization, env/runtime).
- Best practices Payload (config, коллекции, migrations, seed, upload/storage adapters).
- DX: локальная разработка, hot reload, линт/формат, тесты.
- CI/CD (только OSS): GitHub Actions/Forgejo Actions/Drone, контейнеризация, registry, deployment manifests/Helm/Kustomize.
- Документация и эксплуатационные runbooks.

## Артефакты входа
### Курс и другие полезные материалы
Курс доступен в репозитории по следующему пути `docs/course/production-monorepostwith-turborepo/`
- Предварительное исследование курса описано в `docs/research/research.md`
- Bндекс по иследованиям  официальных шаблонов `docs/research/templates-research.md`


### Репозиторий
Обязательные файлы для ориентации агента:
- `docs/course/production-monorepostwith-turborepo/README.md `
- `README.md`
- `package.json`/`pnpm-workspace.yaml`/`turbo.json`
- `deploy/*` (Kubernetes/Helm/Kustomize/GitOps)
- `docs/research/research.md` (предварительное исследование курса)
- `docs/research/templates-research.md` (индекс по иследованиям официальных шаблонов)

## Ограничения и принципы
1) Изменения оформлять небольшими логическими шагами:
   - серия коммитов/PR-готовых изменений,
   - каждый шаг собирается и проходит проверки.
2) Предпочтение стандартам:
   - Node LTS, pnpm, TypeScript, ESLint (flat‑config), Prettier, EditorConfig.
3) Для Kubernetes: избегать `hostPath` для dev. Если требуется hot-dev в k8s, ориентироваться на sync/live-update подходы (Okteto) работающие в репозитории платформы, но не добавлять проприетарные агенты.

## Как работать (алгоритм)
### Шаг 1. Инвентаризация Курса
1) Пройдите последовательно по материалам Курса в `docs/course/production-monorepostwith-turborepo/*` и после изучения каждого материала проанализируйте соответствует ли текущий репозиторий и материалы в `docs/architecture` этому материалу и составьте таблицу рекомендаций:
   - `Recommendation`
   - `Why`
   - `How to verify`
   - `Repo impact area` (структура, DX, CI, runtime)
   - `Vercel-only?` (yes/no)
   - `OSS self-host mapping` (если Vercel-only)

Результат фиксируйте в `docs/course/production-monorepostwith-turborepo/recommendations.md`.

### Шаг 2. Аудит репозитория
1) Зафиксируйте текущую структуру и ключевые команды:
   - install, dev, build, test, lint, typecheck
2) Определите “профиль”:
   - один сайт или много сайтов?
   - один Payload на много сайтов (multi-tenant) или отдельный Payload на сайт?
3) Определите разрывы с рекомендациями Курса.

Результат сохранить в `docs/audit/current-state.md`.

### Шаг 3. План приведения к рекомендациям
1) Сформируйте backlog “изменение → эффект → риск → миграция”.
2) Разбейте на этапы:
   - quick wins (меньше риска)
   - structural changes (монорепо/пакеты/общие модули)
   - runtime changes (кеш/ISR, storage, env)
   - CI/CD + k8s deployment

Результат сохранить в `docs/plan/alignment-plan.md`.

### Шаг 4. Внедрение изменений
Вносите изменения строго с проверяемым эффектом:
- каждый этап должен завершаться обновлением документации и команд в README;
- добавляйте тесты/проверки до изменения поведения, где возможно.

## Технические стандарты репозитория (ожидаемое целевое состояние)
### Node/Package manager
- `pnpm` как основной менеджер (фиксировать версию в `packageManager`).

### Payload
- migrations: включены и документированы
- seed: опционально, но воспроизводимо
- использование HMR на dev
### Next.js self-hosting совместимость
- отдельная секция в `README.md`:
  - особенности кеширования/ISR в многоподовой среде
  - image optimization (reverse proxy, headers)
  - env: build-time vs runtime

## CI/CD (OSS)
Цели пайплайна:
- PR checks: lint + typecheck + unit tests + build
- container build/push (в ваш registry)
- deployment manifests/Helm/Kustomize в `infra/`
- опционально preview environments в k8s (namespace per branch) через GitOps (Argo CD) или CI job

## Формат результата (обязательные deliverables)
После вашей работы в репозитории должны появиться/обновиться:
1) `docs/course/production-monorepostwith-turborepo/recommendations.md`
2) `docs/audit/current-state.md`
3) `docs/plan/alignment-plan.md`
4) обновленный `README.md` с:
   - быстрым стартом
   - dev/build/test команды
   - прод-деплой (self-host/k8s)
5) Полные необходимые правки кода/структуры репозитория.

## Правила коммуникации в PR/коммитах
- Коммиты: короткие, тематические.
- В описании PR:
  - что изменено
  - как проверить
  - риски/миграции
  - что дальше (следующий этап из плана)

## Запрещено
- Встраивать проприетарные обязательные зависимости. 
- Убирать существующие рабочие сценарии dev/prod без замены.
