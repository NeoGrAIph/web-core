# packages/typescript-config

## Назначение
Общие профили TypeScript (`base.json`, `nextjs.json`) для apps и packages.

## Использование
- В пакетах: `"extends": "@synestra/typescript-config/base.json"`
- В приложениях: `"extends": "@synestra/typescript-config/nextjs.json"`

## Источники
- `old_packages/typescript-config/base.json`
- `old_packages/typescript-config/nextjs.json`

## Примечания
- Пакет не содержит runtime‑кода.
- Используется через `extends`, поэтому должен быть в `devDependencies` потребителей.

## Статус
Перенос выполнен (инфраструктура закрыта).
