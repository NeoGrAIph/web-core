# packages/cms-core

## Назначение
Shared schema/collections/globals/access/hooks для Payload (без доменной логики и без React‑UI).

## Содержимое (актуально)
- Access: `anyone`, `authenticated`, `authenticatedOrPublished`.
- Collections: `Users`, `Media`, `Categories`.
- Globals: `Header`, `Footer`.
- Hooks: `populatePublishedAt`.

## Источники (for_cute)
- `for_cute/src/access/*`
- `for_cute/src/collections/Users|Media|Categories`
- `for_cute/src/Header/config.ts`
- `for_cute/src/Footer/config.ts`
- `for_cute/src/hooks/populatePublishedAt.ts`

## Зависимости
- `payload`
- `@payloadcms/richtext-lexical`
- `@synestra/cms-fields`

## Примечания
- `Header`/`Footer` без `afterChange` hooks: revalidate‑хуки добавляются на уровне app‑wrapper.
- RowLabel пути переведены на `@/admin-ui/*` (канон разделения admin‑слоя).
- `Media.upload.staticDir` рассчитан от `process.cwd()` (ожидается, что app запускается из корня приложения).

## Статус
Перенос выполнен (этап 4.3).
