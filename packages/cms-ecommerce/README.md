# `@synestra/cms-ecommerce`

Ecommerce‑специфичная CMS‑часть для `shop` deployment.

Основание:
- Payload template `ecommerce` (BETA): `docs/research/templates/payload-ecommerce.md`.

Зачем:
- изолировать нестабильную (BETA) часть схемы от корпоративного сайта и лендингов;
- держать e‑commerce коллекции/хуки/интеграции (Stripe) отдельно.

Правила:
- любые решения по `@payloadcms/plugin-ecommerce` и Stripe фиксировать в `docs/notes.md`;
- внимательно относиться к webhooks (ingress/routes/секреты).

