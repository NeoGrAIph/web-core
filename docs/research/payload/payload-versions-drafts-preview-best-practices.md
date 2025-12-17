# Payload CMS 3 — Versions / Drafts / Preview: best practices (official)

Дата актуальности: **2025-12-16**.  
Контекст репозитория: **Payload 3.68.3**, **Next.js 15.4.9**, monorepo `apps/*` + `packages/*`.

Цель: собрать **официальные** рекомендации Payload по versioning/drafts и preview (включая live preview), и описать стандарт применения в `web-core` (self-host/k8s, без секретов в репо).

---

## 1) Источники (официальные)

- Docs: Versions — Overview  
  `https://payloadcms.com/docs/versions/overview`
- Docs: Drafts (в т.ч. `draft` param, `_status`, access control, schedulePublish)  
  `https://payloadcms.com/docs/versions/drafts`
- Docs: Live Preview  
  `https://payloadcms.com/docs/live-preview`
- Docs: Jobs Queue (требуется, если включаем schedulePublish)  
  `https://payloadcms.com/docs/jobs-queue/overview`

Дополнительно (официальный блог / примеры):
- Blog: Website Template (ссылка на Draft Preview Example для App Router)  
  `https://payloadcms.com/blog/how-to-build-a-website-blog-or-portfolio-with-nextjs`

---

## 2) Versions: что включать и как контролировать рост БД

Официально:
- при включении `versions` Payload создаёт отдельную коллекцию `_<slug>_versions` для хранения версий, не меняя “форму” основных данных;
- есть `maxPerDoc` (по умолчанию 100, `0` = хранить всё), чтобы контролировать объём.

Практический вывод:
- включать versions на контентных коллекциях (Pages/Posts) где нужен аудит/откат;
- выставлять лимиты (`maxPerDoc`) для “шумных” коллекций, иначе рост storage будет неконтролируемым.

---

## 3) Drafts: `_status` и параметр `draft` — это разные вещи

Официально:
- включение drafts добавляет `_status` (`draft` / `published`);
- `draft` параметр в API управляет (а) валидацией required полей и (б) куда писать обновления (versions only vs main+versions);
- `draft: true` на чтение возвращает самую свежую версию из versions table, но **сам по себе** не гарантирует “скрытие черновиков” — это решается access control.

Практический вывод:
- в приложениях разделяем:
  - “режим чтения” (draftMode → читать из versions),
  - “режим публичности” (`_status` + access rules).

Анти‑паттерн:
- считать, что `draft: true/false` автоматически решает задачу “не показывать черновики” без access control.

---

## 4) Включение drafts на существующей коллекции: важная оговорка

Официально в docs:
- старые документы до “включения drafts” не имеют `_status` пока их не пересохранить;
- для публичного чтения нужно временно учитывать `exists: false` (или массово пересохранить документы).

Практический вывод:
- при миграции включения drafts:
  - либо выполняем “ресейв” документов,
  - либо на период миграции расширяем access rule: `_status == 'published' OR _status does not exist`.

---

## 5) Draft Preview (secure preview + Next.js draft mode)

Payload позиционирует drafts как основу preview‑воркфлоу (перед публикацией).

В `web-core` уже есть рабочий паттерн (по официальным шаблонам Payload):
- preview enable: `apps/synestra-io/src/app/(frontend)/next/preview/route.ts`
- preview disable: `apps/synestra-io/src/app/(frontend)/next/exit-preview/route.ts`
- генерация preview URL: `apps/synestra-io/src/utilities/generatePreviewPath.ts`

Стандарт для новых apps:
- сохранить URL‑контракт:
  - enable: `/next/preview`
  - disable: `/next/exit-preview`
- `PREVIEW_SECRET` хранить только в окружении (k8s Secret).

---

## 6) Live Preview (iframe в админке)

Официально:
- Live Preview настраивается через `admin.livePreview` (url можно задавать как строкой, так и функцией — в т.ч. для multi-tenant/locale);
- во фронтенде нужен listener на события (postMessage) и “refresh” (например, `router.refresh` в Next).

Практический вывод для Next.js App Router:
- на preview страницах включать `draftMode()` и читать контент с `draft: true`;
- учитывать CSP: домен админки должен быть разрешён в `frame-ancestors`, иначе iframe заблокируется.

Пример уже в `web-core`:
- listener: `apps/synestra-io/src/components/LivePreviewListener/index.tsx`
- breakpoints: `apps/synestra-io/src/payload.config.ts` (`admin.livePreview.breakpoints`)

---

## 7) Scheduled publish: только если есть jobs runner

Официально:
- drafts option `schedulePublish` разрешает планировать publish/unpublish;
- для этого нужен jobs queue / scheduler.

Практический вывод для k8s:
- включаем `schedulePublish` только если гарантируем job runner в каждом deployment (и мониторинг/ретраи);
- секреты для запуска job endpoints держим в k8s Secrets.

---

## 8) Security / hardening (важно для production workflow)

### 8.1. Не передавайте секреты preview в querystring

Причина: querystring часто попадает в:
- ingress/access logs,
- аналитические системы,
- заголовок `Referer` при переходах.

Стандарт `web-core`:
- `/next/preview` **не** требует `PREVIEW_SECRET` в URL;
- доступ к enable‑endpoint защищается **Payload auth** (пользователь должен быть залогинен в admin), и только после этого включается Next.js draft mode cookie.

Живой пример: `apps/synestra-io/src/app/(frontend)/next/preview/route.ts`.

### 8.2. Access rules: “публично только published”, preview — отдельно

Базовый паттерн для контентных коллекций:
- если `req.user` есть → `true`,
- иначе ограничение `_status == 'published'`.

Пример в репо: `apps/synestra-io/src/access/authenticatedOrPublished.ts`.

Оговорка при включении drafts на существующей коллекции (см. раздел 4):
- временно добавьте условие “`_status` отсутствует” или массово пересохраните документы, чтобы `_status` проставился.

### 8.3. Если в preview используется `overrideAccess`

В `web-core` в preview‑режиме иногда применяется `overrideAccess: true` (чтобы читать drafts без передачи `req.user` в local API).

Требование безопасности:
- draft mode включается **только** после успешной проверки `payload.auth(...)` в `/next/preview`.

Иначе любой пользователь сможет включить draft mode и увидеть черновики.
