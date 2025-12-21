# packages/ui

## Назначение
Shared UI primitives, пригодные для переиспользования в нескольких apps.

## Содержимое (актуально)
- button, card, checkbox, input, label, pagination, select, textarea
- `styles.css` — базовые стили (пока из старого пакета)

## Источники (for_cute)
- `for_cute/src/components/ui/button.tsx`
- `for_cute/src/components/ui/card.tsx`
- `for_cute/src/components/ui/checkbox.tsx`
- `for_cute/src/components/ui/input.tsx`
- `for_cute/src/components/ui/label.tsx`
- `for_cute/src/components/ui/pagination.tsx`
- `for_cute/src/components/ui/select.tsx`
- `for_cute/src/components/ui/textarea.tsx`

Дополнительно:
- `styles.css` — из `old_packages/ui/src/styles.css` (в for_cute отсутствует).

## Зависимости
- `@synestra/utils`
- `@radix-ui/*`
- `class-variance-authority`
- `lucide-react`

## Примечания
- Некоторые компоненты помечены `'use client'` (checkbox, label, select).
- В `pagination` исправлены импорты на локальные `button` и `@synestra/utils/ui`.

## Статус
Перенос выполнен (этап 4.5).
