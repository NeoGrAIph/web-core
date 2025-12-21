# apps/synestra-io/src/providers

## Назначение
App providers (Theme, HeaderTheme, InitTheme).

## Границы модуля (не окончательные)
- Только app‑уровневые контексты и эффекты.

Важно: границы модуля в этом README.md не окончательные и могут быть сужены или расширены
по мере обработки соответствующего модуля из шаблона website.

## Источники (upstream/payload/templates/website)
- upstream/payload/templates/website/src/providers/**

## Зависимости
- packages/utils

## Требования и ограничения
- Используем upstream/payload/templates/website/** как рабочую копию; upstream/** — только для сверки.
- Сохраняем имена файлов и относительную структуру, если это не нарушает канон web-core.
- В app‑коде UI импортируется только через фасад @/ui/* (без прямых @synestra/ui/*).
- Admin UI строго отдельно: @/admin-ui/* + import map Payload.
- Seed не должен зависеть от сетевых fetch (только локальные ассеты).
- Миграции обязательны при изменении schema (см. runbooks).

## Статус
Перенос выполнен (этап 4.8).
