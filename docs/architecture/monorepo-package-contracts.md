# Monorepo / контракты структуры: пакеты и компоненты (вопрос №4)

Дата актуальности: **2025-12-17**.  
Цель: снизить копипаст, убрать “дрейф структуры” и сделать добавление новых пакетов/компонентов предсказуемым.

Связанные документы:
- `docs/architecture/monorepo-packages-standards.md` (решения: source‑packages, ESM, таксономия, зависимости)
- `docs/architecture/component-system.md` (UI‑слой: server/client, уровни, DoD)
- `docs/research/payload/payload-admin-custom-components-best-practices.md` (Import Map, app‑local entrypoints)

---

## 1) Контракт пакета (общий, для большинства `packages/*`)

Обязательные элементы:
- `package.json`
  - `name: "@synestra/<name>"`
  - `private: true`
  - `type: "module"` (для TS‑пакетов)
  - `exports` указывает на `src/*` (source‑packages)
  - `scripts`:
    - `build` (если есть TS код)
    - `typecheck` (обязательно)
- `src/index.ts` — публичный API пакета (barrel)
- `README.md` — 10–20 строк: что делает пакет, как импортировать, как запустить скрипты
- `tsconfig.json` — `extends: "@synestra/typescript-config/base.json"`

Запреты:
- не импортировать из `apps/*`;
- не полагаться на `dist/*` как runtime‑источник истины (если пакет не объявлен как built‑исключение).

---

## 2) Контракт UI‑пакета (`packages/ui` и будущие UI‑пакеты)

### 2.1. Структура

Минимум:
- `src/index.ts` — только публичные экспорты
- `src/styles.css` — базовые стили/токены (если пакет включает default UI стили); подключается в app как `@synestra/ui/styles.css`
- `src/<kebab-case>.tsx` — компонент
- `src/<kebab-case>.test.tsx` — тест компонента (минимум “рендерится”)
- `src/test/setup.ts` — общая настройка (jest-dom и т.п.)
- `vitest.config.ts`

### 2.2. Экспорты и импорты

Стандарт:
- компонент **обязан** экспортироваться из `src/index.ts`;
- subpath exports (`@synestra/ui/button`) допустимы, но считаются “контрактом”: после появления их сложно менять без миграции.

### 2.3. Server/Client граница

Стандарт:
- по умолчанию компоненты должны быть **server‑safe** (без `'use client'`);
- интерактивные вещи — отдельными экспортами/entrypoints (чтобы `'use client'` не “расползался”).

См. подробный DoD: `docs/architecture/component-system.md`.

---

## 3) Контракт CMS‑пакетов (`packages/cms-*`)

### 3.1. Общая цель

CMS‑пакеты содержат:
- schema (collections/fields/blocks),
- типы и server‑хелперы (access functions, хуки).

Отдельная подкатегория: `packages/cms-fields`
- содержит field builders (`link`, `linkGroup` и т.п.) и внутренние утилиты для сборки schema;
- не содержит React‑рендер;
- предназначена для того, чтобы `packages/cms-blocks` мог быть полностью app‑agnostic.

### 3.2. Структура единиц

Стандарт “1 единица = 1 файл”:
- block config: `src/blocks/<BlockName>/config.ts` или `src/blocks/<kebab>.ts` (один блок = один файл)
- collection config: `src/collections/<CollectionName>.ts`
- access rule: `src/access/<name>.ts`
- публичные экспорты — только через `src/index.ts`

React‑рендер UI‑блоков не хранится в `cms-*` (рендер — в app‑слое или в отдельном UI‑пакете).

Практический стандарт для package layout:
- `src/index.ts` реэкспортирует `./access`, `./collections`, `./blocks`, `./fields` (в зависимости от типа пакета)
- внутри подпапок есть `index.ts`, который является единственной “точкой входа” в подпапку

---

## 4) Контракт “конфиг‑пакетов” (`typescript-config`, `eslint-config`)

Стандарт:
- не требуют TS build;
- экспортируют стабильные entrypoints (например `exports: { ".": "./index.js" }`);
- не зависят от `apps/*` и от UI/CMS пакетов.

---

## 5) Контракт Payload plugins (`packages/plugins/*`)

Стандарт:
- имя: `@synestra/payload-plugin-<name>`
- `type: "module"`
- `src/index.ts` экспортирует default/plugin factory
- никаких импортов из `apps/*`

---

## 6) Что генераторы обязаны соблюдать (подготовка к Этапу 4)

Любой генератор, который создаёт пакет/компонент, обязан:
- создавать структуру по соответствующему контракту;
- обновлять `src/index.ts` (public API);
- добавлять минимальный тест там, где он обязателен (UI);
- не добавлять секреты/реальные значения в `.env*`.

Команды:
- интерактивно: `pnpm gen`
- список генераторов: `pnpm gen -- --help` (или выбрать в TUI)
