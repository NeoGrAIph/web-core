# packages/next-config

## Назначение
Общий helper для `next.config.mjs`: подмешивает `withPayload`, единый `extensionAlias`, собирает `transpilePackages` из workspace deps.

## Использование
```js
// next.config.mjs
import { createSynestraNextConfig } from '@synestra/next-config'

export default createSynestraNextConfig()
```

## Экспортируемые функции
- `createSynestraNextConfig(options)`
- `getWorkspaceTranspilePackages(options)`

## Источники
- `old_packages/next-config/index.js`
- `old_packages/next-config/package.json`

## Статус
Перенос выполнен (инфраструктура закрыта).
