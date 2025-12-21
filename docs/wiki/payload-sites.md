# Payload сайты: dev и prod

Краткий справочник по двум стендам Payload CMS, которые используются в web-core.

## Сайты и назначение

| Окружение | Домен | Назначение |
|---|---|---|
| dev | `https://payload.dev.synestra.tech` | Инженерный стенд для разработки и проверки изменений (Okteto, dev-режим). |
| prod | `https://payload.services.synestra.tech` | Боевой стенд для стабильной, воспроизводимой работы (выпускается через GitOps). |

## Общие особенности

- Оба сайта — это Next.js 15 + Payload CMS 3 приложения из монорепозитория `web-core`.
- Админка доступна по `/admin`.
- Источник шаблона: upstream Payload `website` (read-only), далее адаптация под monorepo/web-core.
- Деплой и values находятся в `synestra-platform` (GitOps через ArgoCD).

## dev (`payload.dev.synestra.tech`)

- Развёрнут в Okteto, используется **dev-режим** (`next dev`, `NODE_ENV=development`).
- Предназначен для быстрых итераций: изменения кода видны без пересборки образа.
- Образ собирается в `synestra-platform` через `docker/payload/dev/Dockerfile`.
- Арго‑приложение: `web-payload-dev`.
- Типичные проверки:
  - `/` и `/admin` должны отвечать 200.
  - Dev‑функции (seed, preview) доступны через соответствующие endpoints.

## prod (`payload.services.synestra.tech`)

- Боевой стенд для стабильной работы и демонстраций.
- Деплой и обновления только через GitOps (ArgoCD + values в `synestra-platform`).
- Образ — продовый тег, фиксируется в `values.prod.yaml`.

## Админские и preview endpoints

- `/admin` — админка Payload.
- `/next/preview` — внутренний preview для авторизованных пользователей.
- `/next/share-preview` — внешний share‑preview (для ссылки на черновик).
- `/next/seed` — seed (только для dev, при наличии условий доступа).

## Связанные документы

- `docs/runbooks/runbook-upstream-website-processing-project.md`
- `docs/runbooks/runbook-dev-prod-flow.md`
- `docs/runbooks/runbook-platform-integration.md`
- `../synestra-platform/docs/runbooks/okteto.md`
