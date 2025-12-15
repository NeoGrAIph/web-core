# План проверки соответствия структуры `web-core` best-practices из `docs/research/research.md`

Этот план нужен, чтобы регулярно проверять, что структура и соглашения репозитория соответствуют best-practices, зафиксированным в `docs/research/research.md`, и не “дрейфуют” в процессе развития.

## 1) Источник критериев

Опираемся на:

- `docs/research/research.md` → разделы:
  - “Что мы должны получить в результате исследования”
  - “Критерии готовности исследования”
  - “Understanding Monorepos / Turborepo Basics” (что означает для `web-core`)

## 2) Чеклист структуры (файлы и директории)

Проверить наличие и смысл:

1) Код и общий код
- `apps/*` — deployable приложения
- `packages/*` и `packages/plugins/*` — общий код/плагины

2) GitOps деплой
- `deploy/` присутствует как “истина GitOps”
- `deploy/argocd/apps/` — ArgoCD Applications (со стороны `web-core`)
- `deploy/charts/` — базовые Helm chart’ы (типовой web-app)
- `deploy/env/<env>/` — values/overlays per-app/per-env (только “не‑секреты”)

3) Исследования/референсы
- `docs/research/templates-research.md` + `docs/research/templates/*` — конспекты шаблонов
- `upstream/` — снапшоты upstream (reference only) + provenance (`upstream/**/README.md`)

4) Документация/процессы
- `docs/notes.md` — полезные факты + открытые вопросы
- `docs/architecture/architecture.md` — нормативная архитектура + взаимодействие с `synestra-platform`
- `docs/architecture/repo-structure.md` — живой документ по структуре
- `docs/runbooks/runbook-dev.md` — команды/порты multi-app dev

## 3) Чеклист tooling (root coordinates, apps implement)

1) Root package.json
- В корне есть scripts через `turbo run <task>`: `dev/build/lint/test`
- Toolchain зафиксирован: `packageManager` (pnpm) + `engines.node`
- DevDependencies минимальны: `turbo` + базовые инструменты форматирования

2) Apps
- В `apps/*/package.json` есть стандартные Next scripts: `dev/build/start/lint`
- Для multi-app dev порты не конфликтуют (например `--port 3000/3001/3002`)

3) Turborepo pipeline
- `turbo.json` в современном формате (`tasks`)
- `build.outputs` покрывает `.next/**` и `dist/**` (+ исключение `!.next/cache/**`)
- `dev.cache=false` и `dev.persistent=true`
- `globalDependencies` включает dev-only env файлы (например `**/.env.*local`)

## 4) Чеклист безопасности (секреты)

- В `web-core` не должно быть plaintext‑секретов:
  - проверить отсутствия `.env`, `*.pem`, `id_rsa`, токенов и т.д.
  - манифесты/values могут содержать только ссылки на `Secret name/key`
- Секреты хранятся централизованно в `~/synestra-platform` (SOPS/age)

## 5) Команды для быстрой проверки (полуавтомат)

Из корня `web-core`:

- Проверка “секретов по тексту”:
  - `rg -n "BEGIN (RSA|OPENSSH) PRIVATE KEY|password\\s*=|token\\s*=|SECRET=" -S .`
- Проверка отсутствия старого scope:
  - `rg -n "@company/" -S .` (должно быть пусто)
- Проверка структуры:
  - `find apps packages deploy -maxdepth 3 -type d | sort`
- Проверка turbo pipeline (после `pnpm install`):
  - `pnpm -r exec pwd`
  - `turbo build --dry-run` (или `--dry=json`)

## 6) Что делать при несоответствии

- Если отсутствует `deploy/` или docs — добавить минимальные заглушки (README + директории), чтобы структура была явной.
- Если root scripts не через `turbo run` — привести `package.json` и `turbo.json` в соответствие.
- Если naming drift (не `@synestra/*`) — поправить `package.json`, `packages/typescript-config/*`, `next.config.*`, импорты в коде.
- Если найдены потенциальные секреты — немедленно удалить из репо и перенести в `synestra-platform` (SOPS).
