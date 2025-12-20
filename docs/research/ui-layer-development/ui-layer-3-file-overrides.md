# UI (слой 3): точечные file overrides (“swizzle/shadowing” без форков)

Дата актуальности: **2025-12-17**.  
Контекст: `web-core` (Payload CMS 3.68.3, Next.js 15.4.9).

Цель слоя 3 — дать возможность собирать новые сайты из унифицированных “кирпичей” (слои 1–2), но при этом **точечно заменять** отдельные файлы/реализации, не форкая shared‑пакеты и не копируя половину проекта.

Аналогия:
- как в Helm: есть дефолтные values, а в окружении/релизе переопределяются только нужные;
- как в Docusaurus “swizzle”: есть дефолтные компоненты, и проект может “забрать” один компонент себе для изменения.

Связанные документы:
- `docs/research/ui-layer-development/ui-layer-1-parameterization.md` (tokens/variants/slots)
- `docs/research/ui-layer-development/ui-layer-2-registry.md` (registry + shared schema/renderer)
- Payload Custom Components (Import Map): `https://payloadcms.com/docs/custom-components/overview`
- Next.js: Absolute Imports / Module Aliases (tsconfig/jsconfig paths): `https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases`
- Next.js: `transpilePackages`: `https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages`
- Next.js: кастомизация webpack (алиасы и мердж): `https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack`
- Next.js: конфиг Turbopack (resolveAlias): `https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack`
- Docusaurus: swizzling: `https://docusaurus.io/docs/swizzling`

---

## 1) Канон `web-core`: override через app‑wrapper файлы (по умолчанию)

Самый предсказуемый и “официально безопасный” способ для Next/Payload: **явные точки расширения в app**.

Паттерн:
- shared реализация живёт в `packages/*`;
- в app лежит файл‑обёртка (wrapper), который по умолчанию реэкспортирует shared реализацию;
- если нужен override — меняем **только этот wrapper файл** в app (остальной код не трогаем).

Примеры (schema overrides, Payload Blocks):
- `apps/*/src/blocks/*/config.ts` → по умолчанию `export { ... } from '@synestra/cms-blocks'`
- `apps/*/src/fields/*.ts` → по умолчанию `export { ... } from '@synestra/cms-fields/...`

Почему это хорошо:
- не зависит от webpack/turbopack alias‑магии;
- override очевиден в git diff (1 файл);
- можно иметь разные overrides для разных apps без ветвления shared‑кода.

Практическое правило:
- если “часто хочется менять только одну деталь”, сначала пытаемся решить в слоях 1–2 (tokens/variants/registry);
- если всё равно нужен форк поведения — добавляем **wrapper‑точку** в app и документируем её как “override boundary”.

### 1.1. Рекомендуемая реализация “Bitrix-подобного” file override без магии резолвера

Ключевая идея: приложение **никогда не импортирует** shared‑пакет напрямую, вместо этого оно импортирует “канонический” путь внутри app.

Канон:
- shared UI живёт в `packages/ui` (`@synestra/ui/*`);
- в каждом app есть “фасад” `src/ui/*`, который по умолчанию реэкспортит shared‑реализации;
- весь код app импортирует UI только из `@/ui/*` (или `@/ui`).

Почему это работает:
- Next.js официально поддерживает `baseUrl/paths` в `tsconfig.json`/`jsconfig.json`, а алиас `@/* → ./src/*` уже является стандартом наших apps/templates;
- override делается обычным git‑диффом: заменяем файл `apps/<site>/src/ui/<component>.tsx`.

Пример (как должно выглядеть в app):

- wrapper по умолчанию: `apps/<site>/src/ui/button.tsx`:
  - `export { Button } from '@synestra/ui/button'`
- использование: `import { Button } from '@/ui/button'`

---

## 2) Когда нужен override через фасад (facade/indirection layer)

Термины:
- **Facade/indirection layer**: стабильная точка входа/импорт‑путь, за которым скрыта реализация и допускаются локальные подмены.
- **Override (file override)**: точечная замена реализации конкретного модуля/компонента без изменения импорт‑путей в остальном коде.

См. также:
- Facade (GoF): `https://people.csail.mit.edu/addy/pattern/pat4e.htm`
- Next.js module aliases: `https://nextjs.org/docs/14/app/building-your-application/configuring/absolute-imports-and-module-aliases`

Иногда хочется, чтобы код импортировал “канонический модуль”, а реализация подменялась автоматически, если в app есть файл с тем же именем (shadowing).

В экосистеме Next.js это обычно делают через:
- `webpack.resolve.alias` (prod/build и dev без turbopack);
- `experimental.turbo.resolveAlias` (dev с turbopack).

Важно (Next.js):
- кастомизация `webpack` должна **мерджить** существующие алиасы, иначе можно сломать сборку (официальное предупреждение в документации).

Почему мы НЕ делаем это по умолчанию:
- алиасы добавляют скрытую магию в резолвинге модулей;
- сложнее отлаживать “почему импорт поехал не туда”;
- есть риск несовместимости между webpack и turbopack в dev/prod, если не поддерживать оба.

Рекомендация:
- держать shadowing как **опциональный режим** (под задачу), а основным способом считать wrapper‑файлы.

Практический критерий “можно включать shadowing”:
- команда готова поддерживать **2 режима резолвинга** (dev turbopack и prod webpack);
- есть тестовый чек (build) и документ “как отлаживать override”.

---

## 3) Payload Admin UI: overrides через Custom Components + Import Map

Payload позволяет подключать/заменять админские компоненты через Custom Components, а для бандлинга использует Import Map.

Практическая стратегия для `web-core`:
- shared пакеты могут предоставлять “дефолтные” админские компоненты;
- app выбирает (или переопределяет) компонент на уровне Payload config, указывая путь на app‑локальный файл;
- Import Map генерируется командой `payload generate:importmap` (в app).

---

## 4) Definition of Done для override boundary

Считаем “override boundary” готовой, если:
- есть shared дефолт (`packages/*`);
- есть app‑wrapper по умолчанию (реэкспорт);
- в `docs/architecture/component-system.md` или в app README описано, что именно можно/нельзя менять;
- если boundary касается schema (Payload) — есть понимание, нужна ли миграция при изменении.

---

## 5) Источники (цитируемые страницы)

- Next.js Absolute Imports / Module Aliases: `https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases`
- Next.js `transpilePackages`: `https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages`
- Next.js `webpack` config (про мердж/алиасы): `https://nextjs.org/docs/app/api-reference/config/next-config-js/webpack`
- Next.js `turbopack` config (`resolveAlias`): `https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack`
- Payload Custom Components overview (Import Map): `https://payloadcms.com/docs/custom-components/overview`
- Docusaurus swizzle: `https://docusaurus.io/docs/swizzling`
