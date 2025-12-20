# apps/synestra-io/src/app

## Назначение
Next.js App Router (frontend + payload routes).

## Границы модуля (не окончательные)
- Frontend routes, preview/seed, sitemaps, payload routes.

Важно: границы модуля в этом README.md не окончательные и могут быть сужены или расширены
по мере обработки соответствующего модуля из шаблона website.

## Источники (for_cute)
- for_cute/src/app/**

## Зависимости
- payload, next

## Требования и ограничения
- Используем for_cute/** как рабочую копию; upstream/** — только для сверки.
- Сохраняем имена файлов и относительную структуру, если это не нарушает канон web-core.
- В app‑коде UI импортируется только через фасад @/ui/* (без прямых @synestra/ui/*).
- Admin UI строго отдельно: @/admin-ui/* + import map Payload.
- Seed не должен зависеть от сетевых fetch (только локальные ассеты).
- Миграции обязательны при изменении schema (см. runbooks).

## Статус
Перенос планируется; сгенерированные payload файлы обновляются через payload generate.
