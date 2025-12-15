# `docs/architecture`

Нормативные документы по архитектуре и структуре репозитория:
- `docs/architecture/architecture.md` — взаимодействие `web-core` ↔ `synestra-platform`
- `docs/architecture/canon-v0.md` — временный базовый “канон” (v0), который будет уточняться по мере исследования официальной документации
- `docs/architecture/database-cnpg.md` — канон по БД Postgres через CloudNativePG (CNPG) для web‑приложений
- `docs/architecture/release-promotion.md` — канон dev → prod через promotion (release-dev / release-prod)
- `docs/architecture/repo-structure.md` — живая структура репозитория и маппинг на deployments
- `docs/architecture/tooling-turborepo.md` — как используем Turborepo (turbo) в монорепе
- `docs/architecture/env-contract.md` — контракт env vars `dev → stage → prod` и правила валидации (без секретов в репо)
