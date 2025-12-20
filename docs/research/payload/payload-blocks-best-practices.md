# Payload CMS 3: Blocks Field — best practices (конспект для `web-core`)

Цель: собрать практические выводы по `Blocks` field для page builder в контексте `web-core` (Payload 3 + Next.js App Router).

## 1) Основные принципы

- `slug` блока является публичным API: в данных он сохраняется как `blockType`.
- Block configs лучше держать отдельными модулями (упрощает переиспользование).
- На фронтенде рендер выбирается по `blockType` через registry `blockType → component`.

Официальные источники:
- Blocks field: https://payloadcms.com/docs/fields/blocks
- Guide (layouts): https://payloadcms.com/posts/guides/how-to-build-flexible-layouts-with-payload-blocks

## 2) Канон `web-core`

- Schema блоков постепенно выносится в shared (`packages/cms-blocks`) только после стабилизации и если блок нужен ≥2 apps.
- Renderer/registry и тема остаются на уровне app.
- Unknown `blockType` не должен “ронять” страницу (fallback `null`/placeholder).
- `blockReferences` не используем по умолчанию (это оптимизация с потерей гибкости override’ов).

Связанные документы:
- Каталог и registry: `docs/architecture/payload-page-builder-catalog.md`
- Конвергенция layout ↔ Lexical: `docs/architecture/payload-lexical-layout-convergence.md`
