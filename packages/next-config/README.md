# `@synestra/next-config`

Назначение: убрать копипаст в `apps/*/next.config.mjs` и сделать Next.js конфиги единообразными для Payload 3.

Что делает:
- добавляет общий `webpack.resolve.extensionAlias` (TS/ESM совместимость);
- автоматически формирует `transpilePackages` из workspace‑зависимостей приложения (`@synestra/*`), включая транзитивные зависимости (по умолчанию);
- оборачивает config через `withPayload`.

Использование:
- `import { createSynestraNextConfig } from '@synestra/next-config'`
- `export default createSynestraNextConfig({ nextConfig, payloadOptions })`

Опции:
- `includeWorkspaceTranspilePackages` (boolean, default: `true`) — включать автосборку `transpilePackages` из workspace deps.
- `includeTransitiveWorkspaceTranspilePackages` (boolean, default: `true`) — добавлять также транзитивные `@synestra/*` зависимости пакетов, указанных в `dependencies` приложения.
