# Канон: `@/ui/*` (app-level facade) поверх `@synestra/ui/*` (shared)

Цель: дать всем приложениям **единый публичный интерфейс импорта UI**, при этом сохранить возможность “точечных подмен” без форка shared‑пакетов.

## 1) Термины

- **Shared UI** — `packages/ui` → `@synestra/ui/*`
- **Фасад приложения** — `apps/<site>/src/ui/*` → импортируется как `@/ui/*`
- **Override** — файл фасада, который перестаёт быть реэкспортом и экспортирует локальную реализацию

## 2) Правила (жёсткие)

1) В app‑коде (frontend) **запрещены импорты UI напрямую из `@synestra/ui/*`**.
- Весь UI импортируется только из `@/ui/*`.

2) Внутри shared‑пакета **запрещены deep‑imports** (`@synestra/ui/src/...`).
- Публичный контракт — только `@synestra/ui/<subpath>`.

3) Payload Admin кастомизации не смешиваем с frontend‑UI.
- Держим `@/admin-ui/*` отдельно и подключаем через Payload import map.

## 3) Базовая реализация фасада

Минимальный “пустой” фасад для компонента:

`apps/<site>/src/ui/button.tsx`:

- по умолчанию: `export { Button } from '@synestra/ui/button'`
- override: `export { Button } from '@/components/ui/button'` (или экспорт локального файла)

## 4) Почему это лучше, чем “магия резолвера”

- Импорт‑пути в приложении стабильны и не зависят от webpack/tsconfig‑магии.
- Подмена — это обычный файл в репозитории (прозрачно для code review).
- Можно постепенно мигрировать код: сначала завести фасад‑реэкспорты, потом переносить реализацию в shared, потом добавлять overrides.

## 5) Где проверяем изменения

Канон: сначала проверяем на `payload-dev` (`web-payload-dev`, `https://payload.dev.synestra.tech`), затем переносим в доменные приложения.

## 6) Связанные документы

- Архитектурный канон: `docs/architecture/canon.md`
- Компонентная система: `docs/architecture/component-system.md`
- Исследование слоя overrides: `docs/research/ui-layer-development/ui-layer-3-file-overrides.md`
