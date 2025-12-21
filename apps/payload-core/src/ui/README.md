# apps/payload-core/src/ui

## Назначение
Facade для UI‑импортов приложения.

## Границы модуля (не окончательные)
- Только re‑export из @synestra/ui по умолчанию.
- Overrides допустимы точечно (1 файл = 1 override).

Важно: границы модуля в этом README.md не окончательные и могут быть сужены или расширены
по мере обработки соответствующего модуля из шаблона website.

## Источники (upstream/payload/templates/website)
- upstream/payload/templates/website/src/components/ui/*

## Зависимости
- packages/ui

## Требования и ограничения
- Используем upstream/payload/templates/website/** как рабочую копию; upstream/** — только для сверки.
- Сохраняем имена файлов и относительную структуру, если это не нарушает канон web-core.
- В app‑коде UI импортируется только через фасад @/ui/* (без прямых @synestra/ui/*).
- Admin UI строго отдельно: @/admin-ui/* + import map Payload.
- Seed не должен зависеть от сетевых fetch (только локальные ассеты).
- Миграции обязательны при изменении schema (см. runbooks).

## Статус
Фасад требуется; реэкспорты и overrides будут добавляться при переносе.
