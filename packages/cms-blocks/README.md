# packages/cms-blocks

## Назначение
Shared block configs (schema) для Payload Blocks.

## Границы модуля (не окончательные)
- Только schema/config блоков.
- Рендеры блоков остаются в app.

Важно: границы модуля в этом README.md не окончательные и могут быть сужены или расширены
по мере обработки соответствующего модуля из шаблона website.

## Источники (for_cute)
- for_cute/src/blocks/*/config.ts (Banner, CallToAction, Content, Code, MediaBlock)

## Зависимости
- packages/cms-fields

## Требования и ограничения
- Toolchain и конфиги централизуем через packages/next-config, packages/eslint-config, packages/typescript-config.
- Используем for_cute/** как рабочую копию; upstream/** — только для сверки.
- Сохраняем имена файлов и относительную структуру, если это не нарушает канон web-core.
- В app‑коде UI импортируется только через фасад @/ui/* (без прямых @synestra/ui/*).
- Admin UI строго отдельно: @/admin-ui/* + import map Payload.
- Seed не должен зависеть от сетевых fetch (только локальные ассеты).
- Миграции обязательны при изменении schema (см. runbooks).

## Статус
Определены кандидаты на shared; перенос ещё не выполнен.
