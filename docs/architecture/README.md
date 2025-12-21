# `docs/architecture`

Нормативные документы по архитектуре и структуре репозитория:
- `docs/architecture/architecture.md` — взаимодействие `web-core` ↔ `synestra-platform`
- `docs/architecture/current-architecture.md` — текущая архитектура `web-core` и контекст её появления
- `docs/architecture/canon.md` — временный базовый “канон” (v0), который будет уточняться по мере исследования официальной документации
- `docs/runbooks/runbook-database-cnpg.md` — канон по БД Postgres через CloudNativePG (CNPG) для web‑приложений
- `docs/runbooks/runbook-payload-migrations.md` — канон миграций Payload CMS 3 для PostgreSQL (baseline миграция, где и как запускать в prod)
- `docs/architecture/release-promotion.md` — канон dev → prod через promotion (release-dev / release-prod)
- `README.md` — краткая живая структура репозитория и принципы деплоя
- `docs/architecture/tooling-turborepo.md` — как используем Turborepo (turbo) в монорепе
- `docs/runbooks/runbook-env-contract.md` — контракт env vars `dev → stage → prod` и правила валидации (без секретов в репо)
- `docs/architecture/component-system.md` — структура UI-компонентов и правила переиспользования (apps ↔ packages)
- `docs/architecture/monorepo/monorepo-packages-standards.md` — стандарты `packages/*` (source packages, ESM, зависимости)
- `docs/architecture/monorepo/monorepo-package-contracts.md` — контракты структуры пакетов/компонентов
- `docs/architecture/monorepo/monorepo-packages-audit.md` — аудит текущего состояния `packages/*`
- `docs/runbooks/runbook-payload-seeding.md` — seed/defaultValue и правила изменений schema (операционные шаги)
