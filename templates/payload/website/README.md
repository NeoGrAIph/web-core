# Synestra template: Payload `website` (PostgreSQL, monorepo-ready)

Этот шаблон предназначен **для копирования в `apps/*`** внутри монорепозитория `web-core`.

Что уже “адаптировано под нас” (по сравнению с official Payload `templates/website`):
- DB адаптер: **PostgreSQL** (`@payloadcms/db-postgres`) + `migrationDir` + `push: !isProd`.
- Миграции: добавлена baseline‑миграция в `src/migrations/**` (чтобы prod “с 0” поднимался через `payload migrate`).
- i18n: включены `en` + `ru` (в админке появится выбор языка).
- Seed: исправлены падения при `Seed your database` (последовательные media uploads) + `disableRevalidate`.
- Media files: используем стандартный Payload endpoint `/api/media/file/<filename>`; для кэширования добавлен `upload.modifyResponseHeaders` (Cache-Control).
- Next Image: `remotePatterns` учитывают `NEXT_PUBLIC_SERVER_URL`.
- Конфиги: `eslint.config.mjs` и `tsconfig.json` соответствуют стандартам `web-core`.
- Preview (external, без логина): добавлен share-preview через **подписанный токен в URL fragment** (`#token=...`) с TTL **7 дней**, без утечек секретов в querystring/access logs.

Источник (официальный template):
- `https://github.com/payloadcms/payload/tree/main/templates/website`

Upstream snapshot в `web-core` (reference only):
- `web-core/upstream/payload/templates/website`

Рекомендуемый runbook:
- `docs/runbooks/runbook-add-app-from-payload-template.md`

---

## External preview (без логина, для клиентов) — как работает

Цель: дать внешним клиентам возможность открыть черновик без аккаунта/логина, чтобы согласовать изменения.

### Основной механизм

1) В админке Payload в записи (Page/Post) используется `admin.preview` / `admin.livePreview.url`.
2) URL генерируется как:
   - `/next/share-preview#token=<SIGNED_TOKEN>`
3) Токен:
   - подписан через `PREVIEW_SECRET`,
   - содержит `path` и `exp`,
   - TTL по умолчанию: **7 дней** (см. `src/utilities/generatePreviewPath.ts`).
4) Важно: токен находится в `#fragment`, поэтому он:
   - **не попадает** в access logs,
   - **не отправляется** в `Referer` как часть URL на сервер.

### Обмен токена на draft mode cookie

- Страница `/next/share-preview` (client page) читает `#token=...` и делает `POST /next/share-preview/exchange`.
- Сервер валидирует подпись/TTL и включает Next.js `draftMode()` cookie.
- После этого пользователь редиректится на целевой `path` и видит черновик.

Реализация:
- `src/app/(frontend)/next/share-preview/page.tsx`
- `src/app/(frontend)/next/share-preview/exchange/route.ts`
- `src/utilities/sharePreviewToken.ts`

### Ограничение (важно понимать)

Next.js draft mode cookie действует **глобально** в рамках сайта:
- после открытия share-preview ссылки пользователь сможет видеть черновики и на других страницах, пока draft mode включён.

### Как выйти из preview

Откройте:
- `GET /next/exit-preview` (сбрасывает draft mode cookie)
