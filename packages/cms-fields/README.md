# packages/cms-fields

## Назначение
Shared field builders и связанные типы для Payload schema (без React‑рендера).

## Содержимое (актуально)
- `defaultLexical` — базовый Lexical editor config.
- `link` / `linkGroup` — builders для ссылок.
- `hero` — поле hero (schema) для reuse в коллекциях/глобалах.

## Источники (for_cute)
- `for_cute/src/fields/defaultLexical.ts`
- `for_cute/src/fields/link.ts`
- `for_cute/src/fields/linkGroup.ts`
- `for_cute/src/heros/config.ts`

## Зависимости
- `@payloadcms/richtext-lexical`
- `payload`
- `@synestra/utils` (deepMerge)

## Примечания
- В `link` используется `relationTo: ['pages', 'posts']` — это контракт на slugs коллекций.
- `hero` ссылается на `media` collection и должен жить рядом с CMS‑слоем.

## Статус
Перенос выполнен (этап 4.2).
