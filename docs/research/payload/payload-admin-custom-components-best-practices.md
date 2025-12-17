# Payload CMS 3 — Admin UI Custom Components: best practices (official)

Дата актуальности: **2025-12-16**.  
Контекст репозитория: **Payload 3.68.3**, **Next.js 15.4.9**, monorepo `apps/*` + `packages/*`.

Цель: собрать **официальные** рекомендации Payload по кастомизации админки через Custom Components (включая Import Map), и описать применимый стандарт для `web-core` (без копипаста и с устойчивыми границами).

---

## 1) Источники (официальные)

- Docs: Custom Components — Overview  
  `https://payloadcms.com/docs/custom-components/overview`
- Docs: Custom Components — Root Components  
  `https://payloadcms.com/docs/custom-components/root-components`
- Docs: Fields — Overview (Custom Components / Default Field Component Props)  
  `https://payloadcms.com/docs/fields/overview`
- Docs: Admin — React Hooks (`useField`, `useFormFields`, и т.д.)  
  `https://payloadcms.com/docs/admin/react-hooks`

---

## 2) Component Path + Import Map (главный контракт)

### 2.1. Компоненты задаются строкой (Component Path), а не импортом в конфиг

Best practice Payload:
- в `payload.config` указывать **строковые пути** к компонентам;
- Payload подключает компоненты через Import Map (авто‑обновление в dev, генерация командой).

Практический вывод:
- в конфиге Payload хранить только пути (и имена экспортов);
- реализацию держать в TS/TSX файлах.

### 2.2. Синтаксис путей: default / named exports

Поддерживается:
- default export: `path/to/component`
- named export: `path/to/component#ExportName`

Практика:
- `#ExportName` полезен для мелких компонент из одного entry файла, но не превращаем entry в “свалку”.

### 2.3. `admin.importMap.baseDir` должен быть стабильным

`admin.importMap.baseDir` задаёт “корень” для резолва Component Paths.

Практика для monorepo:
- `baseDir` направляем на корень конкретного app (чтобы пути были короткими и устойчивыми);
- shared‑реализации подключаем через app‑entrypoints (см. раздел 4).

---

## 3) Server/Client граница и `clientProps`

Официально:
- Custom Components по умолчанию могут быть Server Components.

Best practices:
- держать компоненты server‑safe (без хуков/DOM) до тех пор, пока интерактивность не нужна;
- если компонент становится client (`'use client'`), задавать `clientProps` и не тащить лишние props через границу (и избегать несериализуемых значений).

---

## 4) Стандарт `web-core`: “app-local entrypoints”

Задача: переиспользование между apps без хрупких Component Paths.

### 4.1. Паттерн

В каждом app создаём entrypoints, на которые ссылается Payload:

```
apps/<app>/src/payload/admin/
  components.tsx
  fields.tsx
  index.ts
```

Payload config ссылается только на них, например:
- `src/payload/admin/components#BeforeDashboard`
- `src/payload/admin/fields#HeroLayoutField`

А внутри entrypoints:
- допускаются импорты из workspace‑пакетов (`@synestra/*`), если реализация переиспользуется.

Плюсы:
- Component Paths стабильны;
- shared code можно менять без “лома” конфигов, меняется только thin слой.

---

## 5) Field Components и React Hooks

Best practice:
- для кастомных field/components использовать официальные React hooks (`useField`, `useFormFields`, …) вместо ручного состояния.
- делать точечные переопределения (`Label`/`Description`/`Error`) вместо полного `Field`, если этого достаточно.

---

## 6) Root Components

Root Components — официальные точки расширения админки (обвязка, навигация, login, dashboard).

Практика:
- использовать для брендинга/навигации/интеграций;
- держать лёгкими и предсказуемыми (особенно если server component).

