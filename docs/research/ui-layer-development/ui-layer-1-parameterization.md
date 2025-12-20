# UI (слой 1): параметризация компонентов (tokens/variants/slots)

Цель слоя 1: дать возможность собирать новые сайты из **единых, совместимых компонентов** без форков, изменяя поведение/вид через “параметры” (примерно как `values` в Helm): токены, варианты, слоты и фича‑флаги.

Контекст `web-core`:
- разные apps могут жить на разных major Tailwind (upstream `website` vs `ecommerce`), поэтому core UI должен быть **Tailwind‑agnostic**;
- Next.js App Router + React Server Components → важно не “размазывать” `'use client'` по дереву.

> Примечание по терминам: в этом документе “слой 1 UI” — это **повторно используемые React‑компоненты** и их стили, которые можно безопасно подключать в разных приложениях. Payload Blocks и “конструктор страниц” — это слой 2 (данные/схемы + рендеринг).

---

## 1) Внешние источники (официальные / первичные)

### Next.js (App Router)

Ниже перечислены страницы, где Next.js **прямо описывает ограничения/рекомендации**, на которых строится подход слоя 1:

- CSS в App Router (Global CSS, CSS Modules, порядок/конфликты, импорт из пакетов):
  - `https://nextjs.org/docs/app/getting-started/css`
- Monorepo/workspace пакеты: `transpilePackages` (когда Next должен транспилировать код зависимостей):
  - `https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages`
- Граница Server/Client Components и директива `'use client'` (важно для библиотеки компонентов):
  - `https://nextjs.org/docs/app/api-reference/directives/use-client`
  - `https://nextjs.org/docs/app/getting-started/server-and-client-components`

### Payload CMS (для последующих слоёв, но важно понимать ограничения UI)

- Custom Components (Admin UI): компоненты админки по умолчанию — Server Components; client boundary добавляется только при необходимости (`'use client'`). Подключение идёт через string‑paths + import map.
  - `https://payloadcms.com/docs/custom-components/overview`
- Blocks Field (для слоя 2): как Payload рекомендует организовывать повторное использование block configs.
  - `https://payloadcms.com/docs/fields/blocks`
  - (не первичный источник, но полезный разбор) `https://payloadcms.com/posts/guides/how-to-build-flexible-layouts-with-payload-blocks`

### Radix (как пример зрелого token-подхода)

- Radix Themes построен на vanilla CSS и предоставляет token‑систему через CSS variables (цвета/радиусы/тени и т.п.); переопределения делаются через переменные темы.
  - `https://www.radix-ui.com/themes/docs/overview/styling`
  - `https://www.radix-ui.com/themes/docs/theme/color`
  - `https://www.radix-ui.com/themes/docs/theme/radius`
  - `https://www.radix-ui.com/themes/docs/theme/shadows`

---

## 2) Выжимка best practices (что “стабильно работает” в Next + монорепо)

### 2.1. Токены (design tokens) через CSS variables

Почему это подходит:
- не зависит от Tailwind major;
- легко переопределять “точечно” на уровне app (как Helm values);
- можно применять на разных уровнях (`:root`, `[data-theme]`, контейнер страницы).

Практическое правило:
- токены всегда с префиксом, чтобы не конфликтовать: `--syn-ui-*`;
- компоненты **не хардкодят** цвета/радиусы/spacing — только читают токены.

Уточнение (Next.js‑специфика):
- в App Router глобальные стили можно импортировать в layout/page, но Next предупреждает, что они **не удаляются при навигации** и могут конфликтовать; поэтому “настоящие глобальные” стили лучше импортировать **один раз** в корневом layout приложения, а не “размазывать” по компонентам.

### 2.2. Variants через `data-*` атрибуты + CSS

Паттерн:
- компонент выставляет `data-variant`, `data-size`, `data-tone` (или аналогичный набор);
- базовые стили задаются классом компонента (`.syn-ui-button`), а вариативность — селекторами по `data-*`.

Это даёт:
- единый API (в TS: `variant?: 'primary' | 'secondary' | ...'`);
- переопределения возможны как через токены, так и через CSS‑слой конкретного app.

Уточнение:
- `data-*` — это строковые атрибуты. Договоритесь о **стабильном, ограниченном** наборе значений (union types в TS) и фиксируйте их в документации пакета, чтобы переопределения в apps не “ломались” при рефакторинге.

### 2.3. Slots (точки расширения) без форка

Рекомендованный подход:
- для крупных компонентов отдавать наружу “слоты” (подкомпоненты/рендер‑функции/обёртки), чтобы app мог заменить только нужную часть;
- для Payload Blocks в слое 2 это превращается в registry “block type → component”.

### 2.4. Server/Client граница

`'use client'` стоит применять **точечно**:
- base UI по умолчанию должно быть server‑safe;
- интерактивность добавляется в app‑слое или отдельными client‑entrypoints.

Уточнение (Next.js‑специфика):
- Next.js описывает `'use client'` как границу: не нужно добавлять директиву “везде”, достаточно поставить её в компоненте, который является точкой входа в client tree.
- Если компонент/пакет становится client‑component, то его props должны быть сериализуемыми при передаче с Server Components.

---

## 3) Решение для `web-core` (слой 1, канон)

### 3.1. Единый слой токенов в `@synestra/ui`

Вводим `@synestra/ui/styles.css` (глобальный слой):
- дефолтные значения токенов `--syn-ui-*`;
- базовые классы компонентов `.syn-ui-*` (без Tailwind).

Подключение в app:
- импортировать `@synestra/ui/styles.css` один раз в корневом layout (`app/layout.tsx`) или в другом “global styles entry” приложения.

Уточнение (важно для монорепо):
- если `@synestra/ui` поставляется как TypeScript без предварительной сборки (или использует синтаксис, который Next не транспилирует из зависимостей), то для корректной сборки app может потребоваться `transpilePackages: ['@synestra/ui']` в `next.config.js`.
- import order важен: чтобы app переопределял токены, импорт `@synestra/ui/styles.css` должен идти **до** app‑специфичных глобальных стилей (например, `apps/<app>/src/app/globals.css`).

### 3.2. API компонентов

Минимальный контракт:
- `className?: string` (escape hatch);
- `variant?: ...`, `size?: ...` (где уместно);
- проставление `data-*` атрибутов для variants.

Уточнение:
- “escape hatch” через `className` полезен, но не должен становиться основным способом стилизации. Если `className` используется постоянно — это сигнал, что не хватает variants/tokens/slots и нужно расширять контракт компонента.

### 3.3. Переопределения “как Helm values”

App может “переопределить только нужное”:
- токены в `apps/<app>/src/app/globals.css` (или аналогичном файле);
- локально на странице/контейнере через `[data-theme]` или “тематический” wrapper.

Уточнение:
- локальные темы стоит делать изолированно (`[data-theme='dark'] { --syn-ui-*: ... }`), чтобы они не “утекали” на соседние страницы/виджеты.

---

## 4) Артефакты, которые должны появиться в репозитории (слой 1)

1) `packages/ui/src/styles.css` + export `@synestra/ui/styles.css` через `package.json#exports` (и/или публикацию в `dist/`).
2) Компоненты `@synestra/ui/*` используют только токены и `data-*` (без inline-стилей).
3) Документация:
   - обновить `packages/ui/README.md` (как подключать styles и как переопределять токены);
   - при необходимости — закрепить норму в `docs/architecture/component-system.md`.

Уточнение:
- убедиться, что CSS не “выкидывается” сборщиком: для пакетов со стилями обычно добавляют `sideEffects` на `*.css` (или эквивалентный механизм), чтобы импорт `@synestra/ui/styles.css` гарантированно учитывался.

---

## 5) Что НЕ делаем в слое 1 (чтобы не усложнять)

- не внедряем “магический резолвер” вида “если файл есть в app — бери его, иначе из packages” (это слой 3);
- не строим полноценный theme manager/provider (можно добавить позже, если появится необходимость).

---

## 6) Пруфы (официальные формулировки, на которые опираемся)

### Next.js: CSS

- Global CSS в App Router не удаляется при навигации, поэтому важно избегать конфликтов и держать глобальные стили действительно глобальными:
  - `https://nextjs.org/docs/app/getting-started/css`
- CSS Modules “scoped by default” и могут импортироваться из любого файла, а глобальные стили обычно импортируют в root layout:
  - `https://nextjs.org/docs/app/getting-started/css`

### Next.js: `'use client'` и граница Server/Client

- `'use client'` задаёт client boundary (не нужно ставить директиву во всех файлах дерева) и накладывает ограничения на сериализуемость props при пробросе из Server Components:
  - `https://nextjs.org/docs/app/api-reference/directives/use-client`
  - `https://nextjs.org/docs/app/getting-started/server-and-client-components`

### Next.js: monorepo packages

- `transpilePackages` — официальный механизм, чтобы Next транспилировал код workspace‑пакетов/зависимостей:
  - `https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages`

### Payload: Admin UI Custom Components

- В Payload 3 custom components по умолчанию Server Components, а client boundary добавляется при необходимости; подключение идёт через component paths + import map:
  - `https://payloadcms.com/docs/custom-components/overview`

### Payload: Blocks Field

- Payload прямо отмечает, что block configs “trivially reusable” между разными полями/коллекциями:
  - `https://payloadcms.com/docs/fields/blocks`
