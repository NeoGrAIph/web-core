# `apps/ecommerce-store`

Интернет‑магазин Synestra (Next.js + Payload).

Основание:
- Payload template `ecommerce` (референс; **BETA**): `upstream/payload/templates/ecommerce`
- Конспект/риски/env vars: `docs/research/templates/payload-ecommerce.md`

## Назначение

- Витрина + админка Payload.
- Отдельный deployment `web-shop-dev` (и позже stage/prod).

## Важные требования из шаблона `ecommerce`

1) **BETA**
- upstream помечает шаблон как BETA → интеграцию делаем осторожно и фиксируем решения в `docs/notes.md`.

2) **Stripe**
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET`.
- Webhooks требуют корректного ingress/route и секретов.
Контракт окружения/секретов: `docs/architecture/env-contract.md`.

3) **Tailwind 4 vs Tailwind 3**
- `ecommerce` использует Tailwind 4.x, `website` — Tailwind 3.x.
- До принятия единого решения избегаем жёсткой зависимости общего UI (`packages/ui`) от конкретного major Tailwind.

## Локальная разработка

- `pnpm --filter @synestra/ecommerce-store dev`
- Пример env vars: `apps/ecommerce-store/.env.example`

## Деплой (GitOps)

- Values: `deploy/env/dev/shop.yaml`
- ArgoCD Application: `deploy/argocd/apps/dev/shop.yaml`
