# Monorepo / `packages/*`: стандарты и решения (вопрос №4)

Статус: в работе, актуальность **2025-12-17**.  
Цель: уменьшить копипаст, зафиксировать стандарты структуры/экспортов/тестов и сделать shared‑пакеты безопасными для независимых деплоев `apps/*`.

Связанные документы:
- Аудит “как сейчас”: `docs/architecture/monorepo/monorepo-packages-audit.md`
- UI‑слой и переиспользование: `docs/architecture/component-system.md`

---

## Решение 1: формат пакетов — **source packages по умолчанию**

### Что это значит

Для большинства внутренних пакетов `@synestra/*`:
- `main` / `types` / `exports` указывают на `src/*`;
- приложения (`apps/*`) транспилируют workspace‑код через Next.js `transpilePackages`;
- `build` выполняет **typecheck без emit** (`tsc --noEmit`), а runtime‑источник истины остаётся `src/*` (собирается Next’ом).

Это уже соответствует текущей реализации (см. `packages/*/package.json`) и нашему Docker‑потоку (`turbo prune --docker` → `next build`).

### Почему это лучше для `web-core` сейчас

1) **DX и скорость**: изменения в `packages/*` сразу видны в `apps/*` без обязательного rebuild пакета.
2) **Совместимость с Payload 3**: Payload config и CLI в наших apps работают в ESM/TS окружении; наличие исходников в runtime образе упрощает миграции/импорт‑map.
3) **Проще стандартизировать**: меньше “двух источников истины” (`src` vs `dist`), меньше проблем с project references/bundling на старте.

### Цена

- каждый app должен корректно поддерживать `transpilePackages` для всех workspace‑пакетов, которые он импортирует;
- “build пакета” становится про качество (typecheck/tests), а не про подготовку runtime‑артефактов.

---

## Исключения: когда допускаются built‑packages (`dist/*`)

Built‑пакеты допустимы как осознанное исключение, если:
- пакет планируется публиковать наружу (или использовать вне Next.js),
- нужен стабильный JS‑артефакт (например, для node‑рантайма без transpile),
- пакет тяжёлый и вы хотите жёстко контролировать “что именно попадёт в consumers”.

В таком случае фиксируем отдельный стандарт:
- `exports` указывает на `dist/*`,
- есть watch/build‑поток для локальной разработки,
- есть решение по module format (ESM/CJS) и target.

До принятия такого решения считаем built‑вариант **не каноничным** для `web-core`.

---

## Следующее решение (Решение 2)

---

## Решение 2: module format — **ESM по умолчанию для внутренних TS‑пакетов**

Стандарт:
- все пакеты с TypeScript‑исходниками в `packages/**` и `packages/plugins/**` объявляются как ESM: `type: "module"`;
- если где-то нужен CJS, это оформляется явно через расширения файлов (`*.cjs`) или отдельный пакет/entrypoint.

Почему:
- Payload 3 и Next 15 в нашем стеке ESM‑friendly, и смешанный режим усложняет резолв/экспорты;
- генераторы и стандарты становятся проще: один “каноничный” формат, меньше условных веток.

Исключения:
- “конфиг‑пакеты” без TS‑кода (например `packages/typescript-config`) могут не иметь `type`;
- файловые конфиги вида `next-sitemap.config.cjs` остаются CJS по расширению.

---

## Таксономия пакетов (что куда выносить)

Цель таксономии: чтобы команда могла “угадывать” место нового кода без обсуждений и без копипаста.

### 1) `packages/ui` — общий UI (React)

Назначение:
- primitives/composed компоненты, которые должны жить в 2+ apps;
- **server‑safe по умолчанию**, client‑интерактив — отдельными экспортами.

Запреты:
- не зависеть от конкретного app (роуты, аналитика, фичефлаги, контент‑логика);
- не тащить Payload config/collections (CMS слой отдельно);
- избегать жёсткой привязки к Tailwind major (пока в upstream 3.x vs 4.x).

### 2) `packages/cms-*` — Payload schema/типы/серверные хелперы

Подсемейства:
- `packages/cms-core`: общие коллекции/access patterns, которые одинаковы для сайтов (например `Users`).
- `packages/cms-blocks`: общие “content blocks” как **schema+types**, без React‑рендера.
- `packages/cms-ecommerce`: ecommerce‑специфичные schema/helpers.
- `packages/cms-fields`: shared field builders (например `link`, `linkGroup`) для вынесения schema в `packages/cms-blocks` без зависимостей на `apps/*`.

Запреты:
- не завязываться на UI конкретного app;
- admin React components допускаются, но подключаются через Import Map; предпочтение — app‑local entrypoints (см. `docs/research/payload/payload-admin-custom-components-best-practices.md`).

### 3) `packages/utils` — чистые утилиты

Назначение:
- “безопасные” функции без зависимостей на Next/Payload (или с очень ограниченными, явно обозначенными);
- кандидаты на дальнейшее переиспользование между apps и пакетами.

Правило:
- если утилита становится Next‑специфичной — лучше выделить отдельный пакет (например `@synestra/next-utils`), чем “размывать” `utils`.

### 4) `packages/env` — env‑контракт (Zod) и валидация

Единый источник правил “что обязательно в stage/prod”, без вывода секретов.

### 5) `packages/eslint-config`, `packages/typescript-config` — shared configs

Инфраструктурные пакеты; их API должен быть максимально стабильным.

### 6) `packages/plugins/*` — Payload plugins

Правило:
- имя пакета: `@synestra/payload-plugin-<name>`;
- не импортировать код из `apps/*`.

---

## Граф зависимостей (правила слоёв)

### Базовое правило

`apps/*` могут зависеть от `packages/*`, но `packages/*` **никогда** не зависят от `apps/*`.

### Матрица “что может зависеть от чего”

- Слои (упрощённо):
  - `apps/*`
    - `packages/ui` → (`packages/utils`)
    - `packages/cms-*` → (`packages/utils`, `payload/*`)
    - `packages/plugins/*` → (`packages/utils`, `payload/*`)
    - `packages/env`
    - `packages/*-config`

- `apps/*` → `ui`, `cms-*`, `plugins`, `utils`, `env`, `config`
- `packages/ui` → `utils` (и внешние UI библиотеки), но **не** → `cms-*`, `plugins`, `env`
- `packages/cms-*` → `utils` (и `payload`/официальные payload‑пакеты), но **не** → `ui`, `apps/*`
- `packages/plugins/*` → `utils` и `payload`, но **не** → `ui`, `apps/*`
- `packages/env` → внешние зависимости (Zod), но **не** → `apps/*`
- `packages/*-config` → только внешние зависимости

Рationale:
- UI слой должен оставаться “переносимым” и не тащить CMS/окружение;
- CMS слой должен оставаться “серверным” и не тащить React‑UI;
- `env` должен оставаться нейтральным и не завязываться на конкретный app.

### Текущее фактическое состояние (срез)

Сейчас зависимости между пакетами минимальны (в основном только dev‑зависимость на `@synestra/typescript-config`), а `apps/*` используют `@synestra/*` как прямые workspace deps.

---

## Правила для `apps/*` (снятие копипаста)

### 1) `next.config.mjs` — используем `@synestra/next-config`

Стандарт:
- в каждом app `next.config.mjs` экспортируется через `createSynestraNextConfig`;
- `transpilePackages` формируется автоматически из workspace‑`dependencies` (`@synestra/*`), чтобы не было ручного рассинхрона:
  - прямые зависимости app’а;
  - и (по умолчанию) транзитивные workspace‑зависимости этих пакетов.

Паттерн:
- простые apps: `export default createSynestraNextConfig()`
- apps с кастомным config: `export default createSynestraNextConfig({ nextConfig, payloadOptions })`

Пакет: `packages/next-config`.

### 2) Workspace deps — только явные

Правило:
- любой импорт `@synestra/*` в коде app должен соответствовать записи в `dependencies` app’а;
- иначе автосборка `transpilePackages` не сможет корректно отработать, и вы получите “скрытую” зависимость.

Уточнение:
- если app **не импортирует** пакет напрямую, а получает его как транзитивную зависимость (например `@synestra/cms-blocks` → `@synestra/cms-fields`), то отдельная запись в `dependencies` app’а не обязательна;
- но сам package **обязан** объявлять свои workspace‑deps явно в своём `package.json`, иначе граф зависимостей не будет корректно вычисляться.
