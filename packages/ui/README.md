# packages/ui

## Назначение
Shared UI primitives, пригодные для переиспользования в нескольких apps.

## Содержимое (актуально)
- button, card, checkbox, input, label, pagination, select, textarea
- `styles.css` — базовые стили (пока из старого пакета)

## Источники (upstream/payload/templates/website)
- `upstream/payload/templates/website/src/components/ui/button.tsx`
- `upstream/payload/templates/website/src/components/ui/card.tsx`
- `upstream/payload/templates/website/src/components/ui/checkbox.tsx`
- `upstream/payload/templates/website/src/components/ui/input.tsx`
- `upstream/payload/templates/website/src/components/ui/label.tsx`
- `upstream/payload/templates/website/src/components/ui/pagination.tsx`
- `upstream/payload/templates/website/src/components/ui/select.tsx`
- `upstream/payload/templates/website/src/components/ui/textarea.tsx`

Дополнительно:
- `styles.css` — из `old_packages/ui/src/styles.css` (в upstream/payload/templates/website отсутствует).

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
