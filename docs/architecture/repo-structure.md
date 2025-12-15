# repo-structure.md

Этот документ — «живое» описание структуры монорепозитория `~/repo/web-core` и того, где живут код, общие библиотеки и шаблоны деплоя для Argo CD.

Более полный (нормативный) документ с аргументацией и описанием взаимодействия репозиториев: `docs/architecture/architecture.md`.

## Принципы

- Монорепа для скорости разработки и общего кода, но деплой независимый (несколько deployments).
- На старте используем `dev` + `prod` (а `stage` добавим позже), но структура сразу готова к `dev` → `stage` → `prod`.
- Изоляция: отдельный namespace и отдельная БД на deployment.
- Секреты централизованы в `synestra-platform`; в `web-core` — только «не секретные» значения и ссылки на Secret’ы.
- “Root coordinates, apps implement”: корень репозитория координирует задачи через `turbo run ...`, а внутри `apps/*` остаются стандартные скрипты фреймворков.
- Для воспроизводимости фиксируем toolchain (Node/pnpm) в корневом `package.json` (`engines` + `packageManager`).
- Turborepo-кеширование — часть архитектуры: `turbo.json` должен явно описывать `outputs`, `dependsOn` и правила инвалидации (например `globalDependencies` для dev-only `.env.*local`).
- Базовые версии фреймворков для `apps/*`: Next.js `v15.4.9`, Payload `v3.68.3` (дальше обновляем централизованно и осознанно).

## Предлагаемая структура (пример с несколькими сайтами)

```
web-core/
  apps/
    corporate-website/       # корпоративный сайт (Payload + Next.js)
    ecommerce-store/         # интернет-магазин (Payload template `ecommerce` как референс; BETA)
    saas-webapp/             # SaaS веб-интерфейс (placeholder; появится позже)
    landings/                # группа лендингов (placeholder; один deployment на группу)
    experiments/             # песочница (не деплоим в ArgoCD)

  packages/
    ui/                      # общий UI слой (не привязываем к Tailwind, пока не решим “3 vs 4”)
    cms-core/                # базовые общие коллекции/глобалы/доступы (Users и т.п.)
    cms-blocks/              # общие content blocks (Payload blocks)
    cms-ecommerce/           # ecommerce-специфика (на основе upstream `ecommerce`)
    utils/                   # чистые утилиты (formatDate/slugify/…), без UI/DOM/Next/Payload зависимостей
    typescript-config/       # общий TypeScript config (base/nextjs), подключается через `extends` (опционально)
    eslint-config/           # общий ESLint config (flat config; пока placeholder)

    plugins/
      payload-plugin-multisite/  # плагин-заготовка под мультисайтовость/разделение

  deploy/
    charts/
      web-app/               # базовый Helm chart-шаблон для веб-приложения (Deployment/Service/Ingress/HPA)

    env/
      release-dev/
        corporate.yaml
        shop.yaml
        saas.yaml
        landings.yaml
      release-prod/
        corporate.yaml
        shop.yaml
        saas.yaml
        landings.yaml
      dev/
        corporate.yaml
        shop.yaml
        saas.yaml
        landings.yaml
      stage/
        # заготовка под stage (позже)
      prod/
        # заготовка под prod (позже)

    argocd/
      apps/
        dev/
          corporate.yaml      # ArgoCD Application (dev) для corporate deployment
          shop.yaml           # ArgoCD Application (dev) для shop deployment
          saas.yaml           # ArgoCD Application (dev) для saas deployment
          landings.yaml       # ArgoCD Application (dev) для группы лендингов
        stage/
          # заготовка под stage (позже)
        prod/
          # заготовка под prod (позже)

  # CI/CD заметка:
  # несколько deployments из одной монорепы должны собираться/выкатываться независимо,
  # а CI должен уметь пропускать сборку, если изменения не затронули app или его shared deps (path-based rules / affected packages).
  # Дополнительно: в CI лучше запускать задачи одной командой (например `turbo build lint test`), чтобы Turborepo распараллеливал и использовал кеш.
  # Для ускорения CI нужен режим инкрементального прогона (git-based filtering): `turbo ... --filter=[origin/main]` на MR/ветках и полный прогон на `main`.
  # Для максимальной скорости CI нужен remote turbo cache (общий между CI и разработчиками) + разделение токенов (read-only для CI).

  AGENTS.md                  # правила работы (для агента/ассистента), EN

  docs/
    README.md                # индекс документации
    notes.md                 # быстрые заметки: полезные факты и открытые вопросы
    research/
      research.md            # цели и конспект материалов исследования
      templates-research.md  # индекс исследования официальных шаблонов
      templates/             # отдельные файлы по каждому изученному шаблону
    architecture/
      architecture.md        # архитектура и взаимодействие с synestra-platform
      repo-structure.md      # этот документ (живое описание структуры)
    quality/
      structure-compliance-plan.md  # чеклист соответствия структуре best practices
    runbooks/
      runbook-dev.md         # короткий runbook по multi-app dev
      runbook-dev-deploy-corporate.md  # dev-деплой corporate (ArgoCD+CNPG)

  turbo.json                 # оркестрация задач (build/lint/test) по монорепе
  pnpm-workspace.yaml        # workspace границы (apps/* + packages/*)
  package.json               # корневые скрипты и зависимости тулов
  tsconfig.base.json         # legacy (исторически); базовые TS конфиги живут в `packages/typescript-config/*`

  .vscode/                   # (опционально) editor/workspace настройки (например multi-root workspace для apps и packages)
  turbo/
    generators/              # (опционально) генераторы Turborepo (@turbo/gen) для создания компонентов/пакетов по шаблонам
      config.ts
      templates/

  upstream/                  # снапшоты внешних “официальных” шаблонов/референсов (не для прямого деплоя)
    payload/
      README.md              # provenance: источник + commit снапшота
	      templates/
	        website/             # https://github.com/payloadcms/payload/tree/main/templates/website
	        ecommerce/           # https://github.com/payloadcms/payload/tree/main/templates/ecommerce

  .changeset/                # (опционально) Changesets: versioning + changelog для `packages/*` (даже без публикации в npm)
  .github/
    CODEOWNERS               # (опционально) code ownership/ревью границы (в GitLab тоже применимо как CODEOWNERS)
```

## Как это мапится на deployments

- `corporate` → отдельный Deployment/Service/Ingress в namespace `web-corporate-dev` (условное имя), отдельная БД.
- `shop` → отдельный Deployment/Service/Ingress в namespace `web-shop-dev`, отдельная БД.
- `saas` → отдельный Deployment/Service/Ingress в namespace `web-saas-dev`, отдельная БД.
- `landings` → отдельный Deployment/Service/Ingress в namespace `web-landings-dev`, отдельная БД (или дробление на каждый лендинг позже, если понадобится изоляция).

Примечание по секретам:
- В values/манифестах в `web-core` указываем имена Secret’ов/ключей, но сами Secret’ы создаются и хранятся в `synestra-platform` (через SOPS/age).

Примечание по Turborepo pipeline:
- `turbo.json` должен явно задавать `dependsOn: ["^build"]` и `["^lint"]`.
- Пакеты с исходниками (`packages/ui`, `packages/utils`) должны иметь `scripts.build` (минимум `tsc --noEmit` как typecheck), чтобы участвовать в графе `turbo build` и корректно выступать зависимостями для `apps/*`.
- Тесты: `packages/ui` должен иметь тестовый контур (Vitest + RTL + jsdom), а `turbo.json` должен содержать `test` task (обычно без `dependsOn`) для запуска тестов по workspace и кеширования (при необходимости с `outputs: ["coverage/**"]`).
- Кеш: изменения “глобальных” файлов (например `turbo.json` и root `package.json`) инвалидируют кеш широко; старайся избегать частых точечных правок этих файлов и группировать изменения.
