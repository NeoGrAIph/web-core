# research.md

## Контекст

Мы отделяем платформенную инфраструктуру Kubernetes от продуктовой разработки сайтов:

- `~/synestra-platform` — GitOps‑репозиторий инфраструктуры (Argo CD, ingress, cert-manager, Keycloak, операторы БД/observability и т.д.) и централизованных секретов.
- `~/repo/web-core` — монорепозиторий сайтов (код, общие пакеты, инструменты разработки) и декларативные шаблоны деплоя приложений, которые будут применяться через Argo CD.

Задача появилась из практического вывода: «все сайты в одном deployment» рискованно и часто нецелесообразно. Мы хотим спроектировать систему так, чтобы монорепа ускоряла разработку, но деплой и эксплуатация оставались изолированными и управляемыми.

## Цели исследования (что нужно прояснить и спроектировать)

### 1) Архитектура монорепозитория `web-core`

- Определить целевую структуру монорепы для нескольких классов сайтов (корпоративный, интернет‑магазин, SaaS‑веб‑интерфейс, группа лендингов).
- Заложить переиспользование общего кода через `packages/*` (UI‑компоненты, дизайн‑система, утилиты, конфиги).
- Определить контракт сборки: как приложения собираются локально и в CI, какие артефакты производятся, как версионируются.

### 2) Шаблон деплоя для Argo CD (приложения как независимые deployments)

- Спроектировать способ описания и развертывания приложений через Argo CD так, чтобы каждый класс сайтов деплоился отдельно (минимум: `corporate`, `shop`, `saas`, `landings`).
- Принять модель изоляции: **отдельный namespace и отдельная база данных на каждый deployment**.
- Спроектировать “environment layering”: `dev` → `stage` → `prod`, при этом на раннем этапе реально используем и публикуем только `dev` (без усложнения процессов).

### 3) Границы ответственности и взаимодействие репозиториев

- Зафиксировать, что относится к платформе (`synestra-platform`), а что — к приложениям (`web-core`), чтобы избежать конфликтов владения ресурсами и “drift”.
- Выстроить контракт секретов: секреты хранятся централизованно в `synestra-platform`, а в `web-core` используются только ссылки на Secret’ы/ключи и не‑секретные параметры.
- Определить, где живёт CI сборки образов (на текущем этапе — GitLab pipeline в `synestra-platform`) и как он получает исходники/контекст из `web-core`.

### 4) Workflow быстрой разработки (hot dev)

- Найти и выбрать современный, переносимый подход к “горячей” разработке, который не завязан на `hostPath` и конкретную ноду (или, если временно завязан — чётко отделить dev‑shortcut от прод‑подхода).
- Сформулировать минимальный “developer loop”: запуск, обновление кода, просмотр результата по доменам/ингрессу, доступ к логам/трейсам.

## Что мы должны получить в результате исследования (ожидаемые результаты/артефакты)

По итогам исследования должны быть готовы следующие результаты, чтобы можно было начинать реализацию без архитектурных провалов:

1. **Зафиксированная целевая архитектура** (документированная):
   - границы `synestra-platform` vs `web-core`,
   - модель окружений `dev/stage/prod` и как происходит promotion,
   - модель изоляции (namespace+DB per deployment),
   - стратегия для лендингов (один deployment на группу или дробление).

2. **Репозиторная структура `web-core`**, пригодная для роста:
   - директория деплоя (Helm chart/values/overlays) и шаблоны Argo CD.

3. **Базовый шаблон деплоя (Kubernetes/Argo CD)**:
   - единый Helm chart (или набор charts) для типового веб‑приложения,
   - пример конфигурации для минимум 4 deployments (`corporate/shop/saas/landings`) в `dev`,
   - понятная схема именований (namespaces, releases, ingress hosts, service names).

4. **Контракт CI/CD для образов**:
   - как собирать образы из монорепы (и как получать исходники в pipeline `synestra-platform`),
   - как тэгировать/продвигать образы между окружениями,
   - какой минимум метаданных нужен Argo CD (image tags/refs) для синхронизации.

5. **Выбранный подход к hot‑разработке** + краткий runbook:
   - выбран один основной инструмент/метод,
   - описан процесс для разработчика (setup → dev → debug),
   - обозначено, что считается “dev‑only” и не попадёт в `stage/prod`.

## Критерии готовности исследования

Исследование можно считать завершённым, когда:

- Мы можем создать новый сайт в `apps/<name>` и задеплоить его в `dev` как отдельный ArgoCD Application без ручных шагов в кластере.
- Для каждого deployment понятны: namespace, ingress/hostnames, Secret’ы (только ссылки), база данных (отдельная), ресурсы/масштабирование.
- Переиспользование общего кода работает (минимум: общие UI/утилиты подключаются без копипасты).
- CI сборки образов воспроизводим (локально и в GitLab), а артефакты чётко привязаны к версиям/коммитам.

## Конспект изученных материалов

### Vercel Academy — Production Monorepos

Источник: `https://vercel.com/academy/production-monorepos`

Статус доступа:
- На момент автоматического чтения (2025‑12‑13) страницы курса/уроков закрыты без авторизации и при запросе без токена возвращают `forbidden` (“missing authentication token”).
- Для исследования мы используем **текст страниц, предоставленный пользователем в чате** (ссылка + содержимое).

Краткий конспект страницы (по присланному содержимому):
- Курс предлагает построить “GeniusGarage” (платформу управления code snippets) как учебный пример.
- Проблематика polyrepo описана на примерах:
  - изменение UI‑компонента требует обновления и деплоя в нескольких репозиториях,
  - конфиги (например ESLint) копируются и рассинхронизируются,
  - сборки дольше из‑за отсутствия кеширования между связанными изменениями,
  - релиз‑координация усложняется и ломает команды.
- Заявленный тезис: монорепозитории устраняют эти проблемы; Turborepo даёт “интеллектуальное” кеширование для ускорения.

Что именно покрывает курс (8 секций):
- Monorepo fundamentals (что это, когда применять, зачем Turborepo).
- Первый shared package: общий UI (Button/Card).
- Второе приложение: повторное использование общего UI.
- Shared configs & utils: DRY для TypeScript/ESLint + утилиты.
- Testing: Vitest в UI‑пакете + test caching.
- Pipeline optimization: CI, filtering, remote caching.
- Scaling to multiple apps: docs app + независимые деплои.
- Enterprise patterns: generators, changesets, governance, next-forge.

Применение к нашей архитектуре:
- Эта страница подтверждает выбранную нами стратегию: `web-core` как монорепа для скорости разработки, но с независимыми deployments (минимум: corporate/shop/saas/landings).
- “Shared packages/configs/utils” напрямую мапятся на `packages/ui`, `packages/config`, `packages/utils` в `web-core` и помогают избегать дублирования.
- Упор на кеширование и метрики означает, что нам нужно заранее заложить:
  - единые команды `build/lint/test` (turbo),
  - возможность кеша в CI (как минимум локальный cache, потенциально remote),
  - измеряемые критерии (время сборки, cache hit rate) в пайплайне.
- “Independent deploys” из секции про scaling совпадают с нашим решением “не один deployment на всё”.

### Vercel Academy — Monorepos vs Polyrepos

Источник: `https://vercel.com/academy/production-monorepos/monorepos-vs-polyrepos`

Краткий конспект (по присланному содержимому):
- Вопрос урока: монорепа (один репозиторий для связанных проектов) vs polyrepo (отдельные репозитории на проект) — это выбор, который влияет на координацию изменений, управление зависимостями и скорость поставки.
- Ключевая идея: **polyrepo создаёт “coordination tax”** — время/усилия на синхронизацию изменений между репозиториями.
- Показательная симуляция polyrepo (4 репозитория: UI, web, app, docs) при изменении API `Button`:
  - отдельный PR и CI в UI‑репозитории,
  - публикация версии (`npm version`/`npm publish`),
  - обновления зависимостей и правки потребителей в каждом репозитории, снова PR и CI,
  - итог: 4 PR, версия‑менеджмент, ожидания review/CI, координация релизов.
- Что монорепа даёт взамен:
  - **atomic changes**: изменение интерфейса и всех потребителей в одном коммите,
  - **TypeScript verification**: компилятор сразу подсвечивает все места, где сломались контракты после изменения общего пакета,
  - единый инструментарий (TS/ESLint/tests) без копирования конфигов по репозиториям.
- Когда выбирать что:
  - **Monorepo подходит**, если есть несколько связанных приложений с общим кодом (UI/утилиты/конфиги), частые “сквозные” изменения, важны атомарные коммиты и консистентное tooling.
  - **Polyrepo подходит**, если проекты действительно независимы: разные стеки, разные команды и циклы релизов, строгая изоляция/доступы, отсутствие общего кода.
- Практическое правило:
  - если проекты делят “больше чем конфиги” — чаще всего монорепа выгоднее;
  - при сомнениях — начинать с монорепы; разнести монорепу на несколько репо возможно (хотя и болезненно), а объединить несколько репо с сохранением истории — часто ещё сложнее.

Что это означает для `synestra-platform` и `web-core`:
- Наше текущее разделение “инфра отдельно, веб‑продукты отдельно” — это осознанный компромисс: на уровне компании остаются разные домены ответственности/инструментарии, но **внутри домена веб‑продуктов** монорепа снижает coordination tax за счёт общего UI/утилит/конфигов.
- Для `web-core` это усиливает требование “атомарных изменений”: общий пакет (например `packages/ui`) меняется вместе с потребителями (`apps/*`) одним MR, а CI должен уметь проверять затронутые части без пересборки всего подряд (filtering + caching).

### Vercel Academy — Understanding Monorepos

Источник: `https://vercel.com/academy/production-monorepos/understanding-monorepos`

Краткий конспект (по присланному содержимому):
- Сценарий: маркетинговый сайт + веб‑приложение + документация, которые делят UI‑компоненты, утилиты и TypeScript‑конфиги. В polyrepo это превращается в ручную координацию: 3 PR, 3 CI прогона, “version juggling” ради простого обновления общего компонента.
- Идея монорепы: объединить связанные проекты в одном Git‑репозитории при сохранении “границ” (clear boundaries) и возможности использовать более мощные инструменты сборки/кеширования.
- “Fast track” подход: сначала деплой в прод (Vercel), затем изучение структуры и логов сборки, после — локальная разработка.
- Пример структуры:
  - `apps/` — деплоимые приложения (в примере `apps/web` — маркетинговый Next.js),
  - `packages/` — общий код (появится позже, но уже прописан в workspace),
  - `pnpm-workspace.yaml` — определяет, что `apps/*` и `packages/*` являются workspace packages,
  - `turbo.json` — конфигурация оркестрации задач,
  - `package.json` в корне — координация задач через `turbo run ...`, минимальные devDependencies, фиксация `packageManager` и требований к Node.
- Принцип “root coordinates, apps implement”:
  - root scripts запускают `turbo run <task>`,
  - в `apps/web/package.json` — стандартные `next dev/build/start/lint`.
- Практика remote caching:
  - Vercel автоматически включает Turborepo Remote Caching,
  - в build logs видны “Packages in scope”, “Remote caching enabled”, “cache hit / FULL TURBO” и метрики задач/кеша.
- “Monorepo ≠ Monolith”: монорепа (структура кода) не определяет монолитность/микросервисы; деплой‑архитектура — отдельный вопрос.

Что это означает для `web-core` (решения/требования):
- Структура `apps/*` + `packages/*` уже совпадает с нашим направлением; важно поддерживать её как контракт для tooling и CI.
- В корне `web-core` стоит:
  - держать scripts через `turbo run ...` (build/dev/lint/test),
  - фиксировать toolchain (Node/pnpm) через `engines` + `packageManager`, чтобы разработчики и CI работали одинаково,
  - держать минимум devDependencies (координатор, форматтер, линтеры уровня repo).
- Внутри приложений (`apps/<name>`) — “обычные” скрипты framework’а и зависимости приложения, без усложнения “оркестратором”.
- Для CI (GitLab) нам нужен эквивалент “remote caching enabled”: решить, используем ли remote cache Turborepo и где он живёт (или как минимум стандартизировать локальный кеш на раннем этапе).

### Vercel Academy — Turborepo Basics

Источник: `https://vercel.com/academy/production-monorepos/turborepo-basics`

Краткий конспект (по присланному содержимому):
- Проблема, которую решает Turborepo в монорепе: без него даже “неизменившиеся” части пересобираются, а порядок сборки зависимостей нужно координировать вручную.
- Два ключевых механизма:
  - **интеллектуальное кеширование** (hash-based caching),
  - **автоматическая оркестрация задач** (строит граф и запускает зависимости раньше потребителей).
- Базовый эксперимент:
  - первый `turbo build` — cache miss и “полная” сборка,
  - повторный `turbo build` без изменений — cache hit и кратное ускорение,
  - изменение файла — cache invalidation и пересборка,
  - возврат к прежнему состоянию — Turborepo находит старый кеш по хешу и восстанавливает артефакты.
- Что участвует в кеш-ключе (инпутах):
  - исходники,
  - зависимости (`package.json`),
  - env vars (те, что объявлены в конфиге Turborepo),
  - конфигурационные файлы.
  Любое изменение → другой хеш → cache miss.
- Инструменты диагностики:
  - `turbo build --dry-run` показывает план: пакет, команду, хеш, cached local/remote, outputs, зависимости/потребители, и лог‑файл задачи.
- Пример `turbo.json` (Turborepo 2.x паттерн):
  - `globalDependencies`: файлы, изменение которых инвалидирует кеш **для всех** задач/пакетов (пример: `**/.env.*local`),
  - `tasks.build.dependsOn: ["^build"]` — “сначала собери build у зависимостей”,
  - `tasks.build.outputs` определяет, что кешировать (пример: `.next/**`, исключая `!.next/cache/**`),
  - `tasks.dev.cache: false` и `persistent: true` — dev‑серверы не кешируются и считаются long‑running.

Что это означает для `web-core` (решения/требования):
- Мы должны проектировать `turbo.json` как контракт производительности и корректности:
  - явно описать `outputs` для build/test задач (особенно для Next.js, чтобы кеш был эффективным и детерминированным),
  - использовать `dependsOn: ["^build"]`/`["^lint"]`/`["^test"]` для правильного порядка в графе пакетов.
- Нужно заранее согласовать стратегию env‑влияния на кеш:
  - какие env‑файлы считаем “globalDependencies” (инвалидируют всё),
  - какие переменные объявляем как `env` для конкретных задач,
  - как это сочетается с тем, что секреты живут в `synestra-platform` (то есть локальные `.env.*local` должны быть dev‑only и не попадать в репозиторий).
- В CI (GitLab) цель — приблизиться к эффекту “17x speedup”:
  - минимум: корректно сохранять/восстанавливать локальный turbo cache между job’ами/пайплайнами (если возможно),
  - оптимум: включить remote caching (нужно выбрать провайдер/хранилище/интеграцию и правила доступа).

### Vercel Academy — Add Features Page

Источник: `https://vercel.com/academy/production-monorepos/add-features-page`

Краткий конспект (по присланному содержимому):
- Урок намеренно вводит **дублирование** в рамках одного приложения, чтобы было что извлекать в shared package на следующем шаге.
- Задача: добавить роут `/features` в Next.js App Router и собрать страницу “Features” с:
  - навигацией (логотип + ссылка Features),
  - заголовком и описанием,
  - сеткой из 6 “карточек” (Card) **в виде повторяющихся inline `<div>`** с одинаковой структурой и inline‑стилями.
- Дополнительно: добавить ссылку “Features” на домашнюю страницу, чтобы навигация работала в обе стороны.
- Упор на проблеме:
  - одинаковые стили и разметка повторяются (nav, cards, button),
  - это быстро становится “maintenance nightmare”, когда появляется второй app и нужно копировать UI между приложениями.
- Предлагаемое сообщение коммита: `feat(web): add features page with inline components`.
- Следующий урок обещает создать `packages/ui` и извлечь Card в общий пакет с импортом в стиле `@geniusgarage/ui/card`.

Что это означает для `web-core` (решения/требования):
- Нам полезно осознанно пройти тот же путь: сначала допускаем локальную “инлайн‑верстку” в рамках одного приложения, а затем **выделяем общий UI в `packages/ui`** как только появляется второй потребитель или повторение.
- Структура `apps/<app>/app/...` (Next.js App Router) — хороший “минимальный контракт” для приложений в монорепе; компоненты, которые повторяются между `apps/*`, должны жить в `packages/*`.
- Стоит заранее выбрать стандарт импорта/нейминга общего UI‑пакета (аналог `@geniusgarage/ui/...`), чтобы extraction не приводил к постоянным переименованиям.

### Vercel Academy — Create UI Package Structure

Источник: `https://vercel.com/academy/production-monorepos/create-ui-package`

Краткий конспект (по присланному содержимому):
- Цель: создать workspace‑пакет `packages/ui`, куда можно извлекать общие React‑компоненты из приложений (после намеренно продублированных inline card’ов).
- Структура пакета: `packages/ui/src/*` + `packages/ui/package.json` + `packages/ui/tsconfig.json` + `packages/ui/src/index.ts` (пока пустой).
- Конфигурация пакета (важные идеи):
  - пакет имеет **scoped name** (в примере `@geniusgarage/ui`),
  - React указывается как **peerDependencies**, чтобы приложения предоставляли React и не возникало двух инстансов React,
  - `exports` подготавливается под **named exports pattern** (каждый компонент имеет собственный import path, например `@geniusgarage/ui/card` через `exports: { "./card": "./src/card.tsx" }`),
  - TypeScript настроен на JSX и генерацию типов (`declaration: true`), а модульное разрешение — `bundler`.
- Регистрация в workspace: после создания директории достаточно `pnpm install`, чтобы pnpm “увидел” новый пакет, и он появился в `pnpm list --depth 0`.
- Рекомендация по коммиту: `feat(ui): create ui package structure`.

Замечание по корректности текста урока:
- В чек‑листе “Done-when” сказано, что `packages/ui/tsconfig.json` “extends `@tsconfig/nextjs`”, но в приведённом примере `tsconfig.json` **не** содержит `extends`. Для нашей реализации нужно явно выбрать один из вариантов (наследование от общей базы в монорепе или самостоятельные compilerOptions).

Что это означает для `web-core` (решения/требования):
- Нам нужен первый “официальный” shared package: `packages/ui`.
- Требуется решить стандарт нейминга (см. открытый вопрос): например `@synestra/ui` или `@web-core/ui`, и закрепить его во всех примерах/шаблонах.
- Для общего UI‑пакета:
  - использовать **named exports** (стабильные import paths вида `@…/ui/card`), чтобы не превращать `index.ts` в огромный barrel и не ухудшать tree-shaking,
  - держать React как **peerDependencies**,
  - настроить TypeScript так, чтобы типы генерировались и потребители получали корректные `.d.ts` (возможны варианты: `declaration` + сборка, или TS‑source imports при сборке Next — решение нужно зафиксировать).

### Vercel Academy — Extract Card Component

Источник: `https://vercel.com/academy/production-monorepos/extract-card`

Краткий конспект (по присланному содержимому):
- Исходная проблема: 6 одинаковых card‑блоков (inline `<div>` со стилями) в `features` странице — любое изменение требует правки в 6 местах и стимулирует копипасту на новые страницы.
- Решение: вынести Card в `packages/ui` и заменить повторяющиеся `<div>` на `<Card>` в приложении.
- Технические шаги:
  1. Создать `packages/ui/src/card.tsx` с `CardProps` (`title?: string`, `children: React.ReactNode`) и inline‑стилями; `title` рендерит `<h3>` только если передан.
  2. Добавить named export в `packages/ui/package.json` через `exports: { "./card": "./src/card.tsx" }`.
  3. Экспортировать компонент из `packages/ui/src/index.ts` (`export { Card } from './card'`).
  4. Добавить зависимость в `apps/web/package.json`: `@geniusgarage/ui: "workspace:*"`.
  5. Использовать компонент в `apps/web/app/features/page.tsx`: `import { Card } from '@geniusgarage/ui/card'` и заменить 6 блоков на 6 `<Card ...>…</Card>`.
- Концепт “workspace dependency magic”: изменения в `packages/ui/src/card.tsx` мгновенно отражаются во всех местах использования без публикации в npm/registry и без version bump’ов (через локальный workspace link).
- Next.js и локальные пакеты:
  - заявлено, что с Next.js 15+ и Turbopack локальные workspace‑пакеты компилируются “на лету” без дополнительной настройки,
  - для более старых версий Next (<15) может понадобиться `transpilePackages: ['@geniusgarage/ui']` в `next.config.js`.
- Troubleshooting: ошибка `Cannot find module 'react/jsx-runtime'` лечится добавлением React types + TypeScript в `packages/ui/package.json` devDependencies и запуском `pnpm install`.
- Рекомендация по коммиту: `feat(ui): extract Card component to shared package`.

Что это означает для `web-core` (решения/требования):
- Нам нужно зафиксировать рабочий стандарт “shared UI в workspace”:
  - зависимости на локальные пакеты ставим через `workspace:*` (pnpm),
  - импортируем компоненты через named exports (`@…/ui/card`), а не через общий barrel.
- Нужно принять решение по Next.js версии/режиму дев‑сервера:
  - если целимся в современный стек (Next 15+), то можно избегать отдельной настройки `transpilePackages`,
  - если остаёмся на более ранней версии — заложить `transpilePackages` в шаблон приложения.
- Для устойчивости DX важно не забыть “типовую” проблему: shared UI пакет должен иметь devDependencies для TS/React types, иначе ловятся ошибки по `jsx-runtime` в сборке/типчеке.

### Vercel Academy — Extract Button Component

Источник: `https://vercel.com/academy/production-monorepos/extract-button-component`

Краткий конспект (по присланному содержимому):
- Урок повторяет паттерн извлечения, уже освоенный на `Card`, но для `Button` и с улучшением API: добавляется `variant` для переиспользования в разных контекстах.
- Реализация `Button`:
  - файл `packages/ui/src/button.tsx`,
  - пропсы: `children`, `onClick?: () => void`, `variant?: 'primary' | 'secondary'` (по умолчанию `primary`),
  - стили разделены на `baseStyles` и `variantStyles`, итог — merge в `style={{ ...baseStyles, ...variantStyles[variant] }}`.
- Экспорт:
  - в `packages/ui/package.json` добавляется `exports["./button"] = "./src/button.tsx"` рядом с `./card`,
  - в `packages/ui/src/index.ts` добавляется `export { Button } from './button'`.
- Использование:
  - в `apps/web/app/page.tsx` вместо inline‑кнопки импорт `import { Button } from '@geniusgarage/ui/button'`,
  - тестируется `variant="secondary"` (серый) и дефолтный `primary` (синий).
- Рекомендация по коммиту: `feat(ui): extract Button component with variants`.
- Урок подчёркивает “масштабируемость паттерна”: десятки компонентов могут следовать одинаковой схеме (`src/` → `exports` → `index.ts` → импорт в app).

Что это означает для `web-core` (решения/требования):
- В `packages/ui` стоит сразу проектировать компоненты как “мелкие, стабильные API”:
  - простая вариативность (variant) вместо множества почти одинаковых компонентов,
  - единообразный стиль экспорта/импорта.
- Для нас важно заранее решить стратегию стилизации:
  - в уроке используются inline‑styles ради простоты, но для реальных сайтов вероятно понадобится дизайн‑система (CSS variables / Tailwind / CSS-in-JS / tokens).
  Это решение повлияет на API компонентов и на кешируемые outputs/инпуты в Turborepo.

### Vercel Academy — Deploy Web App

Источник: `https://vercel.com/academy/production-monorepos/deploy-web-app`

Краткий конспект (по присланному содержимому):
- Цель урока: показать, как Turborepo работает в CI/CD (на примере Vercel) и как remote cache ускоряет повторные деплои.
- Ключевой приём: **filtered builds** — на деплой собирается только нужное приложение, а не вся монорепа:
  - локально: `turbo build --filter=@geniusgarage/web`,
  - на Vercel: настроить build так, чтобы запускался `turbo build --filter=web` (а не `next build`).
- Кеширование:
  - локальный повтор сборки “без изменений” даёт резкое ускорение (пример 14s → 0.3s),
  - в Vercel build logs видно “cache hit (remote), replaying logs” и общий тайминг (пример ~16s first deploy vs сотни миллисекунд при cache hit).
- Важный нюанс про shared packages:
  - UI‑пакет (`packages/ui`) **не имеет отдельного build task** и потребляется как TypeScript source,
  - итоговый `@geniusgarage/web:build` включает компиляцию и бандлинг UI в артефакты приложения,
  - shared packages — **build-time dependency**, не отдельный runtime deployment.
- Проверка артефактов: сборка создаёт `.next/` (static/server/BUILD_ID) и именно это кешируется/восстанавливается.
- Инвалидация кеша:
  - изменение кода web приложения → cache miss и пересборка web,
  - изменение “вне инпутов” (пример: README) → cache hit и очень быстрый билд.
- Настройка Vercel для монорепы (пример из текста):
  - Root Directory = `apps/web`,
  - Build Command = `cd ../.. && turbo build --filter=web`,
  - Output Directory = `.next`,
  - Install Command = `pnpm install`.

Что это означает для `web-core` (решения/требования):
- Для наших Kubernetes/GitLab реалий аналог “Vercel build settings” — это CI pipeline:
  - сборка должна уметь запускать **filtered builds** на конкретные apps (`--filter=@synestra/<app>` или по пути),
  - время CI должно улучшаться за счёт кеша (локального и/или remote) и правильных `outputs`.
- Нужно определить, какой подход к build shared packages мы выбираем:
  - “TS source consumed by app” (как в уроке) — проще, меньше шагов, но требования к Next/TS и транспиляции workspace пакетов становятся критичнее,
  - или “каждый пакет билдится отдельно” (сложнее, но предсказуемее для разных рантаймов).
- В GitOps‑контуре важно помнить: общий UI‑пакет — не отдельный deployment. Он влияет на образы приложений, а значит на promotion и dependency tracking (изменил `packages/ui` → нужно пересобрать и перезадеплоить затронутые apps).

### Vercel Academy — Create Snippet Manager App

Источник: `https://vercel.com/academy/production-monorepos/create-snippet-app`

Краткий конспект (по присланному содержимому):
- Цель: добавить второе приложение в монорепу (`apps/snippet-manager`), подключить к нему общий `packages/ui` и показать, что shared package работает “сквозь” несколько apps.
- Создание app:
  - scaffold через `create-next-app` внутри `apps/` с App Router и TypeScript,
  - включены ESLint и alias `@/*`, Tailwind отключён (стилизация как в web app — inline CSS).
- Конвенции:
  - имя пакета — scoped (`@geniusgarage/snippet-manager`) для единообразия workspace,
  - dev‑порт меняется на `3001`, чтобы обе apps запускались параллельно с `apps/web` (3000).
- Подключение общего UI:
  - зависимость добавляется как workspace dependency (`@geniusgarage/ui: "workspace:*"`),
  - пример команды: `pnpm add @geniusgarage/ui --filter @geniusgarage/snippet-manager --workspace`.
- Оркестрация:
  - `pnpm dev` запускает dev‑серверы обоих приложений (за счёт `turbo.json` dev task),
  - `turbo build` собирает оба приложения параллельно (между ними нет зависимостей); UI‑пакет на этом этапе считается исходниками (build задачи у него ещё нет — появится позже в курсе).
- Важные эффекты:
  - единая команда запуска/сборки для нескольких apps,
  - горячие обновления общего UI должны отражаться сразу в обоих приложениях.
- Рекомендация по коммиту: `feat(app): add snippet manager app on port 3001`.

Что это означает для `web-core` (решения/требования):
- Наша целевая структура `apps/*` должна поддерживать несколько приложений с единым developer loop:
  - единая команда для запуска “всего, что нужно разработчику” (например `pnpm dev`/`turbo dev`),
  - параллельный запуск нескольких apps локально и в CI (тесты/линт/билды).
- Нужен стандарт именования workspace‑пакетов для apps (аналог `@geniusgarage/<app>`), чтобы:
  - фильтровать задачи (`turbo build --filter=@.../<app>`),
  - легко понимать ownership и scope коммитов.
- Замечание по версиям: в тексте урока фигурирует Next 16, но в `web-core` зафиксирован Next `v15.4.9` — сам паттерн “вторая app + общий UI + turbo orchestration” сохраняется, но детали команд scaffold и настроек будут привязаны к нашему стеку.

### Vercel Academy — Build Snippet List Page

Источник: `https://vercel.com/academy/production-monorepos/snippet-list-page`

Краткий конспект (по присланному содержимому):
- Цель: доказать “code sharing работает” на практике — второе приложение не просто “зависит” от `packages/ui`, а реально импортирует и использует `Button` и `Card`.
- Реализация в `apps/snippet-manager/app/page.tsx`:
  - добавляется `'use client'` для интерактивности (заранее под `useState`/handlers),
  - импорт `Button` и `Card` через named export пути (`@geniusgarage/ui/button`, `@geniusgarage/ui/card`),
  - заводится интерфейс `Snippet` (id/title/language/code/tags) и мок‑массив из 3 элементов,
  - страница строит header с кнопкой “+ New Snippet” и grid карточек, где каждая карточка показывает title/language/code/tags.
- Демонстрация “монорепо суперсилы”:
  - при одновременном запуске обоих apps (`pnpm dev`) изменение `packages/ui/src/button.tsx` должно hot‑reload’нуться **сразу в обоих приложениях**,
  - без version bump’ов и публикации пакетов — всё через workspace link.
- Оркестрация/кеш:
  - при `turbo build` задачи запускаются параллельно по apps,
  - UI‑пакет может иметь cache hit, если не менялся, а приложения — пересобираются при изменении страниц.

Замечания для переноса в `web-core` (учитывая наш стек):
- В тексте урока местами фигурирует Tailwind и упоминание `next.config.mjs transpiles the package`. Для `web-core` зафиксирован Next `v15.4.9`; мы должны явно определить:
  - используем ли Tailwind в `apps/*` или другой способ стилизации (сейчас у нас открытый вопрос по дизайн‑системе),
  - требуется ли какой‑либо `transpilePackages` (по предыдущим урокам — предположительно нет в Next 15+ с Turbopack, но нужно подтвердить на нашей сборке образов).

Что это означает для `web-core` (решения/требования):
- Принцип: любые shared компоненты должны быть “проверены” минимум двумя потребителями (`apps/web` и ещё один app) — только так видно реальную пользу и быстро ловятся проблемы со сборкой/транспиляцией.
- “use client” в shared UI:
  - если UI‑компоненты используют DOM‑события/hover/handlers, нужно следить за корректностью client/server компонентного разделения в Next App Router,
  - важно зафиксировать правило: где ставим `'use client'` (в app page vs в UI компоненте) и почему.
- Для Turborepo/CI: цель — чтобы изменение `packages/ui` инвалидацировало сборку только зависимых apps, а остальные оставались cached.

### Vercel Academy — Add CodeBlock and SnippetCard Components

Источник: `https://vercel.com/academy/production-monorepos/add-codeblock-snippetcard`

Краткий конспект (по присланному содержимому):
- Мотивация: даже внутри одного приложения появляется DRY‑проблема — сниппеты рисуются “generic Card + вручную повторяемая структура” (title, language, code preview, tags). Это меньшее зло, чем копипаста между apps, но всё равно ведёт к разрастанию шаблонного JSX.
- Решение: расширять компонентную библиотеку постепенно:
  - `CodeBlock` — специализированный компонент отображения кода (тёмный фон, language label, `<pre><code>`, monospace, горизонтальный скролл),
  - `SnippetCard` — композиция `Card` + `CodeBlock` + метаданные (createdAt) + теги.
- Изменения:
  - новые файлы `packages/ui/src/code-block.tsx` и `packages/ui/src/snippet-card.tsx`,
  - расширение `exports` в `packages/ui/package.json`: `./code-block`, `./snippet-card`,
  - обновление `apps/snippet-manager/app/page.tsx`: импорт `SnippetCard` и замена “ручной” разметки на `<SnippetCard ... />`,
  - добавление поля `createdAt` в `Snippet` и мок‑данные (в примере даты в 2026 году).
- Демонстрация composition + hot reload:
  - правка `CodeBlock` (например `fontSize`) должна отражаться во всех `SnippetCard`, т.к. SnippetCard использует CodeBlock внутри.
- Демонстрация selective rebuild/caching:
  - при `turbo build` ожидается: UI пересобирается (добавились компоненты), snippet-manager пересобирается (изменилась страница), web остаётся cached (если его код не менялся).

Замечания для переноса в `web-core` (учитывая наш стек):
- В тексте говорится “syntax highlighting”, но в примере `CodeBlock` по сути задаёт стили и структуру. Реальная подсветка потребует отдельной библиотеки (и влияет на размер бандла, кеш и security).
- В примерах используются Tailwind‑классы в `apps/snippet-manager/app/page.tsx`, но ранее курс делал акцент на inline‑styles. Для `web-core` это нужно согласовать со стратегией стилизации `packages/ui` и `apps/*`.
- Несостыковка с предыдущими уроками:
  - ранее утверждалось, что `packages/ui` “не имеет отдельного build task и потребляется как TS source”,
  - здесь в примере вывода `turbo build` фигурирует `@geniusgarage/ui:build`.
  Это прямо влияет на наш выбор стратегии: будет ли `packages/ui` иметь собственный `build` (например `tsc`) или оставаться “source-only”.

Что это означает для `web-core` (решения/требования):
- Компонентная библиотека должна расти через композицию:
  - базовые примитивы (Button/Card) + специализированные компоненты (SnippetCard), чтобы не размазывать бизнес‑разметку по приложениям.
- Нужно зафиксировать подход к “client/server” для UI:
  - SnippetCard/CodeBlock могут оставаться server‑compatible, пока не используют события/DOM‑API,
  - интерактивные элементы (hover handlers, модалки) потребуют `'use client'` и это должно быть управляемо (см. открытый вопрос).
- Нужно принять решение по build‑стратегии `packages/ui` (source-only vs отдельный build task), потому что на это завязаны `turbo build` граф, outputs для кеша и поведение CI.

### Vercel Academy — Add Snippet Creation Modal

Источник: `https://vercel.com/academy/production-monorepos/snippet-creation-modal`

Краткий конспект (по присланному содержимому):
- Цель: перейти от статической страницы к интерактивному UI, добавив state management и модальное окно создания сниппета (in-memory).
- Реализация в `apps/snippet-manager/app/page.tsx` (client-side):
  - используется `useState` для:
    - массива сниппетов (`useState<Snippet[]>(initialSnippets)`),
    - флага модалки `showModal`,
    - состояния формы `newSnippet` (title/language/code/tags).
  - важно поменять рендер сниппетов: маппинг должен идти по `snippets` state, а не по исходному `mockSnippets`, иначе новые элементы не отобразятся.
- Логика UI:
  - кнопка “+ New Snippet” открывает модалку (`setShowModal(true)`),
  - модалка рендерится условно (`showModal && ...`) и содержит контролируемые поля формы,
  - кнопки Cancel/Create используют общий `Button` (в т.ч. вариант `secondary` для Cancel).
- Логика создания:
  - `handleCreateSnippet` валидирует обязательные поля (title/code),
  - создаёт объект сниппета с `id: Date.now()`,
  - парсит теги из строки (split по `,`, trim, filter пустые),
  - формирует `createdAt` через `toLocaleDateString` (в примере `en-US`),
  - добавляет новый сниппет в начало массива (newest first),
  - закрывает модалку и сбрасывает форму.
- UX деталь: по умолчанию Cancel закрывает модалку без сброса формы (state сохраняется); опционально можно сбрасывать форму и при Cancel.
- Рекомендация по коммиту: `feat(app): add snippet creation modal`.

Замечания для переноса в `web-core`:
- Это упражнение подчёркивает важность правил `'use client'`/client boundaries в Next App Router:
  - состояние и обработчики (useState/onClick) требуют client component,
  - при этом `packages/ui` компоненты могут оставаться server-compatible, если не тянут в себя state/DOM‑API.
- Формат дат и локаль (`en-US`) — деталь, которую в реальном продукте нужно стандартизировать (i18n/locale), иначе поведение будет разным в разных окружениях и у разных пользователей.

Что это означает для `web-core` (решения/требования):
- Для наших SaaS/магазина/лендингов неизбежны интерактивные формы и модалки; важно заранее зафиксировать:
  - “где живёт state”: в конкретных apps (pages/components) или частично в `packages/ui`,
  - что входит в UI‑пакет как “универсальный компонент” (Modal, FormField), а что остаётся бизнес‑логикой приложения (создание сущности, валидация, форматирование).
- Общий `Button` должен поддерживать сценарии form actions (primary/secondary) и события; возможно понадобятся расширения API (disabled/loading, type="submit", aria-*), которые лучше добавлять централизованно в `packages/ui`.

### Vercel Academy — Deploy Both Apps

Источник: `https://vercel.com/academy/production-monorepos/deploy-both-apps`

Краткий конспект (по присланному содержимому):
- Цель: доказать модель деплоя монорепы — **несколько приложений деплоятся независимо**, каждое со своим URL/проектом, при этом оба используют общий `packages/ui` без публикации в npm.
- Модель на примере Vercel:
  - один GitHub‑репозиторий,
  - два Vercel project’а:
    - Project 1: `apps/web` (уже задеплоен ранее),
    - Project 2: `apps/snippet-manager` (новый).
  - для каждого проекта задаётся:
    - Root Directory = соответствующая папка приложения,
    - Build Command = `turbo build --filter=@geniusgarage/<app>`,
    - Output Directory = `.next`,
    - Install Command = `pnpm install`.
  - дополнительно предлагается env var `ENABLE_EXPERIMENTAL_COREPACK=1`, чтобы corepack использовал pnpm‑версию, указанную в repo.
- В build logs видно, что в scope попадают и app, и `@geniusgarage/ui`, и Turborepo строит dependency‑граф: сначала `packages/ui`, потом app.
- Подчёркнутый payoff:
  - поменял `packages/ui` → пуш → оба проекта пересоберутся (каждый по своим правилам), без version bump и publish.
- Опциональная оптимизация: selective deployments через “Ignored Build Step” (не билдить проект, если в последнем коммите не менялись файлы app и `packages/ui`):
  - пример команды: `git diff HEAD^ HEAD --quiet . ../packages/ui`
  - идея: README‑изменения не должны триггерить rebuild обоих проектов.
- Рекомендация: задокументировать production URLs в README.

Что это означает для `web-core` (решения/требования):
- Это прямой аналог нашей целевой модели в Kubernetes/ArgoCD: **несколько deployments из одной монорепы**, каждый deployment независим, но shared packages общие на уровне исходников/сборки образов.
- Для GitLab CI вместо “Vercel project settings” нужны:
  - отдельные build jobs (или матрица) на каждый app (`corporate/shop/saas/landings/...`),
  - использование `turbo build --filter=@.../<app>` и общего cache,
  - сборка образов по app независимо (и возможность не собирать/не выкатывать, если изменения не затронули app или его shared deps).
- Нужен “ignored build step” эквивалент:
  - path-based rules в GitLab (`rules:changes`) или вычисление затронутых пакетов через Turborepo/гит‑diff,
  - чтобы README/доки/несвязанные изменения не триггерили rebuild всех apps.
- Важно согласовать toolchain pinning:
  - если мы фиксируем `pnpm` через `packageManager` в repo, то CI должен уважать это (аналог `ENABLE_EXPERIMENTAL_COREPACK=1` на Vercel).

### Vercel Academy — Extract Shared Configs

Источник: `https://vercel.com/academy/production-monorepos/extract-shared-configs`

Краткий конспект (по присланному содержимому):
- Мотивация: дублирующиеся `tsconfig.json` в каждом app → drift (например, strict mode включён в одном и выключен в другом). Конфиги должны быть централизованы.
- Паттерн Turborepo: “one package per tool” — отдельный пакет конфигурации для каждого инструмента, чтобы было модульно и компонуемо.
- Создаются два пакета:
  - `packages/typescript-config` с несколькими конфигами:
    - `base.json` (общие compilerOptions),
    - `nextjs.json` (extends base + next plugin + include для Next).
  - `packages/eslint-config` (ESM), экспортирует общий ESLint config через `exports: { ".": "./index.js" }`.
- Подключение в apps:
  - `apps/*/tsconfig.json` становится тонкой обёрткой: `"extends": "@.../typescript-config/nextjs.json"` + app-specific overrides (например paths).
  - `apps/*/eslint.config.mjs` импортирует shared config: `import sharedConfig from '@.../eslint-config'; export default sharedConfig`.
- Оркестрация через Turborepo:
  - добавляется `lint` task в `turbo.json` с `dependsOn: ["^lint"]` (lint на зависимостях раньше потребителей),
  - root `package.json` прокидывает `lint` → `turbo lint`,
  - `pnpm lint` запускает линт в нескольких apps параллельно.
- Проверка работоспособности: искусственно добавить unused variable и увидеть, что правило `@typescript-eslint/no-unused-vars` срабатывает через общий eslint-config.
- Альтернатива: Biome как более быстрый unified toolchain (lint+format) с компромиссами по экосистеме плагинов.

Замечания для переноса в `web-core` (учитывая наш стек):
- В тексте ESLint config включает `eslint-config-next` (пример версия `^15.0.0`), что согласуется с нашим Next `v15.4.9`.
- В TS configs используется `moduleResolution: "bundler"` и next plugin — это релевантно для Next App Router и workspace‑пакетов.

Что это означает для `web-core` (решения/требования):
- Нам нужны минимум два “tooling packages”:
  - `packages/typescript-config` (base + nextjs),
  - `packages/eslint-config` (единые правила/extends).
- Это снижает риск конфигурационного drift при росте числа apps/deployments (corporate/shop/saas/landings/...).
- Важно связать это с Turborepo caching:
  - `lint` задачи должны быть частью графа и кешироваться,
  - изменения в config packages должны корректно инвалидировать lint/typecheck/сборку там, где надо.
- Нужно принять решение по форматтеру/линтеру:
  - продолжать ESLint+Prettier (как в курсе) или рассмотреть Biome, если линт станет узким местом (особенно в CI).

### Vercel Academy — Add Shared Utils

Источник: `https://vercel.com/academy/production-monorepos/add-shared-utils`

Краткий конспект (по присланному содержимому):
- Мотивация: утилиты (formatDate/slugify/truncate/validateEmail) — “идеальные кандидаты” для shared packages: это чистые функции без UI‑зависимостей, легко тестируются и переиспользуются во всех apps.
- Создаётся `packages/utils`:
  - структура `packages/utils/src/index.ts`,
  - `package.json` с `exports: { ".": "./src/index.ts" }` и devDependencies, включающими shared config packages (`@.../typescript-config`, `@.../eslint-config`) + `eslint` + `typescript`,
  - `tsconfig.json` расширяет `@.../typescript-config/base.json` и задаёт `outDir` (в примере `./dist`).
- Реализация утилит (в одном файле `src/index.ts`):
  - `formatDate(date: Date): string` через `Intl.DateTimeFormat('en-US', { month:'short', day:'numeric', year:'numeric' })`,
  - `slugify(text: string): string` через lower/replace (удаление спецсимволов, пробелы → `-`),
  - `truncate(text: string, maxLength: number): string` с `...`,
  - `validateEmail(email: string): boolean` через regex.
- Подключение в app:
  - `apps/snippet-manager` добавляет workspace dependency `@.../utils`,
  - `createdAt` переводится из `string` в `Date`,
  - в UI рендеринг `createdAt` форматируется через `formatDate(snippet.createdAt)`,
  - при создании сниппета `createdAt: new Date()`.
- Демонстрация Turborepo графа/кеша:
  - добавление нового пакета вызывает его сборку и пересборку затронутого app,
  - другие apps остаются cached, если не зависят от utils.
- Урок также предлагает “карта роста shared packages”: UI → configs → utils → (будущее) `packages/core` для бизнес‑логики.

Замечания для переноса в `web-core`:
- Форматирование дат фиксируется через `en-US` в примере; в нашем продукте это нужно привязать к локали/языкам сайтов и избежать хардкода.
- `slugify` и `validateEmail` в виде простых regex/replace — удобно для старта, но в проде могут потребоваться i18n/юникод/краевые случаи.

Что это означает для `web-core` (решения/требования):
- `packages/utils` — естественный следующий shared package после UI и config:
  - чистые функции в одном месте,
  - единая типизация и линт,
  - переиспользование между `corporate/shop/saas/landings`.
- Нужно определить “границу между utils и core”:
  - utils = общие примитивы (format/slug/truncate/validators),
  - core = предметная логика (например, репутационные метрики/валидации домена).
- Пакеты утилит должны участвовать в Turborepo графе и кешироваться; изменения в utils должны инвалидировать сборку только зависимых apps.

### Vercel Academy — Update Turborepo Pipeline

Источник: `https://vercel.com/academy/production-monorepos/update-turborepo-pipeline`

Краткий конспект (по присланному содержимому):
- Проблема роста: пока Turborepo “угадывал” порядок выполнения на базе workspace dependencies, но для большой монорепы нужна **явная** конфигурация задач (order, caching, parallelism).
- Ключевой механизм: `dependsOn` и префикс `^`:
  - `dependsOn: ["^build"]` означает “сначала выполнить build у workspace‑зависимостей, потом у текущего пакета”,
  - `dependsOn: ["^lint"]` означает “сначала lint у зависимостей, потом у текущего пакета”,
  - без `^` — зависимость внутри того же пакета (например “сначала lint, потом build”).
- Пример графа для `apps/snippet-manager`:
  - зависит от `packages/ui` и `packages/utils`,
  - поэтому `turbo build --filter=@.../snippet-manager` выполняет build в порядке: ui+utils → snippet-manager.
- Важный практический шаг: **каждый пакет, который должен участвовать в графе `turbo build`, обязан иметь `scripts.build`**.
  - Для `packages/ui` и `packages/utils` предлагается `build: "tsc --noEmit"` (typecheck как “build”).
  - Config packages (`packages/typescript-config`, `packages/eslint-config`) build‑скрипты не требуют, т.к. экспортируют статические файлы.
- Диагностика:
  - `turbo build --dry` показывает план и порядок выполнения,
  - повторный `turbo build` демонстрирует cache hit и резкое ускорение.
- Демонстрация “умного” кеша по зависимостям:
  - изменение `packages/utils` инвалидацирует его build и build всех зависимых apps (например `apps/snippet-manager`), даже если код app не менялся,
  - несвязанные пакеты/приложения могут оставаться cached.
- Дополнительные паттерны `turbo.json`:
  - `build.dependsOn: ["test", "^build"]` (тесты перед сборкой),
  - “cache-only tasks” с `outputs` (например `coverage/**`),
  - “never cache” для deploy задач (`cache: false`).

Что это означает для `web-core` (решения/требования):
- Мы должны перестать полагаться на “угадывание” и зафиксировать pipeline как контракт:
  - `build` и `lint` задачи с `^build`/`^lint`,
  - единый подход к scripts в каждом пакете/приложении.
- Это частично закрывает нашу развилку про `packages/ui`:
  - даже если UI “потребляется как TS source”, полезно иметь `packages/ui:build` как typecheck (`tsc --noEmit`), чтобы UI участвовал в графе, кешировался и корректно выступал зависимостью для apps.
- Нужно принять решение про “настоящую сборку” пакетов (dist/.d.ts) отдельно от turbo-оркестрации:
  - lesson-подход использует typecheck как build для пакетов с исходниками,
  - но для публикации/внешнего потребления/отдельного runtime может понадобиться реальный build артефактов (это уже другой уровень требований).

### Vercel Academy — Set up Vitest

Источник: `https://vercel.com/academy/production-monorepos/set-up-vitest`

Краткий конспект (по присланному содержимому):
- Мотивация: общий UI используется несколькими apps; регресс в `Button`/`Card` ломает сразу всё. Ручные проверки не масштабируются → нужны автотесты на уровне `packages/ui`.
- Инструменты: Vitest + React Testing Library + jest-dom matchers + jsdom окружение.
- Настройка `packages/ui`:
  - devDependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`,
  - `vitest.config.ts` с `test.environment = 'jsdom'`, `test.globals = true`, `test.setupFiles = ['./src/test/setup.ts']`,
  - `src/test/setup.ts` импортирует `@testing-library/jest-dom`,
  - scripts:
    - `test: "vitest run"` (CI),
    - `dev:test: "vitest"` (watch mode).
- Smoke test:
  - создаётся `src/button.test.tsx`,
  - минимум: тест “рендерит children” + тест “дефолтный variant”.
- Объяснение окружений:
  - `jsdom` нужен для React‑рендеринга (window/document),
  - `node` окружение быстрее, но не подходит для DOM‑тестов UI.

Замечания для переноса в `web-core` (учитывая наш стек):
- В тексте урока ожидания теста завязаны на Tailwind‑классах (пример `bg-blue-500`), но наши текущие UI‑компоненты в курсе ранее показывались с inline styles. Для `web-core` нужно согласовать стратегию стилизации (иначе тесты станут хрупкими/нерелевантными).
- Наш базовый Next.js зафиксирован как `v15.4.9`; Vitest и RTL не зависят напрямую от версии Next, но зависят от React и от того, как мы пишем UI (client/server boundaries).

Что это означает для `web-core` (решения/требования):
- Добавить тестовую дисциплину на уровень shared packages:
  - минимальный набор тестов в `packages/ui` (Button/Card/CodeBlock/SnippetCard),
  - запуск в CI через `turbo test` и кеширование тестов (нужно описать `test` task в `turbo.json` и outputs, например `coverage/**`, если будем собирать покрытие).
- Зафиксировать “что именно тестируем”:
  - поведение и доступность (role/aria, disabled, onClick), а не только “классы/inline styles”,
  - тесты на композицию (SnippetCard → CodeBlock) как контракт переиспользуемости.

### Vercel Academy — Write Component Tests

Источник: `https://vercel.com/academy/production-monorepos/write-component-tests`

Краткий конспект (по присланному содержимому):
- Цель: расширить тесты `packages/ui` так, чтобы они ловили регрессии до того, как они сломают `apps/*`.
- Что тестируют:
  - `Button`:
    - рендер children,
    - дефолтный variant,
    - secondary variant,
    - onClick handler (через `vi.fn()` + `fireEvent.click`),
    - что рендерится как `<button>`.
  - `Card`:
    - рендер children,
    - “base styles”,
    - custom `className`,
    - несколько children.
  - `CodeBlock`:
    - рендер кода,
    - monospace,
    - дефолтный language,
    - кастомный language,
    - “dark background”.
- Покрытие (опционально): в `vitest.config.ts` добавляется coverage (`provider: 'v8'`, `reporter: ['text', 'html']`) и запускается `vitest run --coverage`.
- Важно: Vitest watch mode умеет переисполнять только релевантные тесты при изменении компонентов.
- Best practices из урока:
  - тестировать поведение, а не внутренности,
  - использовать семантические селекторы (`getByRole`),
  - держать тесты читаемыми.

Замечания для переноса в `web-core` (учитывая наш стек):
- Урок активно проверяет CSS классы (`bg-blue-500`, `rounded-lg`, `font-mono`, `bg-gray-900`). В нашем `web-core` UI может быть реализован через inline styles или иную систему (tokens/CSS vars/Tailwind). Поэтому “проверка классов” должна быть адаптирована:
  - предпочтительно тестировать поведение/структуру/доступность,
  - стили тестировать через стабильные признаки (например data-attributes) или через “контрактные” классы, если мы выбираем Tailwind.
- Для Next 15.4.9 и Payload 3.68.3 версия Next не критична для Vitest, но критичны:
  - React версии,
  - `'use client'` границы (UI компоненты vs app pages),
  - jsdom окружение для DOM‑рендеринга.

Что это означает для `web-core` (решения/требования):
- Для `packages/ui` нужен минимум “контрактных” тестов:
  - доступность (роль кнопки, фокус, disabled),
  - корректное отображение children/props,
  - обработчики событий,
  - композиция компонентов (SnippetCard).
- Если мы будем собирать coverage, нужно определить:
  - где хранится output (обычно `coverage/**`) и как он кешируется Turborepo (outputs в `turbo.json`),
  - нужен ли coverage в CI на раннем этапе или достаточно “tests must pass”.

### Vercel Academy — Configure Turborepo for Tests

Источник: `https://vercel.com/academy/production-monorepos/configure-turborepo-tests`

Краткий конспект (по присланному содержимому):
- Проблема: тесты можно запускать точечно через `pnpm --filter`, но это плохо масштабируется при росте числа пакетов. Нужна одна команда для тестов по всей монорепе, с параллельностью и кешем.
- Решение: добавить `test` как pipeline task в `turbo.json` и запускать `turbo test`.
- Конфиг `turbo.json` для `test`:
  - без `dependsOn` (тесты не обязаны ждать тестов зависимостей),
  - `outputs: ["coverage/**"]` для кеширования отчётов (если они генерируются),
  - кеширование включено по умолчанию (при совпадении input hash Turborepo “replay outputs”).
- Root scripts: `package.json` на корне добавляет `"test": "turbo test"`.
- Поведение:
  - `turbo test` находит пакеты со `scripts.test` и запускает их; пакеты без test script пропускаются.
  - повторный запуск даёт cache hit и быстрый прогон.
  - `--dry` показывает план выполнения; `--force` игнорирует кеш.
- Инвалидация кеша тестов зависит от:
  - исходников и тестовых файлов,
  - `package.json` (deps/scripts),
  - окружения (Node version, env vars),
  - изменений в workspace dependencies (в смысле input hash конкретного пакета).
- Опционально: тесты для `packages/utils`:
  - для pure functions достаточно Vitest без jsdom (node env),
  - можно добавить отдельный `vitest.config.ts` для utils.

Замечания для переноса в `web-core` (учитывая наш стек):
- Мы уже зафиксировали необходимость `test` task в `turbo.json`; этот урок уточняет, что:
  - `^test` не обязателен и часто не нужен (тесты могут идти параллельно),
  - outputs для coverage должны быть определены заранее, иначе кеш будет менее полезен.
- Для `next v15.4.9`: UI‑тесты всё равно остаются на уровне `packages/ui` (jsdom), а `packages/utils` тестируются в node env — это хорошо ложится на разделение “UI vs pure functions”.

Что это означает для `web-core` (решения/требования):
- В `web-core` нужно стандартизировать тестовый контракт:
  - `turbo test` должен работать из корня,
  - пакеты с тестами обязаны иметь `scripts.test`,
  - `turbo.json` должен описывать outputs для кеширования (минимум `coverage/**`, если включаем coverage).
- Для CI (GitLab):
  - выгодно кешировать тесты так же, как билды/линт (remote cache или сохранение локального кеша между job’ами),
  - важно фиксировать Node/pnpm версии, иначе “same environment” условие будет ломаться и cache hit’ов будет меньше.

### Vercel Academy — Test Caching in Action

Источник: `https://vercel.com/academy/production-monorepos/test-caching`

Краткий конспект (по присланному содержимому):
- Урок объясняет, **что именно Turborepo хеширует** для тестового кеша и какие изменения приводят к cache hit/miss.
- Что входит в hash для `turbo test` (пример `packages/ui`):
  1) source files пакета,  
  2) test files пакета,  
  3) package config (package.json, tsconfig, vitest config),  
  4) global config (turbo.json, root package.json, даже `.gitignore`),  
  5) workspace dependencies (например shared config packages),  
  6) task command.
- Практические сценарии:
  - комментарий в source или тесте → cache miss (hash меняется),
  - изменение “не связанного” файла в другом app → cache hit для тестов пакета,
  - добавление нового test file в пакете → cache miss для этого пакета,
  - изменение workspace dependency (например `typescript-config`) → cache miss у зависимого пакета.
- Инспекция:
  - `turbo test --dry=json` даёт task hash (через `jq` можно вытянуть `.tasks[].hash`).
- Хранилище:
  - локальный кеш складывается в `node_modules/.cache/turbo/` как архивы по hash; хранит stdout/stderr и outputs (например `coverage/**`).
  - Turborepo сам чистит старые записи (pruning).
- Remote caching (пример Vercel):
  - кеш в облаке разделяется между разработчиками и CI (dev прогнал тесты → CI может получить cache hit),
  - командами `pnpm dlx turbo login` и `pnpm dlx turbo link` подключается remote cache.
- Стратегии повышения hit rate:
  - минимизировать частые правки глобального конфига (turbo.json) — это инвалидирует всё,
  - правильно разносить пакеты по частоте изменений (стабильные пакеты дают больше cache hit),
  - использовать remote cache в CI,
  - не менять test scripts без нужды,
  - держать зависимости “узкими” (не зависеть от apps там, где не нужно).

Что это означает для `web-core` (решения/требования):
- Нам важно спроектировать “cache-friendly” монорепу:
  - минимизировать churn в `turbo.json` и root scripts,
  - держать shared packages (`ui/utils/config`) независимыми от приложений,
  - фиксировать Node/pnpm в CI, чтобы не терять cache hit’ы из-за environment drift.
- Нужен план по remote caching для GitLab (аналог Vercel):
  - где хранится remote turbo cache,
  - как выдаются токены/доступ,
  - какие env vars попадают в hash и как избежать cache poisoning (это следующий раздел курса).

### Vercel Academy — Add GitHub Actions CI Pipeline

Источник: `https://vercel.com/academy/production-monorepos/github-actions`

Краткий конспект (по присланному содержимому):
- Мотивация: локально можно прогонять `pnpm build/lint/test`, но прод‑качество требует, чтобы это автоматически выполнялось в CI на каждый PR/push до деплоя.
- Идея: один CI workflow запускает `turbo build lint test` **одной командой**, чтобы Turborepo распараллелил задачи и использовал кеш.
- Пример интеграции (GitHub Actions):
  - workflow `.github/workflows/ci.yml`,
  - триггеры: push в main и pull_request,
  - шаги: checkout → установка pnpm → установка Node (с кешем pnpm) → `pnpm install` → `turbo build lint test`.
- Кеширование:
  - кеш зависимостей (pnpm) ускоряет install,
  - кеш Turborepo даёт ускорение повторных прогонов (в идеале — remote cache через TURBO_* переменные).
- CI best practices из урока:
  - запускать задачи одной командой (`turbo build lint test`), а не несколькими последовательными шагами,
  - использовать кеш зависимостей,
  - пинить версии actions,
  - fail-fast достигается автоматически (Turborepo падает на первой ошибке).
- Следующий шаг курса: фильтрация задач по изменившимся пакетам (git-based filtering), чтобы CI не “строил всё” при малых изменениях.

Замечания для переноса в `web-core`:
- Мы используем GitLab CI (и сборку образов планируем/ведём там), поэтому YAML и экосистема будут другими, но принцип полностью переносится:
  - единый entrypoint команд (turbo),
  - кеш зависимостей и turbo cache,
  - триггеры на MR/ветки,
  - подготовка к filtering/affected packages.

Что это означает для `web-core` (решения/требования):
- В `web-core` нужен CI контракт “качество до деплоя”:
  - на каждый MR и пуш выполняются `turbo build`, `turbo lint`, `turbo test` (лучше одной командой),
  - результаты кешируются,
  - последующие шаги (сборка образов/деплой) должны зависеть от успешного прохождения этих задач.
- Для GitLab CI нужно запланировать:
  - кеш pnpm store,
  - кеш Turborepo (локальный между job’ами и/или remote),
  - в перспективе — фильтрацию по изменившимся пакетам (не собирать/не тестировать весь workspace без необходимости).

### Vercel Academy — Filtering and Git-Based Filtering

Источник: `https://vercel.com/academy/production-monorepos/filtering-git-based`

Краткий конспект (по присланному содержимому):
- Проблема: CI “строит всё” на каждый коммит. Даже мелкая правка в `apps/web` может триггерить ненужные задачи для `packages/*` и других apps.
- Решение: использовать `--filter` для точечного запуска задач, а для CI — git-based filtering, чтобы определять изменившиеся пакеты относительно базовой ветки и запускать только необходимое.
- Основные паттерны `--filter`:
  - один пакет: `--filter @geniusgarage/web`,
  - пакет + зависимости: `--filter @geniusgarage/web...` (подтягивает `packages/ui` и др. зависимости),
  - пакет + зависимые: `--filter @geniusgarage/ui...` (подтягивает apps, которые используют UI),
  - git-based: `--filter=[main]` / `--filter=[origin/main]` (изменилось относительно main → включить изменившиеся пакеты и их dependents).
- Для git-based filtering нужен полный git history (`fetch-depth: 0`), иначе сравнение с базовой веткой может быть некорректным.
- Практика для CI:
  - на PR/branch builds: `turbo build lint test --filter=[origin/main]`,
  - на main: полный прогон без фильтра (как “калибровка” и safety net).
- Дополнительно: можно кешировать turbo cache directory в CI (`node_modules/.cache/turbo`) и использовать restore-keys.

Замечания для переноса в `web-core`:
- Мы на GitLab CI, но принцип тот же:
  - получить базовую ветку (main) + достаточную git историю,
  - вычислить diff, запустить `turbo ... --filter=[<base>]` или эквивалент,
  - отличать “полный прогон на main” от “инкрементального прогона на MR”.

Что это означает для `web-core` (решения/требования):
- Нам нужен стандартный CI режим:
  - MR/feature ветки: “incremental” (git-based filter),
  - main: “full”.
- В GitLab нужно решить, как корректно задавать базу для фильтра (origin/main vs merge-base) и как обеспечить историю (shallow clone отключить или увеличить depth).
- Это напрямую связано с нашим “ignored build step” вопросом: git-based filtering — более общий и масштабируемый ответ, чем path-only rules, потому что учитывает зависимости между пакетами.

### Vercel Academy — Remote Caching Setup

Источник: `https://vercel.com/academy/production-monorepos/remote-caching`

Краткий конспект (по присланному содержимому):
- Проблема: локальный turbo cache ускоряет только тебя. CI и коллеги на свежих машинах пересобирают всё заново.
- Решение: **remote cache** — общие артефакты задач (build/test/lint outputs) доступны всем машинам. Один разработчик прогрел кеш → CI и другие разработчики получают cache hit.
- Настройка remote cache на Vercel:
  - `pnpm dlx turbo login` (авторизация),
  - `pnpm dlx turbo link` (привязка репозитория/скоупа),
  - создаётся `.turbo/config.json` с `teamId` и `apiUrl`,
  - `.turbo/` добавляется в `.gitignore` (config не коммитится).
- Проверка:
  - `turbo build` → “Remote caching enabled / Artifact uploaded”,
  - удаление локального кеша (`rm -rf node_modules/.cache/turbo`) и повтор → “cache hit (remote), downloading”.
- Настройка CI (пример GitHub Actions):
  - добавить секреты `TURBO_TOKEN` и `TURBO_TEAM`,
  - прокинуть env vars в workflow,
  - после этого `turbo build lint test --filter=[origin/main]` получает remote cache hits.
- Security:
  - CI лучше давать read-only token; разработчикам — read-write (для upload),
  - кешируются только outputs задач и stdout/stderr; не кешируются source code, node_modules, env vars, secrets.
- Отключение: `--no-cache` для команды или удаление `.turbo/config.json`.

Замечания для переноса в `web-core` (учитывая наш контекст GitLab):
- Нам не обязательно использовать Vercel как remote cache провайдер. Важно иметь remote cache вообще.
- Нужно спроектировать “remote caching contract” для GitLab CI:
  - где хранится cache,
  - какие токены/пермишены,
  - как разделять read-only для CI и read-write для локальной разработки.

Что это означает для `web-core` (решения/требования):
- Remote cache — ключ к реальному ускорению CI и онбординга:
  - вместе с git-based filtering даёт “быстрые” инкрементальные пайплайны,
  - вместе с фиксированным окружением (Node/pnpm) повышает hit rate.
- Требование безопасности:
  - следить, чтобы outputs задач не включали секреты (например, не писать `.env`/секреты в билд‑артефакты),
  - контролировать переменные окружения, которые участвуют в hash (следующий раздел курса про env vars).

### Vercel Academy — Add Docs App

Источник: `https://vercel.com/academy/production-monorepos/add-docs-app`

Краткий конспект (по присланному содержимому):
- Цель: добавить третий app, чтобы проверить масштабируемость всей базы: shared packages, filtering, caching, CI.
- Новый app: `apps/docs`, отдельный dev‑порт (в примере 3002), использует существующие shared пакеты (`packages/ui`, конфиги, утилиты).
- Показательный эффект: после добавления третьего app всё “подхватывается” Turborepo автоматически (workspace glob уже включает `apps/*`), и `turbo build --dry` показывает новый task.
- В уроке вводятся env vars для app (`NEXT_PUBLIC_APP_NAME`) через `.env.example` и `.env.local`.
- Демонстрируется “все apps одной командой” (`pnpm dev`) и hot reload в нескольких apps при правке `packages/ui`.

Замечания для переноса в `web-core` (учитывая наш стек):
- В примере указан Next 14.x и React 18, а у нас зафиксирован Next `v15.4.9` (и стек Payload/React). Для `web-core` эти версии нужно унифицировать между apps, иначе общий UI и tooling будут дрейфовать.
- В примере docs app использует Tailwind и добавляет Tailwind config, включая `packages/ui/src` в `content`. Это напрямую связано с нашим открытым вопросом “стратегия стилизации”: если Tailwind — общий стандарт, тогда надо проектировать `packages/ui` и apps под него; если нет — docs app не должен тянуть Tailwind “в одиночку”.
- `.env.local` не должен коммититься и для нас остаётся dev-only; секреты централизуются в `synestra-platform`, поэтому env vars и конфигурация окружений должны быть согласованы с GitOps/секретами.

Что это означает для `web-core` (решения/требования):
- Паттерн “добавить новый app = минимум новых файлов” — наша целевая ценность:
  - новый app переиспользует `packages/ui`, `packages/typescript-config`, `packages/eslint-config`, `packages/utils`,
  - подключается в общий `pnpm dev`/`turbo dev` автоматически.
- Для наших сайтов это мапится так:
  - `apps/corporate`, `apps/shop`, `apps/saas`, `apps/landings` добавляются как “новые apps” по этому паттерну,
  - если нужен docs/portal (внутренний), он тоже вписывается как отдельный app.
- Нужно заранее определить стандарт работы с env vars в монорепе (следующая секция курса):
  - что хранится в `.env.example`,
  - где находятся значения dev/stage/prod,
  - какие env переменные участвуют в turbo hash и как избежать массовой инвалидации кеша.

### Vercel Academy — Deploy All Apps

Источник: `https://vercel.com/academy/production-monorepos/deploy-all-apps`

Краткий конспект (по присланному содержимому):
- Цель: показать, что деплой “масштабируется” вместе с монорепой: 3 apps → 3 независимых деплоя/URL, при этом shared packages общие.
- На примере Vercel:
  - для `apps/docs` создаётся отдельный Vercel project с Root Directory = `apps/docs`,
  - env vars настраиваются на уровне проекта (пример: `NEXT_PUBLIC_APP_NAME` для Production/Preview/Development),
  - деплой показывает, что `packages/ui` собирается как dependency и затем собирается app.
- Проверка “независимых деплоев”:
  - изменение только в `apps/docs` должно приводить к rebuild/deploy только docs,
  - изменение в `packages/ui` должно приводить к rebuild/deploy всех apps, которые зависят от UI (web/app/docs).
- CI не усложняется:
  - git-based filtering (`turbo build lint test --filter=[origin/main]`) автоматически учитывает новые apps без дополнительной конфигурации.

Замечания для переноса в `web-core`:
- В Kubernetes/ArgoCD это мапится на “3 ArgoCD Applications / 3 Helm releases / 3 namespaces” (по нашему правилу — namespace+DB на deployment), с общими shared packages на уровне сборки образов.
- Важно разделять env vars per-deployment (per-app):
  - `NEXT_PUBLIC_*`/публичные настройки,
  - приватные secrets (у нас централизованы в `synestra-platform`),
  - значения для `dev/stage/prod`.
- В монорепе нужно избегать `.env.local` в репозитории и стандартизировать `.env.example` + механизм подстановки в CI/кластере.

Что это означает для `web-core` (решения/требования):
- Для каждого `apps/*` мы должны иметь независимую “линейку деплоя”:
  - отдельный образ/тэг,
  - отдельный ArgoCD Application/Helm values,
  - отдельный набор env vars/secrets,
  - при этом изменения в `packages/*` должны триггерить пересборку всех зависимых apps (через turbo filter/affected packages).
- GitLab CI должен уметь:
  - инкрементально собирать только изменившиеся apps и их dependents,
  - но в случае изменения shared пакета — строить несколько apps (fan-out) и инициировать соответствующие деплои в dev.

### Vercel Academy — Multi-App Development

Источник: `https://vercel.com/academy/production-monorepos/multi-app-development`

Краткий конспект (по присланному содержимому):
- Проблема: несколько apps ⇒ несколько dev‑серверов/портов/терминалов. Нужны устойчивые локальные workflow.
- Основные режимы запуска:
  - всё сразу: `pnpm dev` (turborepo оркестрирует параллельный запуск),
  - один app: `pnpm --filter @.../<app> dev`,
  - несколько apps: несколько `--filter ...`,
  - по паттерну: `pnpm --filter "./apps/*" dev`, `pnpm --filter "./packages/*" dev`.
- Cross-app навигация в dev: можно временно добавить ссылки между apps по localhost:порт.
- Идеи для “shared state” между apps (на будущее): API routes, shared database layer (`packages/db`), event bus (`packages/events`).
- Управление портами:
  - фиксированный порт на app (3000/3001/3002/…); наращивание по принципу +1,
  - порт задаётся в `scripts.dev` (пример `next dev --port 3003`).
- Dev ergonomics:
  - VS Code multi-root workspace через `.vscode/*.code-workspace`,
  - разные браузерные профили для изоляции cookies/storage между apps,
  - tmux/screen для запуска нескольких dev процессов в одном окне.
- Performance tips:
  - “селективный dev” — запускать только нужные apps,
  - package development: watch mode/тесты пакета + один app для интеграции,
  - иногда при изменениях в shared packages нужен быстрый перезапуск dev‑сервера.

Замечания для переноса в `web-core` (учитывая наш стек и цели):
- Мы работаем на одном окружении `dev` в кластере, но локальный developer loop остаётся критичным. Важно стандартизировать:
  - как запускать один app vs все apps,
  - как быстро проверять изменения в `packages/ui` (тесты + один/несколько apps),
  - как избегать конфликтов портов, если одновременно нужен Payload admin и несколько сайтов.

Что это означает для `web-core` (решения/требования):
- Нужно зафиксировать “официальные” команды разработки:
  - `pnpm dev` (всё),
  - `pnpm --filter <app> dev` (один),
  - `pnpm --filter "./apps/*" dev` (все apps),
  - `pnpm --filter <pkg> dev:test`/`dev:build` (пакетные циклы).
- Нужно согласовать схему портов для локальной разработки (и документировать), но помнить: в Kubernetes порт — внутренний, а контрактом выступают домены/ingress.
- Есть смысл завести репо‑артефакты для удобства команды:
  - VS Code workspace (опционально),
  - короткий runbook по multi-app dev (какие команды, какие порты, когда перезапускать).

### Vercel Academy — Turborepo Generators

Источник: `https://vercel.com/academy/production-monorepos/turborepo-generators`

Краткий конспект (по присланному содержимому):
- Проблема роста: создание новых компонентов/пакетов ведёт к копипасте boilerplate (импорты, типы, тесты, exports). В командах это приводит к несогласованности и ошибкам (забыли добавить export/тест, разное именование).
- Решение: Turborepo generators (на базе `@turbo/gen`) — шаблоны и генераторы, которые создают компоненты/пакеты по стандарту команды.
- Базовая настройка:
  - установить `@turbo/gen` как dev dependency,
  - добавить конфиг генераторов `turbo/generators/config.ts` (Plop API),
  - добавить шаблоны `turbo/generators/templates/*`.
- Пример generator’а “component”:
  - спрашивает имя компонента,
  - создаёт `packages/ui/src/<kebab>.tsx` и `packages/ui/src/<kebab>.test.tsx`,
  - обновляет exports (например `packages/ui/src/index.ts`).
- Пример generator’а “package” (опционально):
  - создаёт новый shared package в `packages/<name>` из набора шаблонов (package.json/tsconfig/src/index.ts/README).
- Эффект: стандарты соблюдаются автоматически (структура, тесты, именование), снижается вероятность “человеческих” ошибок.

Замечания для переноса в `web-core`:
- Генераторы особенно полезны после того, как мы зафиксируем стандарты:
  - нейминг scoped packages (`@synestra/<name>`),
  - named exports (например `@synestra/ui/button`),
  - базовый тестовый шаблон для UI (Vitest + RTL),
  - conventions по commit scopes (`feat(ui): ...`, `feat(app): ...`).

Что это означает для `web-core` (решения/требования):
- После стабилизации API `packages/ui` и структуры `packages/*` стоит добавить генераторы как “guardrail”:
  - новый компонент всегда создаётся с тестом и правильным экспортом,
  - новый пакет создаётся уже с правильным `package.json`/tsconfig и скриптами (`build/lint/test`), чтобы сразу участвовать в turbo pipeline.
- Генераторы могут стать частью “enterprise patterns” для команды (особенно при росте числа сайтов/apps и UI компонентов).

### Vercel Academy — Changesets for Versioning

Источник: `https://vercel.com/academy/production-monorepos/changesets-versioning`

Краткий конспект (по присланному содержимому):
- Проблема роста: ручной version bump и changelog приводят к ошибкам (забыли поднять версию, несогласованные changelog, breaking changes без предупреждения).
- Решение: Changesets фиксирует “намерение изменения” и автоматически:
  - применяет semver bump (patch/minor/major),
  - генерирует CHANGELOG’и,
  - (опционально) публикует пакеты в npm через CI.
- Базовая настройка:
  - установить `@changesets/cli`,
  - `pnpm changeset init` создаёт `.changeset/config.json` и `.changeset/README.md`,
  - конфиг включает: schema, changelog, baseBranch, access, updateInternalDependencies и т.п.
- Workflow изменений:
  1) внести изменение в пакет (например добавить `danger` variant в Button),  
  2) `pnpm changeset` выбрать тип bump’а (minor/patch/major) + summary,  
  3) закоммитить changeset файл вместе с кодом,  
  4) `pnpm changeset version` обновляет версии `package.json`, генерирует `CHANGELOG.md`, удаляет applied changesets,  
  5) коммит “chore: version packages”.
- Важный нюанс workspace protocol:
  - apps используют `workspace:*`, поэтому им не нужно “подкручивать” версии зависимостей вручную при bump’ах пакетов внутри монорепы.
- Семантика semver (правила):
  - patch: bugfix/refactor/docs,
  - minor: новые фичи/опциональные параметры/новые компоненты,
  - major: breaking API/удаления/обязательные параметры/крупные апгрейды зависимостей.
- CI publishing (опционально): changesets/action может создавать release PR и публиковать на npm при merge (нужны токены).
- Best practices: понятные summaries, группировать связанные изменения, использовать стиль похожий на conventional commits внутри changeset текста.

Замечания для переноса в `web-core`:
- Мы не планируем публикацию UI/утилит в публичный npm прямо сейчас; но changesets полезны как внутренний релиз‑трекинг и дисциплина breaking changes.
- У нас `packages/*` являются build-time dependencies для `apps/*` (через `workspace:*`), поэтому semver не нужен для “линковки” внутри монорепы, но полезен:
  - для человека (понимать масштаб изменений),
  - для changelog/релизов,
  - для externalization (если позже вынесем пакеты наружу).

Что это означает для `web-core` (решения/требования):
- Решить, хотим ли мы вводить changesets как часть “enterprise patterns”:
  - если да — нужно определить список пакетов, которые версионируем (`packages/ui`, `packages/utils`, возможно `packages/core`), и какие игнорируем (config packages?).
- Если мы НЕ публикуем в npm:
  - changesets можно использовать только для генерации changelog/версий в git,
  - или ограничиться conventional commits + release notes в GitLab.
- Важно согласовать это с нашей моделью деплоя:
  - версии пакетов не заменяют immutable image tags,
  - но могут использоваться как metadata для релиз‑ноутов и отслеживания breaking изменений в `packages/ui`, которые затрагивают несколько сайтов.

### Vercel Academy — Code Governance

Источник: `https://vercel.com/academy/production-monorepos/code-governance`

Краткий конспект (по присланному содержимому):
- Проблема роста: в большой монорепе без границ ответственности “любой меняет всё”, ревью попадает не тем людям, качество падает.
- Два базовых механизма:
  - **CODEOWNERS** — назначает владельцев (команды/пользователей) на пути/файлы и автоматически запрашивает ревью.
  - **Branch protection** — требует PR, approvals, обязательный review от code owners, прохождение CI, актуальность ветки перед merge.
- Паттерны CODEOWNERS:
  - match по директориям, расширениям, точным файлам,
  - несколько владельцев (оба должны approve),
  - более специфичные правила перекрывают общие.
- Best practice: начинать “грубо” (apps/* и packages/*), затем уточнять до уровней команд/компонентов; документировать rationale комментариями и проводить регулярный аудит (например квартально).
- Архитектурные границы:
  - в тексте упоминается будущая native boundary enforcement в Turborepo (alpha),
  - пока рекомендуются TS path aliases и документация по импортам; (в целом — придерживаться правил “не импортировать apps друг в друга”).

Замечания для переноса в `web-core` (GitLab):
- В GitLab есть аналогичные механизмы:
  - CODEOWNERS файл поддерживается GitLab’ом (и может автоназначать reviewers),
  - правила merge request approvals и protected branches/required pipelines.
  Конкретная настройка будет отличаться от GitHub, но идея та же: ownership + enforced quality gates.

Что это означает для `web-core` (решения/требования):
- Нам нужен минимальный governance уже на старте:
  - владельцы `packages/ui`, `packages/typescript-config`, `packages/eslint-config`, `packages/utils`,
  - владельцы `apps/corporate|shop|saas|landings`,
  - владельцы CI/CD (`.gitlab-ci.yml`, `deploy/*`).
- Это помогает удерживать качество shared packages (любая правка в `packages/ui` потенциально влияет на все сайты).
- В идеале governance увязать с нашей моделью репозиториев:
  - `synestra-platform` (инфра) имеет собственные правила и owners,
  - `web-core` (продукт) — свои owners/approvals, чтобы изменения в деплойных шаблонах и shared packages не проходили без ревью.

### Vercel Academy — Production Patterns with next-forge

Источник: `https://vercel.com/academy/production-monorepos/next-forge-patterns`

Краткий конспект (по присланному содержимому):
- next-forge позиционируется как production-ready Turborepo starter от Vercel ecosystem, который демонстрирует “все базовые паттерны курса” плюс прод‑фичи: auth, database, monitoring, edge и др.
- Типичный состав:
  - `apps/*` (web/app/docs и др.),
  - много `packages/*`, разнесённых по доменам (design system/tokens, auth, database, email, monitoring…),
  - строгий TypeScript,
  - Turborepo pipeline с outputs для `.next/**` и `dist/**`,
  - тестовый pipeline может зависеть от `^build` (в примере).
- Примеры прод‑инструментов/решений:
  - Tailwind + shadcn/ui дизайн‑система,
  - PostgreSQL (Neon) + Drizzle ORM,
  - Clerk auth,
  - Biome вместо ESLint+Prettier,
  - security/perf практики (CSP, rate limiting, edge middleware, bundle analysis).
- Главный тезис: “fundamentals → scale”:
  - GeniusGarage учит базовым элементам (apps/packages/config/utils/testing/CI/caching),
  - next-forge показывает, как те же идеи масштабируются в боевую архитектуру с множеством доменных пакетов.

Замечания для переноса в `web-core`:
- next-forge — не “готовое решение” для нас, а референс для:
  - разбиения `packages/*` по доменам (например `packages/auth`, `packages/db`, `packages/observability`, `packages/email`),
  - выбора toolchain (Biome vs ESLint/Prettier) при росте репо,
  - прод‑паттернов безопасности/наблюдаемости.
- Для нас база данных и auth уже живут в Kubernetes/Keycloak/CNPG, поэтому “vendor-specific” решения (Neon/Clerk) не обязательно применимы, но архитектурные идеи (границы пакетов, строгая типизация, CI/кеш, security headers) — применимы.

Что это означает для `web-core` (решения/требования):
- Мы можем использовать next-forge как “каталог паттернов”, когда придём к:
  - выделению `packages/core` (доменные правила),
  - `packages/auth` (OIDC/Keycloak client utils),
  - `packages/db` (типобезопасный доступ/схемы, миграции),
  - `packages/observability` (tracing/logging helpers),
  - и усилению security/perf контуров (headers, rate limits, анализ бандла).
- Решение про Biome стоит переоценивать позже по метрикам (как и советовал курс): если lint/format становится bottleneck — рассмотреть переход.

### Примечание по официальным шаблонам

Исследования официальных шаблонов (Payload templates и др.) ведём отдельно: `docs/research/templates-research.md`.
