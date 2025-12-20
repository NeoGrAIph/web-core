# apps/payload-core/src/admin-ui

## Назначение
Facade для Payload Admin компонентов (import map).

## Границы модуля (не окончательные)
- Только admin‑компоненты.
- Не использовать во frontend UI.

Важно: границы модуля в этом README.md не окончательные и могут быть сужены или расширены
по мере обработки соответствующего модуля из шаблона website.

## Источники (for_cute)
- for_cute/src/components/BeforeLogin
- for_cute/src/components/BeforeDashboard
- for_cute/src/components/AdminBar
- for_cute/src/Header/RowLabel
- for_cute/src/Footer/RowLabel

## Зависимости
- payload import map

## Требования и ограничения
- Используем for_cute/** как рабочую копию; upstream/** — только для сверки.
- Сохраняем имена файлов и относительную структуру, если это не нарушает канон web-core.
- В app‑коде UI импортируется только через фасад @/ui/* (без прямых @synestra/ui/*).
- Admin UI строго отдельно: @/admin-ui/* + import map Payload.
- Seed не должен зависеть от сетевых fetch (только локальные ассеты).
- Миграции обязательны при изменении schema (см. runbooks).

## Статус
Требуется настройка import map; компоненты будут перенесены по мере работ.
