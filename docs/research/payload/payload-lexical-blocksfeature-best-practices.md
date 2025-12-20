# Payload CMS 3: Lexical `BlocksFeature` и converters — best practices (конспект для `web-core`)

Цель: зафиксировать практики для embedded blocks внутри rich text (Lexical), чтобы они были согласованы с layout blocks и не превращались в отдельный “форк”.

## 1) Embedded blocks и идентичность

- В Lexical `BlocksFeature` блоки также идентифицируются по `slug` (в конвертерах это ключ `blocks.<slug>`).
- Если embedded‑вариант принципиально отличается от layout‑секции — лучше разные `slug`, чем один перегруженный блок.

Официальные источники:
- Lexical overview: https://payloadcms.com/docs/lexical/overview
- Custom features (`BlocksFeature`): https://payloadcms.com/docs/rich-text/custom-features
- Converters (JSX/HTML): https://payloadcms.com/docs/rich-text/converters

## 2) Канон `web-core`

- Держим отдельный каталог embedded blocks и отдельные JSX converters, но стараемся переиспользовать `slug` и (по возможности) React‑компоненты.
- Layout blocks и embedded blocks связываются через единый “контракт” `slug` (см. DoD и правила в архитектуре).

Связанный нормативный документ:
- `docs/architecture/payload-lexical-layout-convergence.md`
