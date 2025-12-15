# `apps/`

Здесь живут **приложения** монорепозитория — то, что реально запускается как отдельный сайт/веб‑интерфейс.

Базовые принципы (из `docs/research/research.md` и исследований Payload templates):

- **Монорепа для скорости**, но **деплой независимый**: разные сайты выкатываются отдельными ArgoCD `Application`.
- Каждый deployment изолирован: **отдельный namespace + отдельная БД (CNPG)**.
- Приложения строятся на стеке: **Next.js `v15.4.9` + Payload `v3.68.3`**.
- Upstream шаблоны Payload — референс:
  - `website` → базовый паттерн “корпоративного” сайта.
  - `ecommerce` → паттерн магазина (BETA; требует осторожной интеграции).
  См. `docs/research/templates/`.

## Правила для `apps/*`

1) **Один каталог = один Next.js app**, со своим `package.json`, `next.config.*`, `tsconfig.json`, `.env.example`.

2) **Никаких plaintext‑секретов**:
   - в app можно держать `.env.example`,
   - реальные секреты живут в `synestra-platform` и попадают в k8s как `Secret`.

3) Обязательный минимум для каждого app:
   - `src/app/**` (App Router),
   - `src/payload.config.ts` (Payload config),
   - `src/migrations/` (директория под миграции Postgres),
   - `.env.example` (контракт env vars).

4) Для корректного self-hosted деплоя (k8s) учитывайте особенности Payload templates:
   - media uploads пишутся в `public/media` → нужен **PVC** или S3‑storage,
   - preview secret в querystring → нельзя логировать querystring на ingress,
   - миграции должны выполняться **до** старта приложения (Job/Argo hook).

## Связь с GitOps

- Values/оверлеи лежат в `deploy/env/<env>/`.
- ArgoCD `Application` манифесты лежат в `deploy/argocd/apps/<env>/`.

