# Monorepo / `packages/*`: аудит текущего состояния (для ответа на вопрос №4)

Статус: черновик аудита на **2025-12-17**.  
Цель: зафиксировать “как сейчас устроено”, найти копипаст/разрывы стандартов и подготовить решения (контракты пакетов + генераторы).

## 1) Что уже есть в репозитории

### 1.1. Workspace и Turborepo

- Workspace границы заданы в `pnpm-workspace.yaml`: `apps/*`, `packages/*`, `packages/plugins/*`.
- Turborepo pipeline задан в `turbo.json` (build/lint/typecheck/test/dev).
- `turbo/` как зона “инструментов” уже существует, но генераторы пока **заглушка**:
  - `turbo/generators/` без `config.ts` и без templates, `@turbo/gen` не подключён.

### 1.2. Наличие shared packages

Существующие пакеты:
- UI: `packages/ui` (Vitest + Testing Library, subpath exports для `button`/`card`).
- Utils: `packages/utils` (пока минимальный).
- Env: `packages/env` (контракт env vars и валидация).
- Payload shared: `packages/cms-core`, `packages/cms-blocks`, `packages/cms-ecommerce`.
- Config packages: `packages/typescript-config`, `packages/eslint-config`.
- Plugins: `packages/plugins/payload-plugin-multisite`.

### 1.3. Общий паттерн “source packages”

Большинство `packages/*` сейчас устроены как **source packages**:
- `exports` указывает на `src/*` (а не `dist/*`);
- приложения добавляют зависимости в `transpilePackages` (Next.js), чтобы сборщик корректно транспилировал workspace‑код.

Плюсы:
- быстрый DX (правки в `packages/*` мгновенно видны в apps),
- меньше “двойной сборки” (Next всё равно транспилирует),
- проще monorepo‑рефакторинг.

Риск/вопрос:
- `build` в таких пакетах сейчас создаёт `dist/**`, но runtime‑импорты идут из `src/**`. Нужно решить, что именно означает `build` для source‑пакета (см. раздел 3).

---

## 2) Где уже виден копипаст / неполная стандартизация

### 2.1. Повтор `next.config.mjs` (webpack extensionAlias + withPayload)

В `apps/*/next.config.mjs` повторяется одинаковый блок `webpack.resolve.extensionAlias` и паттерн `withPayload(nextConfig)`.

Решение:
- вынесено в `packages/next-config` (см. `@synestra/next-config`), чтобы убрать копипаст и автоматически формировать `transpilePackages` из `dependencies`.

### 2.2. `transpilePackages` не всегда отражает фактические зависимости

Например, `apps/synestra-io` транспилирует `@synestra/cms-core` и `@synestra/env`, но другие apps перечисляют ещё `@synestra/ui`, `@synestra/cms-blocks`, `@synestra/payload-plugin-multisite`.

Нужно стандартизировать:
- правило “каждый app обязан перечислять все workspace‑пакеты, которые он импортирует”,
- или перейти на единый helper, который собирает список автоматически (но это опаснее/магичнее).

### 2.3. ESM/CJS неоднородность

Часть пакетов объявлена как `type: "module"` (например `@synestra/cms-core`), часть — нет.  
Это не обязательно ошибка, но для генераторов и стандартов нужно явное решение:
- делаем все internal packages ESM,
- либо фиксируем правила “что может быть CJS и почему”.

### 2.4. Тестовый контур “только для UI”

Сейчас тесты оформлены только в `packages/ui`.  
Нужен стандарт: какие типы пакетов должны иметь тесты (и какого типа), а где достаточно typecheck.

---

## 3) Открытые архитектурные решения (нужно закрыть в рамках №4)

### 3.1. Что означает `build` для source‑пакета

Варианты:
1) **Source-only**: `build` = typecheck (без emit), runtime всегда из `src/*`.
2) **Dual**: `build` генерирует `dist/*` и декларации, но apps продолжают импортировать `src/*` (риск “двух источников истины”).
3) **Built packages**: `exports` указывает на `dist/*`, apps импортируют build‑артефакты (сильнее дисциплина, но сложнее DX).

Решение влияет на:
- turbo caching и “что считать артефактами”,
- необходимость `transpilePackages`,
- переносимость пакетов вне Next.js.

### 3.2. Server/Client граница в shared UI

Компоненты по умолчанию должны быть server‑safe (без хуков), а интерактив — отдельными экспортами/пакетами.

Нужно закрепить:
- структуру директорий (`src/server/*`, `src/client/*` или subpath exports),
- правила `'use client'` (кто и где имеет право).

### 3.3. Публичный API пакетов (exports)

Нужно выбрать единый стандарт:
- только root barrel (`@synestra/ui`),
- или root + subpath exports (как сейчас),
- и правила именования файлов/папок (kebabCase vs PascalCase для React компонентов).

---

## 4) Следующий шаг (Этап 2 плана)

На основании этого аудита:
- сформировать “таксономию” пакетов (UI/CMS/config/utils) и границы зависимостей между ними,
- затем зафиксировать контракт структуры (файлы, тесты, exports, scripts),
- после чего внедрить `@turbo/gen` генераторы, которые автоматически создают пакеты/компоненты по стандарту.
