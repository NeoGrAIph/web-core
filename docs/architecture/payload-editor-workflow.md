# Payload CMS 3: workflow редактора (drafts/versions/live preview/scheduled publish) — канон `web-core`

Статус: актуально на **2025-12-17** (Payload **3.68.3**, Next.js **15.4.9**).

Цель: зафиксировать production‑канон “как редактор работает” (и какие тех. гарантии нужны), чтобы:
- черновики не утекали публично;
- live preview работал предсказуемо;
- scheduled publish реально выполнялся в `prod` (а не “включили галочку и забыли”);
- секреты не попадали в URL/querystring и логи.

Связанные документы:
- Page Builder UX (blockName/RowLabel/anchors): `docs/research/payload/payload-page-builder-admin-ux-best-practices.md`
- Seed/defaultValue и изменения schema: `docs/architecture/payload-seeding.md`
- Миграции (Postgres): `docs/architecture/payload-migrations.md`
- Исследование Payload workflow (official): `docs/research/payload/payload-versions-drafts-preview-best-practices.md`

---

## 1) Модель данных: `versions` + `drafts`

### 1.1. Versions

`versions` хранит историю изменений документа и даёт:
- аудит/откат,
- источник данных для preview (читать “последнюю версию” из versions).

Практика `web-core`:
- включаем versions на контентных коллекциях (Pages/Posts),
- контролируем рост через `maxPerDoc` (например `50`).

Источник: https://payloadcms.com/docs/versions/overview

### 1.2. Drafts

Drafts добавляет `_status: 'draft' | 'published'` и меняет семантику чтения/записи через параметр `draft`.

Канон:
- публично читаем только `published` (через access control),
- preview/live preview читает draft‑данные (через `draft: true` + отдельную авторизацию).

Источник: https://payloadcms.com/docs/versions/drafts

---

## 2) Preview внутри админки (internal preview)

### 2.1. Контракт URL

Канон `web-core` (Next.js App Router):
- enable: `GET /next/preview?collection=<slug>&slug=<slug>&path=<relative>`
- disable: `GET /next/exit-preview`

Основание:
- Next.js Draft Mode (cookie‑флаг для “читать черновики”): https://nextjs.org/docs/app/api-reference/functions/draft-mode
- Payload Live Preview опирается на draft workflow: https://payloadcms.com/docs/live-preview/overview

### 2.2. Авторизация preview

Ключевое правило безопасности:
- draft mode включается **только после** успешной проверки пользователя через `payload.auth(...)`.

Т.е. `/next/preview` обязан проверять `AuthResult.user`, а не просто “успешность вызова”.

Источник (тип `AuthResult.user: null | TypedUser`): Payload `auth()` возвращает `{ user: null | ... }`  
https://payloadcms.com/docs/authentication/overview

---

## 3) Live Preview (iframe + refresh)

Канон `web-core`:
- в коллекциях Pages/Posts задаём `admin.livePreview.url` как internal preview URL (см. выше);
- на фронтенде при `draftMode().isEnabled` включаем listener, который делает `router.refresh` на события Admin UI.

Источник: https://payloadcms.com/docs/live-preview/overview

---

## 4) Scheduled publish (publish/unpublish по времени)

В Payload scheduled publish включается через:
- `versions.drafts.schedulePublish: true`

Но это **не работает само по себе**, если не выполняется jobs runner.

Канон `web-core` для Kubernetes:
- используем встроенный endpoint Payload: `GET /api/payload-jobs/run` (он же внутри вызывает `handleSchedules`, если включено scheduling);
- в `prod` включаем Kubernetes CronJob, который вызывает этот endpoint по расписанию с `Authorization: Bearer $CRON_SECRET`;
- мониторим успешность CronJob и ошибки jobs queue (иначе scheduled publish будет “тихо” не работать).

Источники:
- Drafts → Scheduled Publish: https://payloadcms.com/docs/versions/drafts#scheduled-publish
- Jobs Queue overview: https://payloadcms.com/docs/jobs-queue/overview

---

## 5) DoD для production‑workflow

PR/изменение считаем “готовым для prod”, если:
- Pages/Posts имеют `versions.drafts` (и разумный `maxPerDoc`),
- internal preview защищён `payload.auth` и включает draft mode только для авторизованного пользователя,
- Live Preview listener подключён только в draft‑режиме,
- при включённом `schedulePublish` реально существует jobs runner (CronJob или отдельный worker),
- секреты `PREVIEW_SECRET` / `CRON_SECRET` лежат только в Kubernetes Secrets (не в git и не в querystring).
