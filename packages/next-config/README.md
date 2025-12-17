# `@synestra/next-config`

Назначение: убрать копипаст в `apps/*/next.config.mjs` и сделать Next.js конфиги единообразными для Payload 3.

Что делает:
- добавляет общий `webpack.resolve.extensionAlias` (TS/ESM совместимость);
- автоматически формирует `transpilePackages` из `dependencies` приложения (`@synestra/*`);
- оборачивает config через `withPayload`.

Использование:
- `import { createSynestraNextConfig } from '@synestra/next-config'`
- `export default createSynestraNextConfig({ nextConfig, payloadOptions })`

