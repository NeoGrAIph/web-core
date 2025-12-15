# Миграции (Payload)

Эта директория зарезервирована под миграции Payload для Postgres.

Контекст:
- Мы используем `@payloadcms/db-postgres` и задаём `migrationDir` в `src/payload.config.ts`.
- В Kubernetes миграции будут выполняться детерминированно (предпочтительно через ArgoCD PreSync Job),
  см. `docs/runbooks/runbook-dev-deploy-corporate.md`.

Правила:
- Миграции создаются/применяются через Payload CLI (конкретные команды зафиксируем при внедрении полного шаблона `website`).
- В `web-core` нельзя хранить секреты — только артефакты миграций и код.

