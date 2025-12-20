# `@synestra/typescript-config`

Пакет с общими TypeScript‑конфигами для монорепозитория.

Зачем:
- не копировать одинаковый `tsconfig.json` по всем приложениям/пакетам;
- исключить “drift” настроек (strict/target/moduleResolution);
- ускорить добавление новых apps/packages.

Что внутри:
- `base.json` — общая база (строгая, без `emit`).
- `nextjs.json` — слой для Next.js App Router.

Как использовать:
- В Next.js приложении:
  - `extends: "@synestra/typescript-config/nextjs.json"`
- В “чистом” пакете без Next:
  - `extends: "@synestra/typescript-config/base.json"`

Практическая деталь:
- чтобы TypeScript мог резолвить `extends: "@synestra/typescript-config/..."`, добавьте `@synestra/typescript-config` в `devDependencies` потребителя (`"workspace:*"`).
- если в app используется alias вида `@/*`, то app должен задать `compilerOptions.baseUrl` (обычно `"."`) и `paths` в своём `tsconfig.json`.

Важно:
- Этот пакет не содержит секретов.
- Это “config package”: его не нужно собирать и публиковать отдельно.
