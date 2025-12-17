# Payload CMS 3 — Blocks / Page Builder: best practices (official)

Дата актуальности: **2025-12-16**.  
Контекст репозитория: **Payload 3.68.3**, **Next.js 15.4.9**, monorepo `apps/*` + `packages/*`.

Цель: собрать **официальные** рекомендации Payload по построению “page builder” через `Blocks`, и описать применимый стандарт для `web-core` (без копипаста и с устойчивыми границами между `apps/*` и `packages/*`).

---

## 1) Источники (официальные)

- Docs: Blocks Field  
  `https://payloadcms.com/docs/fields/blocks`
- Docs: Rich Text — Custom Features (Lexical), в т.ч. `BlocksFeature`  
  `https://payloadcms.com/docs/rich-text/custom-features`

Дополнительно (официальные гайды/практика):
- Guide: Flexible layouts / page builder через Blocks  
  `https://payloadcms.com/posts/guides/how-to-build-flexible-layouts-with-payload-blocks`

---

## 2) Best practices (из docs)

### 2.1. “Один блок — один файл”

Payload рекомендует хранить каждый block config в отдельном модуле, чтобы:
- конфиги не разрастались внутри коллекций;
- блоки было легко переиспользовать.

Практический вывод для `web-core`:
- блоки живут в `packages/cms-blocks/src/blocks/<slug>/config.ts`;
- app‑пакеты лишь подключают нужный набор блоков (без копирования схем).

Анти‑паттерн:
- держать большие inline‑массивы block configs прямо в коллекциях/глобалах.

### 2.2. Стабильный `slug` как API‑контракт

`slug` блока становится `blockType` в данных — это контракт между:
- schema (что хранится),
- renderer (что отрисовывать).

Анти‑паттерн:
- менять `slug` без миграций и без обновления renderer.

### 2.3. TypeScript: `interfaceName` как часть DX‑контракта

Payload рекомендует указывать `interfaceName` для блоков, чтобы генерация типов была предсказуемой.

Практический вывод для `web-core`:
- для shared блоков в `packages/cms-blocks` всегда задаём `interfaceName`;
- `interfaceName` должен быть стабильным и однозначным (как имя публичного типа), а не “временным”.

### 2.3. UX админки: `labels` и `admin.group`

Payload рекомендует улучшать UX выбора блока:
- задавать `labels.singular/plural`;
- использовать `admin.group` для группировки.

Анти‑паттерн:
- оставлять блоки “плоским списком” при росте числа блоков.

### 2.4. `blockName` vs `blockType`

`blockType` — идентификатор типа (`slug`).  
`blockName` — имя конкретного экземпляра блока (удобно для навигации редактора в длинных страницах).

Практика:
- включать `blockName` точечно (лендинги/сложные страницы), иначе это шум в данных.

### 2.5. Block References (`blockReferences`) — опциональная оптимизация (официально в Blocks Field)

Payload предлагает `blockReferences` как способ сократить “вес” схемы для админки:
- блоки объявляются один раз в top-level `payload.config` (`blocks`),
- в поле `Blocks` вместо `blocks: [...]` указываются `blockReferences: [...]`.

Ограничения (из docs Blocks Field):
- referenced блок нельзя “переопределять” локально на уровне поля/коллекции;
- access для referenced блока не имеет доступа к данным коллекции, т.к. вычисляется отдельно.

Практика:
- включать только когда размер/сложность схемы стала реальной проблемой.

### 2.6. Ограничивать доступный набор блоков в конкретном поле

Для “узких” страниц полезно ограничивать набор доступных блоков (например, через `filterOptions`) вместо копирования/форка блоков.

Анти‑паттерн:
- плодить “почти одинаковые” блоки под разные страницы вместо параметризации полями.

### 2.7. TypeScript: типизировать block configs

Практика:
- экспортировать block configs, удовлетворяющие типу `Block` (из `payload`), чтобы ловить ошибки структуры на этапе компиляции.

---

## 2.8) Практики сообщества (полезно учитывать)

Эти пункты не являются “истиной” Payload, но часто всплывают при масштабировании page builder:

- `defaultValue` для blocks‑поля: в рантайме Payload ожидает наличие `blockName` для каждого блока в `defaultValue` (иначе возможна ошибка).  
  Обсуждение: `https://payloadcms.com/community-help/54`
- Подписи строк (row labels) для blocks/array: часто решают через `blockName` и/или кастомный `RowLabel` компонент в админке.  
  Обсуждение: `https://payloadcms.com/community-help/2296`

---

## 3) Стандарт `web-core` для `@synestra/cms-blocks`

### 3.1. Структура пакета

```
packages/cms-blocks/src/
  blocks/
    hero/
      config.ts
      index.ts
    cta/
      config.ts
      index.ts
  index.ts
```

Где:
- `config.ts` экспортирует Payload block config (`Block`);
- `index.ts` (внутри блока) экспортирует публичный API блока (config + типы/хелперы);
- `src/index.ts` экспортирует реестры (для подключения в app).

### 3.2. Интеграция в `apps/*` (схема vs рендеринг)

Разделение обязанностей:
- `packages/cms-blocks` хранит **схемы/типы** блоков (Payload);
- `apps/*` держат **renderer/тему** и registry `blockType → React component` (см. `docs/architecture/component-system.md`).
- общая “механика рендера” (без темы) может жить в shared‑пакете, чтобы не копировать логику между apps: `@synestra/blocks-renderer`.

---

## 4) Lexical (rich text) и блоки

Если нужны “встраиваемые блоки” в rich text:
- использовать рекомендованный `BlocksFeature` (вместо самописных “custom features”).
