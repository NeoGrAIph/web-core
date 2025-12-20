# Payload CMS 3: Admin Custom Components + Import Map — best practices (конспект для `web-core`)

Цель: зафиксировать безопасный способ подключать/переопределять admin‑компоненты в Payload, не смешивая их с фронтовым UI и не создавая скрытую “магическую” систему резолва.

## 1) Базовый механизм Payload

- Custom components подключаются по component paths (строковые пути), а для сборки/бандлинга используется import map.
- По умолчанию admin‑компоненты — Server Components; client boundary добавляется точечно при необходимости.

Официальный источник:
- https://payloadcms.com/docs/custom-components/overview

## 2) Канон `web-core`

- Frontend UI и Admin UI разделены:
  - frontend: `@/ui/*`
  - admin: `@/admin-ui/*`
- В shared‑пакетах допустимы admin‑компоненты, но приложение подключает их через app‑локальные entrypoints (`@/admin-ui/*`) и import map.
- Генерация import map выполняется командой `payload generate:importmap` в контексте приложения.

Связанные документы:
- `docs/development/README.md`
- `docs/architecture/component-system.md`
