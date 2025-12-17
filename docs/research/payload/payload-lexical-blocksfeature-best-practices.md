# Payload CMS 3 — Lexical Rich Text: BlocksFeature и конвертеры (best practices)

Дата актуальности: **2025-12-17**.  
Контекст репозитория: **Payload 3.68.3**, **Next.js 15.4.9**.

Цель: собрать **официальные** рекомендации Payload по:
- использованию `BlocksFeature` (встраиваемые “blocks” внутри rich text),
- рендерингу Lexical state в React/JSX (и при необходимости в HTML),
и описать применимый стандарт для `web-core` (monorepo, независимые деплои, слой 2 registry).

---

## 1) Источники (официальные)

- Rich Text: Custom Features (Lexical), включая `BlocksFeature`  
  `https://payloadcms.com/docs/rich-text/custom-features`
- Lexical: Overview  
  `https://payloadcms.com/docs/lexical/overview`
- Lexical Converters: Converting JSX  
  `https://payloadcms.com/docs/lexical/converters/converting-jsx`
- Lexical Converters: Converting HTML  
  `https://payloadcms.com/docs/lexical/converters/converting-html`
- Blocks Field: (раздел про `blockReferences` и упоминание использования block references в Lexical `BlocksFeature`)  
  `https://payloadcms.com/docs/fields/blocks`

---

## 2) Что важно понять (модель данных)

### 2.1. Blocks Field vs BlocksFeature

- **Blocks Field** (layout builder) хранит массив блоков, где `slug` блока превращается в `blockType`.
- **BlocksFeature** (Lexical) позволяет иметь блоки **внутри rich text**. Блоки при этом задаются теми же Payload `Block` конфигами (и идентифицируются по slug).

Практический вывод: один и тот же block config (например `mediaBlock`) *может* использоваться:
- в layout (поле `type: 'blocks'`),
- в rich text (`BlocksFeature({ blocks: [...] })`),
но это следует делать осознанно (см. раздел 4).

### 2.2. Рендеринг rich text в React

Payload рекомендует использовать `RichText` компонент из `@payloadcms/richtext-lexical/react` с конвертерами:
- `JSXConvertersFunction` (кастомизация рендера),
- `defaultConverters` (база),
- `LinkJSXConverter` (правильная обработка внутренних ссылок),
- `blocks` converters (маппинг `slug → React renderer` для embedded blocks).

Для встроенных blocks в JSX‑конвертерах Payload использует объект `blocks`, где ключ — `slug` блока.

---

## 3) Best practices для `web-core` (слой 2)

### 3.1. Каноническая схема: app хранит registry, shared хранит механику

1) **Schema** блоков — кандидат в `packages/cms-blocks` (когда блок стабилизирован и нужен ≥2 apps).
2) **Рендеринг** блоков внутри rich text остаётся в app (тема/классы/обёртки).
3) Для избежания копипаста допускается вынести “механику” сборки конвертеров в отдельный shared‑пакет (но без темы).

Сейчас в `apps/synestra-io` уже используется правильный официально поддерживаемый паттерн: `@payloadcms/richtext-lexical/react` + `JSXConvertersFunction` + `blocks` registry.

### 3.2. Типизация: избавляться от `any`

Рекомендуемый паттерн типизации для embedded blocks:
- расширить `NodeTypes` через `SerializedBlockNode<...>` и подставить union типов блоков из `payload-types`.
- в block‑конвертерах использовать `node.fields` как типизованную структуру конкретного блока.

Это уменьшает риск “случайно сломать” блок, не заметив до рантайма.

### 3.3. Когда нужен HTML-конвертер (и когда нет)

Если цель — “отрисовать контент на сайте”, чаще достаточно JSX‑конвертера (`RichText`), чтобы:
- избежать генерации строк HTML,
- иметь компонентный рендер и общий стиль.

HTML‑конвертер (`convertLexicalToHTMLAsync`) полезен, когда нужно:
- сгенерировать HTML для интеграций (например письма),
- получить HTML на сервере с корректной populate логикой.

Важный нюанс (официально): `convertLexicalToHTMLAsync` требует доступа к `payload`/config и часто используется с `getPayloadPopulateFn`, чтобы корректно populate’ить relationship‑данные.

---

## 4) Архитектурные решения перед “массовым выносом” блоков

### 4.1. Нужно ли унифицировать блоки layout и rich text?

Рекомендация: **да, но не всегда**.

Унифицировать имеет смысл, если:
- блок одинаков по смыслу и структуре (например `mediaBlock`, `code`, `banner`),
- он повторяется в нескольких местах (layout + rich text + другие apps),
- его schema можно держать без app‑зависимостей.

Разделять имеет смысл, если:
- блок для rich text должен быть “узким” (inline/вставка), а layout‑вариант — “страничный/секционный”;
- требуется разный набор полей (тогда это разные API и разные `slug`).

### 4.2. `blockReferences` (оптимизация схем) — не по умолчанию

`blockReferences` помогает уменьшить “вес” схемы в админке, но снижает гибкость:
- referenced блок нельзя локально переопределять на уровне поля/коллекции.

Для `web-core` (где важны независимые сайты и возможность кастомизации) это означает:
- начинаем с явных `blocks: [...]` (больше гибкости),
- рассматриваем `blockReferences` только когда реально упираемся в размер/перфоманс админки.

---

## 5) Практический чеклист (слой 2, rich text)

Для нового блока, который используется внутри rich text:
1) `Block.slug` стабилен и согласован с renderer‑ключом.
2) `Block.interfaceName` задан (для предсказуемых TS типов).
3) В rich text editor включён `BlocksFeature({ blocks: [...] })`.
4) В app‑слое добавлен JSX‑converter в `blocks: { <slug>: (...) => ... }`.
5) Переиспользуемое/стабильное — выносится в `packages/cms-blocks` (schema) и/или общий helper (без темы).

