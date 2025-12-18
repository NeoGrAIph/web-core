# Компоненты: структура и переиспользование

Цель (из курса `Production Monorepos with Turborepo`, последовательно: секции 2/3/4/5/8):

- уменьшить копипаст при создании новых компонентов/пакетов;
- фиксировать стандарты структуры (имена файлов, тесты, экспорты);
- унифицировать компоненты так, чтобы из них получались **универсальные, настраиваемые** блоки для разных apps.

Контекст `web-core`:

- несколько Next.js apps (`apps/*`) с независимыми деплоями;
- общий код живёт в `packages/*`;
- есть несовместимость UI-стека по upstream: Tailwind 3.x vs Tailwind 4.x, поэтому **core UI не должен зависеть от Tailwind** (пока не будет принят единый major).

Официальные источники, на которые опирается этот документ (Next.js 15 / Payload 3):
- Next.js (App Router) CSS / Global styles: `https://nextjs.org/docs/app/getting-started/css`
- Next.js `'use client'` (client boundary + сериализуемость props): `https://nextjs.org/docs/app/api-reference/directives/use-client`
- Next.js Server / Client Components (App Router): `https://nextjs.org/docs/app/getting-started/server-and-client-components`
- Next.js `transpilePackages` (monorepo/workspace пакеты): `https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages`
- Next.js `optimizePackageImports` (когда barrel‑imports становятся тяжёлыми): `https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports`
- Payload Blocks Field (в т.ч. `blockName`, `blockReferences`, реюз block configs): `https://payloadcms.com/docs/fields/blocks`
- Payload Custom Components (Admin UI, component paths, import map): `https://payloadcms.com/docs/custom-components/overview`

---

## 1) Границы (что где живёт)

Базовый принцип из курса: **apps implement, packages reuse**.

### `packages/ui` — общий UI (переиспользуемый)

Назначение:
- примитивы и композиции, которые должны работать в нескольких apps;
- минимальная стилизация через **CSS variables/tokens + props**, без привязки к Tailwind major;
- публичный API через **named exports** (subpath exports), без root‑barrel (явные границы API + меньше рисков циклов/связанности).

Запреты:
- не тянуть app-специфичную бизнес-логику;
- не тянуть Payload-конфиги/модели конкретного сайта;
- не делать “скрытые” зависимости на глобальные стили конкретного app.

Уточнение (Next.js App Router):
- Next.js прямо предупреждает, что Global CSS **не удаляется при навигации** и может вызывать конфликты, поэтому “глобальные” стили (включая `@synestra/ui/styles.css`) импортируем **один раз** в root layout приложения. См. `https://nextjs.org/docs/app/getting-started/css`.
- Если `packages/ui` (или другие workspace‑пакеты) поставляют TypeScript/JS, который Next должен транспилировать как часть приложения, используем `transpilePackages` в `next.config.js` приложения. См. `https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages`.

### Стандарт слоя 1 (tokens/variants/slots) — “как Helm values”

Цель слоя 1: переиспользование UI без форков за счёт “тонких” переопределений в app’ах.

Канон:
- дизайн‑токены задаются через CSS variables с префиксом `--syn-ui-*` (apps могут переопределять только нужные значения);
- компоненты используют `data-*` атрибуты для вариантов (`data-variant`, `data-size`, `data-tone`), чтобы app мог точечно менять стили;
- базовые (дефолтные) стили живут в `@synestra/ui/styles.css` и подключаются один раз на уровне app (в корневом layout);
- inline‑стили (захардкоженные цвета/паддинги) в `packages/ui` не считаются каноном;
- `'use client'` применяется точечно: базовые компоненты должны оставаться server‑safe, интерактивность — через app‑слой или отдельные client entrypoints.

Исследование и ссылки на первичные источники: `docs/research/ui-layer-1-parameterization.md`.

### `packages/cms-blocks` — “контентные блоки” Payload (схемы/типы)

Назначение:
- описания блоков Payload (`blocks`) и их типы, пригодные для повторного использования.

Запреты:
- не тянуть React/Next UI (рендеринг — отдельным слоем);
- не тянуть app-специфичные поля.

### Связка “Payload blocks → React UI” (без копипаста между apps)

Рекомендуемый паттерн (чтобы не дублировать рендеринг блоков в каждом app):

1) `packages/cms-blocks` задаёт **тип данных блока** (и Payload schema).
2) В каждом app живёт **registry** “тип блока → React компонент” (тема/обёртки остаются в app).
3) Общий рендерер (опционально) может жить в `packages/*` и принимать registry как параметр:
   - `renderBlocks(blocks, registry)` (pure функция) или `<BlocksRenderer blocks registry />`.

Это даёт:
- единый контракт блоков (данные одинаковые),
- независимую тему/стили в каждом app,
- минимальный копипаст при добавлении нового блока (добавили schema + компонент + регистрация).

Подтверждение в Payload docs:
- Payload рекомендует держать каждый block config в отдельном файле и импортировать в Blocks Field — это “trivializes their reusability” между разными полями/коллекциями (например, Pages и Posts). См. `https://payloadcms.com/docs/fields/blocks`.

Практика `web-core`:
- shared‑хелпер для рендера блоков живёт в `packages/blocks-renderer` (`@synestra/blocks-renderer`);
- app‑слой сохраняет registry и обёртки (spacing/containers), чтобы не “протекал” дизайн между сайтами.
  - если в конкретном app/shared ещё нет `@synestra/blocks-renderer`, временно допускается локальный `renderBlocks` в app с последующим выносом.

Нюансы (Payload Blocks):
- `blockReferences` (оптимизация больших схем) **не включаем по умолчанию**, потому что referenced блоки “замораживают” конфиг: в docs прямо сказано, что referenced blocks **не могут быть изменены/расширены** на уровне поля и должны совпадать 1:1 с оригиналами. См. `https://payloadcms.com/docs/fields/blocks`.
- `blockName` используем точечно (сложные страницы/лендинги, когда редакторам важно различать “однотипные” блоки). Payload описывает `blockName` как override для UI‑label строки блока. См. `https://payloadcms.com/docs/fields/blocks`.
  Детали (проектные соглашения): `docs/research/payload/payload-blocks-best-practices.md` и `docs/research/ui-layer-2-registry.md`.

### `apps/*` — интеграция, тема и “конечная сборка страниц”

Назначение:
- композиции уровня продукта/сайта;
- стилизация (Tailwind 3/4, глобальные стили, темы);
- связка “Payload данные → блоки → UI”, включая маршрутизацию/кеш/preview.

Практическое правило:
- если компонент “про данные/поведение конкретного сайта” — он в app;
- если компонент “про общий UI-контракт и его можно применить ≥2 apps” — он кандидат в `packages/ui`.

---

## 2) Типы компонентов (слои библиотеки)

Чтобы не превращать `packages/ui` в “свалку”, делим компоненты на уровни:

1) **Primitives** — маленькие, максимально универсальные:
   - `Button`, `Card`, `Text`, `Container`, `Stack`, `Input`…
2) **Composed** — композиции из primitives без доменной логики:
   - `ModalShell`, `Field`, `Callout`, `Pagination`…
3) **Domain UI (опционально, отдельными пакетами)** — если появится домен:
   - `packages/marketing-ui` (корпоративный сайт/лендинги),
   - `packages/commerce-ui` (каталог/карточки товаров).

Правило переноса:
- (в духе секции 3 курса) сначала делаем в app, затем — выносим в shared при появлении стабильного повторного использования.

---

## 3) Публичный API и структура файлов (стандарты)

### Импорты (как в курсе: named exports)

#### Внутри shared‑пакетов (`packages/*`)

Предпочтительный стиль (subpath exports):

- `import { Button } from '@synestra/ui/button'`

Запрещаем deep-imports вида:
- `@synestra/ui/src/...` (ломает инкапсуляцию и усложняет рефакторинг).

Уточнение (Next.js):
- Если пакет начинает разрастаться, у Next.js есть официальный механизм `experimental.optimizePackageImports`, но архитектурно проще держать основной путь импорта через subpath exports (`@synestra/ui/button`).

#### Внутри apps (`apps/*`)

Канон для возможности **точечных file overrides** (слой 3): apps импортируют UI не из shared‑пакетов, а через app‑фасад.

- ✅ `import { Button } from '@/ui/button'` (или `import { Button } from '@/ui'`)
- ❌ `import { Button } from '@synestra/ui/button'` (в app‑коде)

Фасад по умолчанию — это wrapper‑файлы, которые просто реэкспортят shared реализацию:
- `apps/<site>/src/ui/button.tsx` → `export { Button } from '@synestra/ui/button'`

Когда конкретному сайту нужен отличающийся UI — этот же файл становится override’ом и экспортирует локальную реализацию:
- `apps/<site>/src/ui/button.tsx` → `export { Button } from '@/components/ui/button'` (или другая site‑локальная реализация)

Источники:
- Next.js Absolute Imports / Module Aliases: `https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases`
- Канон слоя 3: `docs/research/ui-layer-3-file-overrides.md`

### Рекомендуемая структура `packages/ui` (эволюционная)

Пока компонентов мало — допустима “плоская” структура (как сейчас):

```
packages/ui/src/
  button.tsx
  button.test.tsx
  card.tsx
  index.ts
```

Когда компонентов станет много — группируем по слоям, сохраняя внешний API через exports:

```
packages/ui/src/
  primitives/
    button/
      button.tsx
      button.test.tsx
      index.ts
    card/
      card.tsx
      card.test.tsx
      index.ts
  composed/
    modal-shell/
      modal-shell.tsx
      modal-shell.test.tsx
      index.ts
  client/
    modal/
      modal.tsx
      modal.test.tsx
      index.ts
  index.ts
```

Снаружи это остаётся стабильным:
- `@synestra/ui/button`
- `@synestra/ui/modal-shell`
- `@synestra/ui/client/modal` (или другой согласованный префикс)

### Имена файлов

- файл компонента: `kebab-case` (например, `button.tsx`, `modal-shell.tsx`);
- тест рядом: `button.test.tsx`;
- если компонент требует клиентского рантайма — отдельный “client export” (см. ниже).

### Минимальный контракт компонента

Каждый компонент в `packages/ui`:
- принимает `className?: string` (как “escape hatch” для apps);
- фиксирует минимум `variant`/`size` через union-типы (если применимо);
- не навязывает Tailwind-классы.

---

## 4) Универсальность и настраиваемость (паттерны)

### 4.1 Variants вместо копипаста

Как в уроке про `Button variant` (секция 2 курса):
- вместо двух почти одинаковых компонентов вводим `variant` (`'primary' | 'secondary' | …`);
- стили переключаются либо через CSS variables, либо через `data-атрибуты`.

Рекомендуемый базовый механизм:
- компонент выставляет `data-variant`, `data-size`, `data-tone`;
- app-слой (Tailwind 3/4 или обычный CSS) решает, как именно это стилизовать.

### 4.2 Композиция вместо “монолитов”

Как в уроке про `SnippetCard = Card + CodeBlock` (секция 3 курса):
- делаем маленькие “кирпичи”;
- собираем более крупные компоненты как композиции;
- избегаем доменных зависимостей в `packages/ui`.

### 4.3 Server/Client граница (Next.js App Router)

Практическое правило:
- по умолчанию компоненты в `packages/ui` должны быть **server-safe** (без хуков);
- интерактивные вещи (hooks/state/порталы) — отдельными экспортами, например:
  - `@synestra/ui/client/modal` (или отдельный пакет `@synestra/ui-client`).

Это снижает “расползание” `'use client'` по дереву.

Подтверждение в Next.js docs:
- директива `'use client'` задаёт client boundary (entrypoint) и не должна “дублироваться” во всех файлах дерева;
- при передаче props из Server Components в Client Components действуют ограничения (props должны быть сериализуемыми).
См. `https://nextjs.org/docs/app/api-reference/directives/use-client`.

---

## 5) Тестирование и регрессии

Как в секции 5 курса:
- `packages/ui` — первая “точка отказа”, поэтому тесты обязательны хотя бы для primitives;
- минимальный стандарт: Vitest + Testing Library, тесты рядом с компонентом.

Рекомендация по приоритету:
- primitives: тестируем обязательно;
- composed: тестируем поведение/контракт, не “пиксели”;
- app-специфичное: тестируем в app (или e2e позже).

---

## 6) Генераторы (как убрать копипаст)

Как в секции 8 курса:
- внедряем `@turbo/gen` после стабилизации структуры `packages/ui`;
- генератор должен создавать:
  - файл компонента,
  - файл теста,
  - добавление экспорта в `packages/ui/src/index.ts`
  - (опционально) добавление subpath export в `packages/ui/package.json`, если мы решим полностью “named exports only”.

Предлагаемые команды (целевой UX):
- `turbo gen ui:component` → primitive/composed (с выбором),
- `turbo gen ui:client-component` → компонент с client-границей,
- `turbo gen package` → новый shared package по стандарту `@synestra/<name>`.

---

## 7) Чеклист “вынести в shared”

Компонент кандидат в `packages/ui`, если:
- используется или планируется в ≥2 apps;
- API можно стабилизировать (понятные props, нет “случайных” зависимостей);
- он не зависит от конкретного Payload-конфига/коллекций;
- есть тест (или компонент слишком простой и тест очевиден/дешёвый).

Компонент остаётся в app, если:
- привязан к домену конкретного сайта (контент, фичи, аналитика, AB);
- зависит от окружения/маршрутов/данных, характерных только для одного app;
- это временная итерация, и API “плывёт”.

---

## 8) Процесс добавления нового UI-компонента (Definition of Done)

1) Определить слой:
   - primitive / composed / client / domain(app).
2) Создать компонент и типы props:
   - обязательно `className?: string` (и при необходимости `variant/size`).
3) Добавить тест (минимум: “рендерится/детерминированно работает”).
4) Экспортировать через публичный API:
   - `packages/ui/src/index.ts` (и при необходимости subpath export в `packages/ui/package.json`).
5) Заменить копипаст в app(ах) на импорт из `@synestra/ui/*`.
6) Проверить, что компонент не тащит Tailwind-специфику и не требует `'use client'` без причины.
