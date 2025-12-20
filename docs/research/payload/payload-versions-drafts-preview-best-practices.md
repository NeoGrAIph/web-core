# Payload CMS 3: versions/drafts/preview — best practices (конспект для `web-core`)

Цель: собрать практики вокруг редакторского workflow, чтобы:
- черновики не утекали публично;
- preview/live preview работали предсказуемо;
- scheduled publish реально исполнялся (есть jobs runner).

## 1) Versions + Drafts

- `versions` — история изменений, база для preview и аудита.
- `drafts` — вводит `_status: draft|published` и режим чтения `draft: true`.

Официальные источники:
- Versions: https://payloadcms.com/docs/versions/overview
- Drafts: https://payloadcms.com/docs/versions/drafts
- Live preview: https://payloadcms.com/docs/live-preview/overview

## 2) Preview / Draft Mode (Next.js)

- Draft Mode должен включаться только для авторизованного пользователя (через `payload.auth(...)`).
- Preview URL не должен тащить секреты в querystring.

Официальный источник (Next.js Draft Mode): https://nextjs.org/docs/app/api-reference/functions/draft-mode

## 3) Scheduled publish / jobs runner

- `schedulePublish` требует выполнения jobs runner.
- В Kubernetes это оформляется отдельным механизмом (например CronJob, который вызывает endpoint jobs runner с bearer‑секретом).

Официальный источник:
- Scheduled publish (Drafts): https://payloadcms.com/docs/versions/drafts#scheduled-publish
- Jobs queue: https://payloadcms.com/docs/jobs-queue/overview

Связанный нормативный документ в `web-core`:
- `docs/architecture/payload-editor-workflow.md`
