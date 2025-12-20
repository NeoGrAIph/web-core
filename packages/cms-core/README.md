# packages/cms-core

## Назначение
Shared schema/collections/globals/access/hooks для Payload (без доменной логики).

## Границы модуля (не окончательные)
- Коллекции/глобалы/хелперы, пригодные для нескольких apps.
- Без React UI и без app‑маршрутов.

Важно: границы модуля в этом README.md не окончательные и могут быть сужены или расширены
по мере обработки соответствующего модуля из шаблона website.

## Источники (for_cute)
- for_cute/src/access/*
- for_cute/src/collections/Users|Media|Categories
- for_cute/src/Header/config.ts
- for_cute/src/Footer/config.ts
- for_cute/src/hooks/populatePublishedAt.ts

## Зависимости
- packages/cms-fields
- packages/utils

## Требования и ограничения
- Toolchain и конфиги централизуем через packages/next-config, packages/eslint-config, packages/typescript-config.
- Используем for_cute/** как рабочую копию; upstream/** — только для сверки.
- Сохраняем имена файлов и относительную структуру, если это не нарушает канон web-core.
- В app‑коде UI импортируется только через фасад @/ui/* (без прямых @synestra/ui/*).
- Admin UI строго отдельно: @/admin-ui/* + import map Payload.
- Seed не должен зависеть от сетевых fetch (только локальные ассеты).
- Миграции обязательны при изменении schema (см. runbooks).

## Статус
Определён набор кандидатов на перенос; перенос ещё не выполнен.
