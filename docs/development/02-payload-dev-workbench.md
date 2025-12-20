# `payload-core` / `payload-dev`: эталонный workbench

## Зачем нужен отдельный payload‑сайт

`apps/payload-core` — это “чистый” эталонный сайт на базе официального Payload Website template.
Он нужен как место, где мы:

- валидируем канон интеграции Payload + Next + Postgres migrations;
- обкатываем shared‑пакеты (`packages/*`), особенно UI и фасады;
- ловим регрессии на нейтральном проекте (без доменной логики `synestra.io`).

## Окружения

- dev: `web-payload-dev` → `https://payload.dev.synestra.tech`
  - здесь ведём разработку.
- prod: `web-payload-core` → `https://payload.services.synestra.tech`
  - стабильный эталонный релиз.

## Что проверяем при изменении shared UI

Минимум:
- главная страница `/`
- админка `/admin` (логин страница не должна падать)
- критичные формы/интерактивы, которые затронуты изменением

## Связанные runbooks

- Okteto dev: `docs/runbooks/runbook-okteto-dev.md`
- Dev/Prod flow: `docs/runbooks/runbook-dev-prod-flow.md`

